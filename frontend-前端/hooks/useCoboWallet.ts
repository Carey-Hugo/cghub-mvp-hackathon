import { useCallback, useState } from "react";
import { requestCoboDistribution } from "../lib/cobo-sdk";

interface DistributionRequest {
  contributionId: string;
  amount: string;
  note: string;
}

export function useCoboWallet() {
  const [isCoboReady, setIsCoboReady] = useState(false);

  const connectCoboWallet = useCallback(async () => {
    // 这里可以扩展为真正的 Cobo Agentic Wallet 连接逻辑。
    setIsCoboReady(true);
    return true;
  }, []);

  const requestDistribution = useCallback(
    async (request: DistributionRequest) => {
      if (!isCoboReady) {
        throw new Error("Cobo Wallet 未连接");
      }

      const result = await requestCoboDistribution({
        contributionId: request.contributionId,
        amount: request.amount,
        note: request.note,
      });
      return result;
    },
    [isCoboReady]
  );

  return {
    isCoboReady,
    connectCoboWallet,
    requestDistribution,
  };
}
