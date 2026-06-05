# 前端接入 ContributionPool 合约 · Quickstart

> 目标：前端能在 30 分钟内跑通"提交贡献 → Agent 签名 → 上链 → 查询分数"完整 demo
> 测试网：Ethereum Sepolia
> 截止：6/5 EOD 必须跑通

---

## 1. 一分钟看懂合约做什么

```
owner 创建 round  →  出资方 fund  →  Agent EIP-712 签 ContributionProof
                                          ↓
                            recordContributionBySig(proof, signature)
                                          ↓
                                  分数累加到 contributor
                                          ↓
                            owner finalizeRound()  →  contributor claim() / claimFor()
```

**核心交互**：
- 前端负责 **UI + 钱包连接 + 查询**（rounds/scores/pending/claimed）
- Agent 负责 **EIP-712 签名**（不直接发交易）
- 任何人都可以**代发交易**调用 `recordContributionBySig`，合约只认 signature

---

## 2. 5 分钟环境准备

### 2.1 安装依赖

```bash
cd frontend-前端
npm install ethers@^6
# 可选：viem（更轻量，签名更简洁）
npm install viem@^2
```

### 2.2 环境变量

```bash
# .env.local
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_POOL_ADDRESS=0x876A0741223EDdaE081Ef22beA513E92335B1Bd5
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_PROJECT_ID=1
NEXT_PUBLIC_ROUND_ID=1
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 2.3 复制 ABI

把 `docs/introduce/ContributionPool.abi.json` 复制到 `frontend-前端/src/lib/abi/ContributionPool.json`，然后：

```typescript
// src/lib/abi/index.ts
import ContributionPoolABI from "./ContributionPool.json";
export { ContributionPoolABI };
```

---

## 3. 5 行代码拿到合约实例

```typescript
// src/lib/contract.ts
import { ethers } from "ethers";
import { ContributionPoolABI } from "./abi";

const POOL_ADDRESS = process.env.NEXT_PUBLIC_POOL_ADDRESS!;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID!);

export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL, CHAIN_ID);
}

export function getPoolReadOnly() {
  return new ethers.Contract(POOL_ADDRESS, ContributionPoolABI, getProvider());
}

export function getPoolWithSigner(signer: ethers.Signer) {
  return new ethers.Contract(POOL_ADDRESS, ContributionPoolABI, signer);
}
```

---

## 4. 5 个查询函数（只读，前端展示用）

```typescript
// src/hooks/useContribution.ts
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getPoolReadOnly } from "@/lib/contract";

const PROJECT_ID = Number(process.env.NEXT_PUBLIC_PROJECT_ID);
const ROUND_ID = Number(process.env.NEXT_PUBLIC_ROUND_ID);

// 1. Round 状态
export function useRound() {
  const [round, setRound] = useState(null);
  useEffect(() => {
    getPoolReadOnly().rounds(PROJECT_ID, ROUND_ID).then(setRound);
  }, []);
  return round;
  // returns: { token, funded, totalScore, exists, finalized }
}

// 2. 我的贡献分
export function useMyScore(address: string | undefined) {
  const [score, setScore] = useState("0");
  useEffect(() => {
    if (!address) return;
    getPoolReadOnly().scores(PROJECT_ID, ROUND_ID, address).then(setScore);
  }, [address]);
  return score;
}

// 3. 我已领取
export function useMyClaimed(address: string | undefined) {
  const [claimed, setClaimed] = useState("0");
  useEffect(() => {
    if (!address) return;
    getPoolReadOnly().claimed(PROJECT_ID, ROUND_ID, address).then(setClaimed);
  }, [address]);
  return claimed;
}

// 4. 我可领取（核心！前端主展示）
export function useMyPending(address: string | undefined) {
  const [pending, setPending] = useState("0");
  useEffect(() => {
    if (!address) return;
    getPoolReadOnly().pending(PROJECT_ID, ROUND_ID, address).then(setPending);
  }, [address]);
  return pending;
}
```

---

## 5. 提交贡献：前端只做"打包 + 转发"

### 5.1 整体流程

```
用户填表（标题/金额/说明）
    ↓
前端 POST 给 Agent 后端：/api/sign-contribution
    ↓
Agent 用 agentSigner 私钥签 EIP-712，返回 signature
    ↓
前端调 recordContributionBySig(proof, signature) 上链
    ↓
监听 ContributionRecorded 事件 → 刷新分数
```

### 5.2 前端调用 recordContributionBySig

```typescript
// src/hooks/useSubmitContribution.ts
import { useState } from "react";
import { ethers } from "ethers";
import { getPoolWithSigner } from "@/lib/contract";

