/**
 * MCP 工具：submit-contribution
 * 把签好的 (proof, signature) 上链：编 recordContributionBySig calldata → CAW 钱包发交易。
 * CAW 钱包当 executor（pact 范围内），不需要 executor 私钥。
 */

import { ethers } from 'ethers';
import { z } from 'zod';
import { loadPoolAbi } from '../src/abi.js';
import { contractCall, waitTx } from '../src/executor.js';
import { config } from '../src/config.js';
import type { ContributionProof } from '../src/types.js';

export const submitContributionTool = {
  name: 'submit-contribution',
  description: '把 Agent 签好的贡献 proof 上链（recordContributionBySig），由 CAW 钱包发交易',
  inputSchema: {
    proof: z.record(z.string(), z.string()).describe('sign-contribution 产出的 proof'),
    signature: z.string().describe('EIP-712 签名'),
  },
  async handler(args: { proof: Record<string, string>; signature: string }) {
    const p = args.proof;
    const proof: ContributionProof = {
      projectId: BigInt(p.projectId),
      roundId: BigInt(p.roundId),
      contributor: p.contributor,
      score: BigInt(p.score),
      proofHash: p.proofHash,
      paymentIdHash: p.paymentIdHash,
      nonce: BigInt(p.nonce),
      deadline: BigInt(p.deadline),
    };

    const iface = new ethers.Interface(loadPoolAbi());
    const tuple = [
      proof.projectId, proof.roundId, proof.contributor, proof.score,
      proof.proofHash, proof.paymentIdHash, proof.nonce, proof.deadline,
    ];
    const calldata = iface.encodeFunctionData('recordContributionBySig', [tuple, args.signature]);

    // request-id 用 proofHash 派生，幂等（同一条 proof 重发会被去重）
    const requestId = `record-${proof.proofHash.slice(2, 18)}`;
    const sub = await contractCall(config.chain.poolAddress, calldata, requestId);
    const done = await waitTx(sub.txId);
    return { txId: sub.txId, status: done.status, txHash: done.hash };
  },
};
