import { useState } from "react";

interface ContributionFormProps {
  onSubmit: (values: {
    title: string;
    amount: string;
    score: string;
    description: string;
  }) => Promise<void>;
}

export function ContributionForm({ onSubmit }: ContributionFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [score, setScore] = useState("50");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, amount, score, description });
      setTitle("");
      setAmount("0.01");
      setScore("50");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <label>
        贡献标题
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例如：提交贡献记录"
          required
        />
      </label>
      <label>
        贡献金额
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          step="0.01"
          min="0.001"
          required
        />
      </label>
      <label>
        贡献分数
        <input
          value={score}
          onChange={(event) => setScore(event.target.value)}
          type="number"
          step="1"
          min="1"
          required
        />
      </label>
      <label>
        贡献说明
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="例如：完成 ContributionLedger 合约接口对接"
          rows={4}
          required
        />
      </label>
      <button className="button primary" type="submit" disabled={submitting}>
        {submitting ? "提交中..." : "提交贡献"}
      </button>
    </form>
  );
}
