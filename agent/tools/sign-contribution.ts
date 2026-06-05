/**
 * MCP 工具：sign-contribution
 * Agent 把一条贡献签成合约认的 proof。只签名，不发交易。
 */

import { z } from 'zod';
import { recordContribution } from '../src/contribution-recorder.js';
import { newPaymentId } from '../src/x402-prover.js';
import type { ContributionInput } from '../src/types.js';

export const signContributionTool = {
  name: 'sign-contribution',
  description: 'Agent 用 agentSigner 私钥把一条贡献签成 EIP-712 ContributionProof（只签不发交易）',
  inputSchema: {
    contributor: z.string().describe('贡献者收款地址'),
    score: z.number().describe('贡献分数（权重）'),
    source: z.string().describe('贡献来源，如 github'),
    evidenceId: z.string().describe('证据 id，如 pr-123'),
    paymentId: z.string().optional().describe('业务支付 id；不传则自动生成'),
  },
  async handler(args: Partial<ContributionInput>) {
    const input: ContributionInput = {
      contributor: args.contributor!,
      score: args.score!,
      source: args.source!,
      evidenceId: args.evidenceId!,
      paymentId: args.paymentId ?? newPaymentId(),
    };
    const signed = await recordContribution(input);
    // bigint 不能直接 JSON 化，转字符串
    return {
      proof: Object.fromEntries(
        Object.entries(signed.proof).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v]),
      ),
      signature: signed.signature,
    };
  },
};
