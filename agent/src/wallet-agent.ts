/**
 * 模块 3：Cobo Agentic Wallet 调用
 * 分账走 CAW 钱包：读 pending（只读 RPC）→ caw tx call 调 claimFor。
 * CAW 钱包是 executor（在 CAW_PACT_ID 的 pact 范围内发交易），不需要单独 executor 私钥。
 */

import { ethers } from 'ethers';
import { loadPoolAbi } from './abi.js';
import { contractCall, waitTx } from './executor.js';
import { config } from './config.js';

export class WalletAgent {
  /** 读合约 pending()，判断有没有可领。只读 RPC，不经 CAW */
  async checkPending(contributor: string): Promise<bigint> {
    const provider = new ethers.JsonRpcProvider(config.chain.rpcUrl);
    const pool = new ethers.Contract(config.chain.poolAddress, loadPoolAbi(), provider);
    return pool.pending(config.round.projectId, config.round.roundId, contributor);
  }

  /**
   * pending>0 时让 CAW 钱包调 claimFor 代领。
   * 钱从 ContributionPool → contributor，CAW 钱包只是调用方（出 gas）。
   */
  async claimForContributor(contributor: string): Promise<{ txId: string; status: string; hash?: string }> {
    const iface = new ethers.Interface(loadPoolAbi());
    const calldata = iface.encodeFunctionData('claimFor', [
      config.round.projectId,
      config.round.roundId,
      contributor,
    ]);
    const requestId = `claim-${config.round.projectId}-${config.round.roundId}-${contributor.slice(2, 10)}`;
    const sub = await contractCall(config.chain.poolAddress, calldata, requestId);
    const done = await waitTx(sub.txId);
    return { txId: sub.txId, status: done.status, hash: done.hash };
  }
}
