/**
 * 入口：把各块串起来跑端到端，用于自测和 Demo 录屏（不依赖 MCP 客户端）。
 *
 * 全流程（前提：owner 已 createRound + fundRound；CAW 已 onboard 且 CAW_PACT_ID 配好）：
 *   1. sign   : agentSigner 链下签贡献 proof
 *   2. submit : CAW 钱包发 recordContributionBySig 上链
 *   3.（owner finalizeRound —— 不在本脚本，白织/手动）
 *   4. claim  : pending>0 → CAW 钱包调 claimFor 分账
 */

import { recordContribution } from './contribution-recorder.js';
import { newPaymentId } from './x402-prover.js';
import { WalletAgent } from './wallet-agent.js';
import { submitContributionTool } from '../tools/submit-contribution.js';
import type { ContributionInput } from './types.js';

async function main() {
  const demoContributor = '0x00000000000000000000000000000000deadbeef'; // TODO 换成真实贡献者

  // 1. 签贡献
  const input: ContributionInput = {
    contributor: demoContributor,
    score: 50,
    source: 'github',
    evidenceId: 'pr-123',
    paymentId: newPaymentId(),
  };
  const signed = await recordContribution(input);
  console.log('[1] 已签名 proof：', signed.proof.proofHash);

  // 2. CAW 钱包上链
  const proofStr = Object.fromEntries(
    Object.entries(signed.proof).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v]),
  ) as Record<string, string>;
  const rec = await submitContributionTool.handler({ proof: proofStr, signature: signed.signature });
  console.log('[2] 上链：', rec);

  // 3. finalize 由 owner 做，跳过
  console.log('[3] 等 owner finalizeRound（不在本脚本）');

  // 4. 分账
  const agent = new WalletAgent();
  const pending = await agent.checkPending(demoContributor);
  console.log('[4] pending =', pending.toString());
  if (pending > 0n) {
    const res = await agent.claimForContributor(demoContributor);
    console.log('[4] claimFor：', res);
  }
}

main().catch((e) => {
  console.error('端到端失败：', e);
  process.exit(1);
});