export function useSubmitContribution() {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function submit(proof: any, signature: string, signer: ethers.Signer) {
    setLoading(true);
    try {
      const pool = getPoolWithSigner(signer);
      const tx = await pool.recordContributionBySig(proof, signature);
      setTxHash(tx.hash);
      await tx.wait(); // 等待 1 个确认
      return tx.hash;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, txHash };
}
```

### 5.3 proof 字段怎么填

| 字段 | 来源 | 示例 |
|------|------|------|
| `projectId` | 环境变量 | `1` |
| `roundId` | 环境变量 | `1` |
| `contributor` | 当前连接钱包地址 | `0x73E4...8567` |
| `score` | **由 Agent 算**（前端不直接算） | `50` |
| `proofHash` | `keccak256(canonicalProofPayload)` | `0x...` |
| `paymentIdHash` | `keccak256(paymentId)` | `0x...` |
| `nonce` | Agent 生成（保证唯一） | `Date.now()` |
| `deadline` | 当前时间 + 1 小时 | `Math.floor(Date.now()/1000) + 3600` |

**前端要做的**：调用 Agent API 拿 `(proof, signature)`，自己只算 `contributor` 和 `deadline`。

---

## 6. 用户领取（Cobo CAW 推荐用 claimFor）

```typescript
// 自己领
async function claimSelf(signer: ethers.Signer) {
  const pool = getPoolWithSigner(signer);
  const tx = await pool.claim(PROJECT_ID, ROUND_ID);
  return tx.wait();
}

// Cobo 代领（推荐）
async function claimFor(contributor: string, coboSigner: ethers.Signer) {
  const pool = getPoolWithSigner(coboSigner);
  // 1. 先查 pending
  const pending = await pool.pending(PROJECT_ID, ROUND_ID, contributor);
  if (pending === 0n) throw new Error("无可领取金额");
  // 2. 代领
  const tx = await pool.claimFor(PROJECT_ID, ROUND_ID, contributor);
  return tx.wait();
}
```

---

## 7. 监听合约事件

```typescript
// 监听贡献记录成功
useEffect(() => {
  const pool = getPoolReadOnly();
  const filter = pool.filters.ContributionRecorded(null, null, myAddress);
  pool.on(filter, (projectId, roundId, contributor, score, proofHash, paymentIdHash) => {
    console.log("新贡献记录", { contributor, score: score.toString() });
    // 刷新我的分数
  });
  return () => { pool.removeAllListeners(filter); };
}, [myAddress]);

// 监听 round finalize
const finalizeFilter = pool.filters.RoundFinalized(null, null);
pool.on(finalizeFilter, (projectId, roundId) => {
  // 切到"可领取"状态 UI
});
```

---

## 8. Custom Error 处理（用户体验）

合约用 custom error，不是 `require` 字符串。前端要把错误翻译成人话：

```typescript
// src/lib/errors.ts
export function decodePoolError(err: any): string {
  const data = err?.data?.data || err?.error?.data?.data;
  if (!data || !data.startsWith("0x")) return "交易失败";
  const selector = data.slice(0, 10);

  const errors: Record<string, string> = {
    "0x": "ContributionPool__InvalidSigner: Agent signer 无效",
    // ... 见 docs/introduce/CGHub-合约接口对接说明.md 第 12 节
  };
  return errors[selector] || `未知错误 (${selector})`;
}
```

---

## 9. 30 分钟跑通 Demo 清单

- [ ] 复制 ABI 到 `src/lib/abi/ContributionPool.json`
- [ ] 配好 `.env.local`（Sepolia RPC + 合约地址）
- [ ] 安装 `ethers@^6`
- [ ] 写 `getProvider` / `getPoolReadOnly` / `getPoolWithSigner`
- [ ] 写 4 个 useHook：useRound / useMyScore / useMyClaimed / useMyPending
- [ ] 用 cast 跑一条 demo 贡献，验证前端能读到分数
- [ ] 接入 Agent API `/api/sign-contribution` 拿 (proof, signature)
- [ ] 调 `recordContributionBySig` 上链，看到 ContributionRecorded 事件
- [ ] 监听事件 + 刷新 UI

---

## 10. 常见问题

**Q：前端要自己算 score 吗？**
A：不要。score 由 Agent 算（基于业务数据 + 规则），前端只把"贡献标题/金额/说明"传给 Agent，Agent 决定多少分。

**Q：proofHash 怎么算？**
A：`keccak256(toUtf8Bytes(canonicalProofPayload))`，payload 是稳定序列化后的 JSON（见合约文档第 9.3 节）。建议**统一在 Agent 端算**，前端只传业务字段。

**Q：必须用 ethers v6 吗？**
A：推荐 v6（v5 的 `signTypedData` 有 bug）。用 viem 也行，更轻量。

**Q：transaction hash 在哪查？**
A：https://sepolia.etherscan.io/tx/0x...

---

> 最后更新：2026-06-03 | 维护：Hermes
> 配套：合约接口说明（`docs/introduce/CGHub-合约接口对接说明.md`）
