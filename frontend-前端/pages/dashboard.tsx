import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletConnect } from "../components/WalletConnect";
import { useContributionPool } from "../hooks/useContributionPool";
import { useWallet } from "../hooks/useWallet";

interface ContributionSummary {
  id: string;
  title: string;
  amount: string;
  score?: string;
  status: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<ContributionSummary[]>([]);
  const {
    address,
    signer,
    chainId,
    shortAddress,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnect,
  } = useWallet();
  const { round, score, claimed, pending, owner, agentSigner, activities, loading, error: contractError, refresh } =
    useContributionPool(address, signer);

  useEffect(() => {
    const saved = window.localStorage.getItem("cghub-contributions");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">仪表盘</p>
          <h1>贡献与分账管理</h1>
          <p>展示链上 round、贡献、分账和审计事件，支持复盘 Demo 过程。</p>
        </div>
        <div className="header-actions">
          <WalletConnect
            address={address}
            isConnected={isConnected}
            isLoading={isLoading}
            error={error}
            chainId={chainId}
            onConnect={connectWallet}
            onDisconnect={disconnect}
          />
          <Link href="/" className="button secondary">返回贡献页</Link>
        </div>
      </header>

      <section className="panel grid-two">
        <div>
          <div className="panel-header">
            <h2>链上 Round</h2>
          </div>
          <div className="status-grid">
            <div><span>Project/Round</span><strong>1 / 1</strong></div>
            <div><span>Token</span><strong>{round?.token || "-"}</strong></div>
            <div><span>Funded</span><strong>{round?.funded || "0"}</strong></div>
            <div><span>Total Score</span><strong>{round?.totalScore || "0"}</strong></div>
            <div><span>Exists</span><strong>{round?.exists ? "是" : "否"}</strong></div>
            <div><span>Finalized</span><strong>{round?.finalized ? "是" : "否"}</strong></div>
          </div>
        </div>
        <div className="status-box">
          <p>合约读取：{loading ? "加载中..." : contractError || "正常"}</p>
          <p>当前钱包：{address ? shortAddress : "未连接"}</p>
          <p>Owner：{owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "未知"}</p>
          <p>Agent Signer：{agentSigner ? `${agentSigner.slice(0, 6)}...${agentSigner.slice(-4)}` : "未知"}</p>
          <p>我的分数：{score}</p>
          <p>已领取：{claimed}</p>
          <p>可领取：{pending}</p>
          <button className="button secondary" onClick={refresh}>刷新</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>链上审计事件</h2>
        </div>
        <div className="activity-list">
          {activities.length === 0 ? (
            <p>最近区块内暂无事件。</p>
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

      <section className="panel">
        <div className="panel-header">
          <h2>本地提交记录</h2>
        </div>
        {items.length === 0 ? (
          <p>暂无历史记录。请先在首页提交贡献。</p>
        ) : (
          <div className="contribution-list">
            {items.map((item) => (
              <article key={item.id} className="contribution-card">
                <h3>{item.title}</h3>
                <p>金额：{item.amount}</p>
                <p>分数：{item.score || "-"}</p>
                <p>状态：{item.status}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
