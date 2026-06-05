export interface CoboDistributionRequest {
  contributionId: string;
  amount: string;
  note: string;
}

export async function requestCoboDistribution(request: CoboDistributionRequest) {
  // TODO: 这里是 Cobo Agentic Wallet 前端触发点。
  // 真实集成时，请把该函数替换成：
  // 1) 调用 backend /api/cobo/transfer 或直接调用 @cobo/agentic-wallet SDK
  // 2) 提交 Pact 审批请求
  // 3) 返回 Pact approval / tx 状态

  console.debug("Cobo distribution request", request);

  await new Promise((resolve) => setTimeout(resolve, 900));

  return `Cobo 分账请求已发送 (贡献ID=${request.contributionId}, 金额=${request.amount})`;
}
