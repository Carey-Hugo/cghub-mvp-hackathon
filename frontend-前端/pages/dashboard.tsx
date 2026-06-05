import Link from "next/link";
import { useEffect, useState } from "react";

interface ContributionSummary {
  id: string;
  title: string;
  amount: string;
  status: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<ContributionSummary[]>([]);

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
          <p>展示历史贡献记录，支持复盘 Demo 过程。</p>
        </div>
        <Link href="/">
          <a className="button secondary">返回贡献页</a>
        </Link>
      </header>

      <section className="panel">
        <div className="panel-header">
          <h2>历史记录</h2>
        </div>
        {items.length === 0 ? (
          <p>暂无历史记录。请先在首页提交贡献。</p>
        ) : (
          <div className="contribution-list">
            {items.map((item) => (
              <article key={item.id} className="contribution-card">
                <h3>{item.title}</h3>
                <p>金额：{item.amount}</p>
                <p>状态：{item.status}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
