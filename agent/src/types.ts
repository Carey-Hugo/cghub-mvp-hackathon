/**
 * 共享类型。字段顺序跟合约 EIP-712 一字不能错（白织说明 9.2）。
 */

/** 合约要的贡献证明结构，签名和上链都用这个 */
export interface ContributionProof {
  projectId: bigint;
  roundId: bigint;
  contributor: string;     // 收款地址，不能零地址
  score: bigint;           // 分数权重，必须 > 0
  proofHash: string;       // bytes32，防重放 key，唯一且非零
  paymentIdHash: string;   // bytes32，挂 x402 支付 id，对账用
  nonce: bigint;           // 参与签名，建议唯一
  deadline: bigint;        // proof 过期时间，unix 秒
}

/** 签好的一条记录，交给执行方上链 */
export interface SignedContribution {
  proof: ContributionProof;
  signature: string;       // 65 bytes EIP-712 签名
}

/** 组装 proof 的业务入参（score 谁定见方案第九节，MVP 先外部传） */
export interface ContributionInput {
  contributor: string;
  score: number;
  source: string;          // 贡献来源，如 github
  evidenceId: string;      // 证据 id，如 pr-123
  paymentId: string;       // 业务支付 id，进 paymentIdHash
  proofSalt?: string;      // proofHash 的盐，不传用默认；需与合约侧约定一致
}

/** x402 支付证明（Cobo payment 返回的精简形态） */
export interface X402Proof {
  paymentId: string;
  status: string;
  retryHeaders?: Record<string, string>;  // 含 PAYMENT-SIGNATURE
}
