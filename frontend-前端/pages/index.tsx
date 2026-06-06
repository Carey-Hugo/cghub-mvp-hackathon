import { useEffect, useState } from "react";
import { ContributionForm } from "../components/ContributionForm";
import { WalletConnect } from "../components/WalletConnect";
import { DistributionView } from "../components/DistributionView";
import { useCoboWallet } from "../hooks/useCoboWallet";
import { useContributionPool } from "../hooks/useContributionPool";
import { useWallet } from "../hooks/useWallet";
import { signContribution, submitContribution } from "../lib/agent-api";

interface ContributionItem {
  id: string;
  title: string;
  amount: string;
  score: string;
  description: string;
  status: "pending" | "submitted" | "distributed";
}

export default function Home() {
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [distributionResult, setDistributionResult] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [claiming, setClaiming] = useState(false);

  const {
    address,
    signer,
    chainId,
    shortAddress,
    isConnected,
    isLoading: walletLoading,
    error: walletError,
    connectWallet,
    disconnect,
  } = useWallet();
  const {
    round,
    score,
    claimed,
    pending,
    owner,
    agentSigner,
    activities,
    loading: contractLoading,
    error: contractError,
    refresh,
  } = useContributionPool(address, signer);
  const { connectCoboWallet, requestDistribution } = useCoboWallet();

  const toScore = (scoreValue: string) => {
    const parsed = Number(scoreValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("贡献分数必须大于 0。");
    }
    return Math.max(1, Math.round(parsed));
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("cghub-contributions");
    if (saved) {
      setContributions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (contributions.length > 0) {
      window.localStorage.setItem("cghub-contributions", JSON.stringify(contributions));
    }
  }, [contributions]);

  const handleSubmit = async (values: {
    title: string;
    amount: string;
    score: string;
    description: string;
  }) => {
    const contributionId = `${Date.now()}`;
    const newContribution: ContributionItem = {
      id: contributionId,
      title: values.title,
      amount: values.amount,
      score: values.score,
      description: values.description,
      status: "pending",
    };

    setContributions((current) => [newContribution, ...current]);
    setDistributionResult("");

    try {
      const contributor = address ?? (await connectWallet());
      if (!contributor) {
        throw new Error("请先连接钱包，Agent 需要你的钱包地址作为贡献者地址。");
      }

      setMessage("正在请求 Agent 签名贡献 proof...");
      const signed = await signContribution({
        contributor,
        score: toScore(values.score),
        source: "frontend",
        evidenceId: contributionId,
        paymentId: `frontend-${contributionId}`,
      });

      setMessage("Agent 已签名，正在由 executor 钱包提交上链...");
      const submitted = await submitContribution(signed);

      setContributions((current) =>
        current.map((item) =>
          item.id === contributionId ? { ...item, status: "submitted" } : item
        )
      );
      setDistributionResult(`贡献已上链：${submitted.txHash}`);
      setMessage("贡献已提交上链，正在刷新链上状态。");
      await refresh();
      setMessage("贡献已提交上链，链上状态已刷新。");
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "贡献提交失败，请检查 Agent API。");
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setDistributionResult("");
    try {
      const contributor = address ?? (await connectWallet());
      if (!contributor) {
        throw new Error("请先连接钱包，Cobo 代领需要贡献者地址。");
      }

      setMessage("正在触发 Cobo CAW claimFor 代领...");
      await connectCoboWallet();
      const result = await requestDistribution({ contributor });
      setDistributionResult(result);
      setMessage("Cobo 代领请求已返回，正在刷新链上状态。");
      await refresh();
      setMessage("链上状态已刷新。");
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Cobo 代领失败，请检查 Agent API / CAW signer。");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">CGHub MVP 黑客松</p>
          <h1>前端火堆：ContributionPool 合约对接</h1>
          <p>目标：读取 Sepolia 合约状态、提交贡献到 Agent，并把签名记录上链。</p>
        </div>
        <WalletConnect
          address={address}
          isConnected={isConnected}
          isLoading={walletLoading}
          error={walletError}
          chainId={chainId}
          onConnect={connectWallet}
          onDisconnect={disconnect}
        />
      </header>

      <section className="panel">
        <div className="panel-header">
          <h2>贡献提交</h2>
          <p>填写贡献内容后，前端会调用 Agent 签名，再由 executor 钱包提交到 ContributionPool。</p>
        </div>
        <ContributionForm onSubmit={handleSubmit} />
      </section>

      <section className="panel grid-two">
        <div>
          <div className="panel-header">
            <h2>链上合约状态</h2>
          </div>
          <div className="status-box">
            <p>{message || "请连接钱包并刷新链上数据。"}</p>
            <p>合约读取：{contractLoading ? "加载中..." : contractError ? contractError : "正常"}</p>
            <p>当前钱包：{address ? shortAddress : "未连接"}</p>
            <p>Owner：{owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "未知"}</p>
            <p>Agent Signer：{agentSigner ? `${agentSigner.slice(0, 6)}...${agentSigner.slice(-4)}` : "未知"}</p>
            <p>当前分数：{score}</p>
            <p>已领取：{claimed}</p>
            <p>可领取：{pending}</p>
            <p>Round 是否存在：{round ? (round.exists ? "是" : "否") : "未知"}</p>
            <p>Round 是否 finalize：{round ? (round.finalized ? "已结束" : "未结束") : "未知"}</p>
            <div className="action-row">
              <button className="button secondary" onClick={refresh}>
                刷新链上数据
              </button>
              <button className="button" onClick={handleClaim} disabled={claiming || !address}>
                {claiming ? "代领中..." : "Cobo 代领"}
              </button>
            </div>
          </div>
        </div>
        <DistributionView result={distributionResult} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>贡献记录</h2>
        </div>
        <div className="contribution-list">
          {contributions.length === 0 ? (
            <p>暂无贡献记录，提交后会在这里显示。</p>
          ) : (
            contributions.map((item) => (
              <article key={item.id} className="contribution-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p>金额：{item.amount}</p>
                <p>分数：{item.score}</p>
                <p>状态：{item.status}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>链上审计日志</h2>
        </div>
        <div className="activity-list">
          {activities.length === 0 ? (
            <p>最近区块内暂无事件。可调大 NEXT_PUBLIC_EVENT_LOOKBACK_BLOCKS 后刷新。</p>
          ) : (
            activities.map((activity) => (
              <article key={activity.id} className="activity-row">
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  #{activity.blockNumber}
                </a>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
