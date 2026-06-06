import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getPoolReadOnly, getPoolWithSigner } from "../lib/contract";

const PROJECT_ID = Number(process.env.NEXT_PUBLIC_PROJECT_ID || "1");
const ROUND_ID = Number(process.env.NEXT_PUBLIC_ROUND_ID || "1");
const EVENT_LOOKBACK_BLOCKS = Number(process.env.NEXT_PUBLIC_EVENT_LOOKBACK_BLOCKS || "10");

export interface RoundInfo {
  token: string;
  funded: string;
  totalScore: string;
  exists: boolean;
  finalized: boolean;
}

export interface PoolActivity {
  id: string;
  type: "funded" | "contribution" | "finalized" | "claimed";
  title: string;
  detail: string;
  txHash: string;
  blockNumber: number;
}

export function useContributionPool(address?: string | null, signer?: ethers.Signer | null) {
  const [round, setRound] = useState<RoundInfo | null>(null);
  const [score, setScore] = useState<string>("0");
  const [claimed, setClaimed] = useState<string>("0");
  const [pending, setPending] = useState<string>("0");
  const [owner, setOwner] = useState<string>("");
  const [agentSigner, setAgentSigner] = useState<string>("");
  const [activities, setActivities] = useState<PoolActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const readActivities = useCallback(async (pool: ethers.Contract) => {
    try {
      const provider = pool.runner as ethers.Provider;
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - EVENT_LOOKBACK_BLOCKS);
      const filters = (pool as any).filters;

      const [fundedLogs, contributionLogs, finalizedLogs, claimedLogs] = await Promise.all([
        pool.queryFilter(filters.RoundFunded(PROJECT_ID, ROUND_ID), fromBlock, latestBlock),
        pool.queryFilter(filters.ContributionRecorded(PROJECT_ID, ROUND_ID), fromBlock, latestBlock),
        pool.queryFilter(filters.RoundFinalized(PROJECT_ID, ROUND_ID), fromBlock, latestBlock),
        pool.queryFilter(filters.Claimed(PROJECT_ID, ROUND_ID), fromBlock, latestBlock),
      ]);

      const nextActivities: PoolActivity[] = [
        ...fundedLogs.map((log: any) => ({
          id: `${log.transactionHash}-${log.index}`,
          type: "funded" as const,
          title: "Round 已注资",
          detail: `amount=${log.args?.amount?.toString?.() ?? "-"}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...contributionLogs.map((log: any) => ({
          id: `${log.transactionHash}-${log.index}`,
          type: "contribution" as const,
          title: "贡献已记录",
          detail: `${short(log.args?.contributor)} score=${log.args?.score?.toString?.() ?? "-"}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...finalizedLogs.map((log: any) => ({
          id: `${log.transactionHash}-${log.index}`,
          type: "finalized" as const,
          title: "Round 已 finalize",
          detail: `project=${PROJECT_ID} round=${ROUND_ID}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
        ...claimedLogs.map((log: any) => ({
          id: `${log.transactionHash}-${log.index}`,
          type: "claimed" as const,
          title: "分账已领取",
          detail: `${short(log.args?.contributor)} amount=${log.args?.amount?.toString?.() ?? "-"}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
      ].sort((a, b) => b.blockNumber - a.blockNumber);

      setActivities(nextActivities);
    } catch {
      setActivities([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pool = getPoolReadOnly();
      const [roundsResult, ownerResult, signerResult] = await Promise.all([
        pool.rounds(PROJECT_ID, ROUND_ID),
        pool.owner().catch(() => ""),
        pool.agentSigner().catch(() => ""),
      ]);
      setRound({
        token: roundsResult.token,
        funded: roundsResult.funded?.toString() ?? "0",
        totalScore: roundsResult.totalScore?.toString() ?? "0",
        exists: Boolean(roundsResult.exists),
        finalized: Boolean(roundsResult.finalized),
      });
      setOwner(ownerResult);
      setAgentSigner(signerResult);

      if (address) {
        const [scoreResult, claimedResult, pendingResult] = await Promise.all([
          pool.scores(PROJECT_ID, ROUND_ID, address),
          pool.claimed(PROJECT_ID, ROUND_ID, address),
          pool.pending(PROJECT_ID, ROUND_ID, address),
        ]);
        setScore(scoreResult?.toString() ?? "0");
        setClaimed(claimedResult?.toString() ?? "0");
        setPending(pendingResult?.toString() ?? "0");
      } else {
        setScore("0");
        setClaimed("0");
        setPending("0");
      }

      await readActivities(pool);
    } catch (err) {
      console.error(err);
      setError("读取合约数据失败，请检查 Sepolia RPC 和合约地址是否正确。" + (err instanceof Error ? ` ${err.message}` : ""));
    } finally {
      setLoading(false);
    }
  }, [address, readActivities]);

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
    owner,
    agentSigner,
    activities,
    loading,
    error,
    refresh,
    submitContribution,
  };
}

function short(value?: string) {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
