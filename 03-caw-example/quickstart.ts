/**
 * CGHub × Cobo Agentic Wallet 最小可运行示例
 * ==========================================
 * 跑通流程：提交 Pact → 等待审批 → 执行转帐 → 触发 Policy 拦截 → 审计日志
 *
 * 适用场景：CGHub MVP 黑客松（Cobo 赛道）
 * 链：Sepolia（ SETH）
 * 政策：单次转帐上限 0.002 ETH，超出则拒绝
 *
 * 使用方法：
 *   1. npm install
 *   2. 复制 .env.example → .env，填入真实 API Key 和 Wallet UUID
 *   3. npm run quickstart
 */

import {
  AuditApi,
  Configuration,
  type PactSpecInput,
  PactsApi,
  TransactionsApi,
} from '@cobo/agentic-wallet';

// ─── 环境变量 ────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const env = {
  basePath:    requireEnv('AGENT_WALLET_API_URL'),
  ownerKey:    requireEnv('AGENT_WALLET_API_KEY'),
  walletUuid:  requireEnv('AGENT_WALLET_WALLET_UUID'),
  destination: process.env.CAW_DESTINATION ?? '0x1111111111111111111111111111111111111111',
};

// ─── 演示常量 ────────────────────────────────────────────────────────────────

const CHAIN_ID       = 'SETH';
const TOKEN_ID       = 'SETH';
const ALLOWED_AMT    = '0.001';      // 合规金额
const DENIED_AMT     = '0.005';      // 超额，会被 Policy 拦截
const DENY_THRESHOLD = '0.002';      // Policy deny 阈值

// ─── Pact 规格 ───────────────────────────────────────────────────────────────

const PACT_SPEC: PactSpecInput = {
  policies: [
    {
      name: 'max-tx-limit',
      type: 'transfer',
      rules: {
        effect: 'allow',
        when: {
          chain_in:  [CHAIN_ID],
          token_in: [{ chain_id: CHAIN_ID, token_id: TOKEN_ID }],
        },
        deny_if: { amount_gt: DENY_THRESHOLD },
      },
    },
  ],
  completion_conditions: [{ type: 'time_elapsed', threshold: '86400' }],
};

// ─── 辅助函数 ────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

async function waitForPactActive(pactsApi: PactsApi, pactId: string): Promise<string> {
  const terminal = new Set(['rejected', 'expired', 'revoked', 'completed']);
  const started  = Date.now();
  let lastStatus: string | undefined;

  for (;;) {
    const pact   = (await pactsApi.getPact(pactId)).data.result;
    const status = pact.status ?? '';

    if (status !== lastStatus) {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      console.log(`      pact status → ${status} (elapsed ${elapsed}s)`);
      lastStatus = status;
    }

    if (status === 'active' && pact.api_key) return pact.api_key;
    if (terminal.has(status)) throw new Error(`Pact reached terminal status: ${status}`);
    await sleep(5_000);
  }
}

function printTx(tag: string, tx: any): void {
  console.log(
    `      ${tag}: tx_id=${tx.id} status=${tx.status} ` +
    `(request_id=${tx.request_id} hash=${tx.transaction_hash ?? '-'})`,
  );
}

// ─── 主流程 ─────────────────────────────────────────────────────────────────

const ownerConfig = new Configuration({ apiKey: env.ownerKey, basePath: env.basePath });
const pactsApi    = new PactsApi(ownerConfig);
const auditApi    = new AuditApi(ownerConfig);

console.log('══════════════════════════════════════════');
console.log(' CGHub × Cobo Agentic Wallet 快速开始');
console.log('══════════════════════════════════════════\n');

console.log(`Wallet UUID : ${env.walletUuid}`);
console.log(`Destination : ${env.destination}`);
console.log(`Chain/Token : ${CHAIN_ID}/${TOKEN_ID}`);
console.log(`Policy      : deny if amount > ${DENY_THRESHOLD}\n`);

// Step 1: 提交 Pact
console.log('[1/5] 提交 Pact（请求转帐权限，超 0.002 ETH 自动拒绝）...');
const pactResp = await pactsApi.submitPact({
  wallet_id: env.walletUuid,
  intent:    'CGHub Agent 贡献奖励转帐',
  spec:      PACT_SPEC,
});
const pactId = pactResp.data.result.pact_id;
console.log(`      Pact 已提交: id=${pactId}\n`);

// Step 2: 等待 Owner 审批（已 Paired 则自动生效）
console.log('[2/5] 等待 Owner 在 Cobo Agentic Wallet App 中审批...');
console.log('      （已 Paired 的 Agent 自动审批，忽略此步骤）\n');
const pactApiKey = await waitForPactActive(pactsApi, pactId);

// Step 3: 切换到 Pact-scoped API Key
console.log('[3/5] Pact 已激活，切换到 pact-scoped API Key');
const txApi = new TransactionsApi(
  new Configuration({ apiKey: pactApiKey, basePath: env.basePath }),
);

// Step 4A: 合规转帐（0.001 ETH → 成功）
console.log(`[4/5] 提交合规转帐: ${ALLOWED_AMT} ETH → ${env.destination}`);
const allowed = (
  await txApi.transferTokens(env.walletUuid, {
    chain_id: CHAIN_ID,
    dst_addr: env.destination,
    token_id: TOKEN_ID,
    amount:   ALLOWED_AMT,
  })
).data.result;
printTx('ALLOWED', allowed);
console.log();

// Step 4B: 超额转帐（0.005 ETH → 被 Policy 拦截）
console.log(`[4/5] 提交超额转帐: ${DENIED_AMT} ETH → ${env.destination}`);
console.log(`      （超出 ${DENY_THRESHOLD} 上限，Policy 应自动拒绝）\n`);
try {
  await txApi.transferTokens(env.walletUuid, {
    chain_id: CHAIN_ID,
    dst_addr: env.destination,
    token_id: TOKEN_ID,
    amount:   DENIED_AMT,
  });
  console.log('      ⚠️  未被拒绝（Policy 配置可能有误）');
} catch (error: any) {
  const resp     = error.response;
  const errBody  = resp?.data?.error;
  console.log(`      ✅ 被正确拒绝: HTTP ${resp?.status ?? '-'}`);
  console.log(`         code=${errBody?.code ?? '-'} reason=${errBody?.reason ?? '-'}`);
  if (errBody?.suggestion) console.log(`         suggestion: ${errBody.suggestion}`);
}

// Step 5: 审计日志
console.log('\n[5/5] 查询审计日志...');
const logs  = await auditApi.listAuditLogs(
  env.walletUuid,
  undefined, undefined, undefined, undefined,
  undefined, undefined, undefined, undefined,
  20,
);
const items     = (logs.data.result as any)?.items ?? [];
const allowedCnt = items.filter((it: any) => it.result === 'allowed').length;
const deniedCnt  = items.filter((it: any) => it.result === 'denied').length;
console.log(`      最近 ${items.length} 条审计记录: allowed=${allowedCnt} denied=${deniedCnt}`);

console.log('\n══════════════════════════════════════════');
console.log(' 快速开始完成');
console.log('══════════════════════════════════════════');
