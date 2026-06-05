/**
 * MCP 工具：check-pending
 * 查贡献者在某轮的可领金额 / 分数 / 已领。只读，不发交易。
 */

import { ethers } from 'ethers';
import { z } from 'zod';
import { loadPoolAbi } from '../src/abi.js';
import { config } from '../src/config.js';

export const checkPendingTool = {
  name: 'check-pending',
  description: '查贡献者可领金额(pending)、分数(scores)、已领(claimed)',
  inputSchema: {
    contributor: z.string().describe('贡献者地址'),
  },
  async handler(args: { contributor: string }) {
    const provider = new ethers.JsonRpcProvider(config.chain.rpcUrl);
    const pool = new ethers.Contract(config.chain.poolAddress, loadPoolAbi(), provider);
    const { projectId, roundId } = config.round;

    const [pending, score, claimed] = await Promise.all([
      pool.pending(projectId, roundId, args.contributor),
      pool.scores(projectId, roundId, args.contributor),
      pool.claimed(projectId, roundId, args.contributor),
    ]);

    return {
      pending: pending.toString(),
      score: score.toString(),
      claimed: claimed.toString(),
    };
  },
};
