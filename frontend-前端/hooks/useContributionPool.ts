import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getPoolReadOnly, getPoolWithSigner } from "../lib/contract";

const PROJECT_ID = Number(process.env.NEXT_PUBLIC_PROJECT_ID || "1");
const ROUND_ID = Number(process.env.NEXT_PUBLIC_ROUND_ID || "1");

export interface RoundInfo {
  token: string;
  funded: string;
  totalScore: string;
  exists: boolean;
  finalized: boolean;
}

export function useContributionPool(address?: string | null, signer?: ethers.Signer | null) {
  const [round, setRound] = useState<RoundInfo | null>(null);
  const [score, setScore] = useState<string>("0");
  const [claimed, setClaimed] = useState<string>("0");
  const [pending, setPending] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pool = getPoolReadOnly();
      const roundsResult = await pool.rounds(PROJECT_ID, ROUND_ID);
      setRound({
        token: roundsResult.token,
        funded: roundsResult.funded?.toString() ?? "0",
        totalScore: roundsResult.totalScore?.toString() ?? "0",
        exists: Boolean(roundsResult.exists),
        finalized: Boolean(roundsResult.finalized),
      });

      if (address) {
        const [scoreResult, claimedResult, pendingResult] = await Promise.all([
          pool.scores(PROJECT_ID, ROUND_ID, address),
          pool.claimed(PROJECT_ID, ROUND_ID, address),
          pool.pending(PROJECT_ID, ROUND_ID, address),
        ]);
        setScore(scoreResult?.toString() ?? "0");
        setClaimed(claimedResult?.toString() ?? "0");
        setPending(pendingResult?.toString() ?? "0");
      }
    } catch (err) {
      console.error(err);
      setError("读取合约数据失败，请检查 Sepolia RPC 和合约地址是否正确。" + (err instanceof Error ? ` ${err.message}` : ""));
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitContribution = useCallback(
    async (proof: unknown, signature: string) => {
      if (!signer) {
        throw new Error("钱包未连接，无法发起合约调用。请先连接钱包。{}");
      }
      const pool = getPoolWithSigner(signer);
      const tx = await pool.recordContributionBySig(proof, signature);
      await tx.wait();
      await refresh();
      return tx.hash as string;
    },
    [refresh, signer]
  );

  return {
    round,
    score,
    claimed,
    pending,
    loading,
    error,
    refresh,
    submitContribution,
  };
}
