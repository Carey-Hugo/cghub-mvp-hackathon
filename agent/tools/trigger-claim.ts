/**
 * MCP 工具：trigger-claim
 * 驱动 Cobo 通过 contractCall 调 claimFor，把分账打给贡献者。
 * 钱从 ContributionPool → contributor，Cobo 调用方不碰钱。
 */

import { z } from 'zod';
import { WalletAgent } from '../src/wallet-agent.js';

export const triggerClaimTool = {
  name: 'trigger-claim',
  description: 'pending>0 时驱动 Cobo 代领分账（contractCall → claimFor）',
  inputSchema: {
    contributor: z.string().describe('贡献者地址'),
  },
  async handler(args: { contributor: string }) {
    const agent = new WalletAgent();

    const pending = await agent.checkPending(args.contributor);
    if (pending <= 0n) {
      return { skipped: true, reason: 'pending 为 0，无可领金额' };
    }

    const res = await agent.claimForContributor(args.contributor);
    return { txId: res.txId, status: res.status, txHash: res.hash, pending: pending.toString() };
  },
};
