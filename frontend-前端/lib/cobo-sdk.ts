import { triggerClaim } from "./agent-api";

export interface CoboDistributionRequest {
  contributor: string;
}

export async function requestCoboDistribution(request: CoboDistributionRequest) {
  const result = await triggerClaim(request.contributor);

  if (result.skipped) {
    return `Cobo 代领已跳过：${result.reason || "当前没有可领取金额"}`;
  }

  return `Cobo 代领请求已提交：${result.txId || "无 txId"}，状态：${result.status || "submitted"}`;
}
