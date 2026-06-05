/**
 * 链上交易执行器：用 Cobo SDK + api_key 让 CAW 钱包发交易。
 * SDK 负责向 CAW 提交 contractCall；真正的 CAW 钱包交易签名仍需要对应钱包的
 * 本地 cobo-tss-node signer 在线，否则交易会停在 Processing/signing。
 *
 * 用 pact 的 scoped api_key 发交易（CAW_PACT_ID 指向一个覆盖目标合约的 active pact）。
 */

import {
  Configuration,
  PactsApi,
  TransactionsApi,
  TransactionRecordsApi,
} from '@cobo/agentic-wallet';
import { config } from './config.js';

let txApi: TransactionsApi | undefined;
let recApi: TransactionRecordsApi | undefined;

async function ensureApis(): Promise<void> {
  if (txApi && recApi) return;
  const base = config.cobo.basePath;
  const pact = (
    await new PactsApi(new Configuration({ apiKey: config.cobo.apiKey, basePath: base })).getPact(config.caw.pactId)
  ).data.result as any;
  if (pact.status !== 'active') throw new Error(`pact 非 active(${pact.status})，检查 CAW_PACT_ID`);
  const scoped = new Configuration({ apiKey: pact.api_key ?? config.cobo.apiKey, basePath: base });
  txApi = new TransactionsApi(scoped);
  recApi = new TransactionRecordsApi(scoped);
}

/** 发一笔合约调用，返回 txId（record uuid） */
export async function contractCall(contract: string, calldata: string, requestId: string): Promise<{ txId: string }> {
  if (!config.caw.pactId) throw new Error('缺 CAW_PACT_ID');
  if (!config.caw.srcAddress) throw new Error('缺 CAW_SRC_ADDRESS（CAW 钱包地址）');
  await ensureApis();
  const res = (
    await txApi!.contractCall(config.cobo.walletUuid, {
      chain_id: config.caw.chainId,
      contract_addr: contract,
      calldata,
      src_addr: config.caw.srcAddress,
      value: '0',
      request_id: requestId,
    } as any)
  ).data.result as any;
  return { txId: res.id as string };
}

/** 轮询交易直到上链确认，返回 tx hash */
export async function waitTx(txId: string, timeoutMs = 120_000): Promise<{ status: string; hash?: string }> {
  await ensureApis();
  const start = Date.now();
  for (;;) {
    // SDK 的 status 是数字码，用 status_display 字符串判断（success/failed/broadcasting...）
    const r = (await recApi!.getUserTransaction(config.cobo.walletUuid, txId)).data.result as any;
    const disp = String(r.status_display ?? '').toLowerCase();
    if (disp === 'success') return { status: disp, hash: r.transaction_hash as string };
    if (disp === 'failed' || disp === 'rejected') throw new Error(`tx ${disp}`);
    if (Date.now() - start > timeoutMs) throw new Error(`tx ${txId} 等待超时(最后状态 ${disp})`);
    await new Promise((res) => setTimeout(res, 5000));
  }
}
