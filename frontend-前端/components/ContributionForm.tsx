import { useState } from "react";

interface ContributionFormProps {
  onSubmit: (values: {
    title: string;
    amount: string;
    description: string;
  }) => Promise<void>;
}

export function ContributionForm({ onSubmit }: ContributionFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, amount, description });
    setSubmitting(false);
    setTitle("");
    setAmount("0.01");
    setDescription("");
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
