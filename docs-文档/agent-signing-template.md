# Agent 端 EIP-712 签名模板（ethers v6）

> 目标：Agent 能在 30 分钟内用 agentSigner 私钥签出 `ContributionProof`
> 场景：HTTP 402 业务层（x402）+ 链上 EIP-712 验签，分工互补
> 截止：6/4 EOD 出第一版

---

## 1. 分工：x402 vs EIP-712

| 层 | 技术 | Agent 做什么 | 合约做什么 |
|----|------|------------|----------|
| **业务层** | x402（HTTP 402 Payment Required） | 生成业务证明、规则评估 score、canonical payload | — |
| **签名层** | EIP-712 | 用 agentSigner 私钥签 `ContributionProof` | 用 `ECDSA.recover` 验签 |
| **链上层** | recordContributionBySig | 调用合约 | 校验签名、累加分数、emit 事件 |

**结论**：Agent 业务层做 x402（灵活、可演进），链上用 EIP-712（标准、安全）。两者不冲突。

---

## 2. 一分钟看懂 EIP-712 签名

```typescript
import { ethers } from "ethers";

const domain = {
  name: "CGHubContributionPool",
  version: "1",
  chainId: 11155111,                              // Sepolia
  verifyingContract: "0x876A0741223EDdaE081Ef22beA513E92335B1Bd5",
};

const types = {
  ContributionProof: [
    { name: "projectId",    type: "uint256" },
    { name: "roundId",      type: "uint256" },
    { name: "contributor",  type: "address" },
    { name: "score",        type: "uint256" },
    { name: "proofHash",    type: "bytes32" },
    { name: "paymentIdHash", type: "bytes32" },
    { name: "nonce",        type: "uint256" },
    { name: "deadline",     type: "uint256" },
  ],
};

const message = {
  projectId: 1,
  roundId: 1,
  contributor: "0xContributorAddress",
  score: 50,
  proofHash: "0x...",        // keccak256(canonicalProofPayload)
  paymentIdHash: "0x...",    // keccak256(paymentId)
  nonce: 1,
  deadline: 1770000000,
};

// 一行签名
const signature = await wallet.signTypedData(domain, types, message);
```

**就这么简单**。别手写 digest，别碰 `abi.encodePacked`，ethers v6 帮你搞定。

---

## 3. 完整代码：sign-contribution.ts

```typescript
// agent-代理/src/sign-contribution.ts
import { ethers } from "ethers";
import crypto from "crypto";

const POOL_ADDRESS = process.env.POOL_ADDRESS!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY!;
const PROJECT_ID = Number(process.env.PROJECT_ID);
const ROUND_ID = Number(process.env.ROUND_ID);

// 1. 业务 payload（x402 业务层）—— 稳定序列化
interface BusinessProof {
  projectId: number;
  roundId: number;
  contributor: string;
  source: string;          // "github" / "notion" / "discord" / ...
  evidenceId: string;      // PR 号 / 任务 ID
  score: number;
  nonce: number;
}

/**
 * 业务 payload 稳定序列化（关键：保证不同语言/不同顺序结果一致）
 */
function canonicalize(obj: any): string {
  // 简单实现：key 字典序 + 紧凑 JSON
  // 生产环境建议用 RFC 8785 (JCS) 或 domain-specific 序列化
  const sorted = Object.keys(obj).sort().reduce((acc, k) => {
    acc[k] = obj[k];
    return acc;
  }, {} as any);
  return JSON.stringify(sorted);
}

/**
 * keccak256 哈希（业务 payload / paymentId）
 */
function hashBytes(text: string): string {
  return ethers.id(ethers.toUtf8Bytes(text)); // 0x...
}

/**
 * 主函数：签 contribution proof
 */
export async function signContribution(
  business: Omit<BusinessProof, "nonce">,
  paymentId: string,
  deadlineSec = 3600
) {
  // 1. 生成唯一 nonce（建议用时间戳 + 随机数）
  const nonce = Date.now() * 1000 + Math.floor(Math.random() * 1000);

  // 2. 算 proofHash / paymentIdHash
  const fullBusiness: BusinessProof = { ...business, nonce };
  const canonicalProofPayload = canonicalize(fullBusiness);
  const proofHash = hashBytes(canonicalProofPayload);
  const paymentIdHash = hashBytes(paymentId);

  // 3. 准备 EIP-712
  const domain = {
    name: "CGHubContributionPool",
    version: "1",
    chainId: CHAIN_ID,
    verifyingContract: POOL_ADDRESS,
  };
  const types = {
    ContributionProof: [
      { name: "projectId",    type: "uint256" },
      { name: "roundId",      type: "uint256" },
      { name: "contributor",  type: "address" },
      { name: "score",        type: "uint256" },
      { name: "proofHash",    type: "bytes32" },
      { name: "paymentIdHash", type: "bytes32" },
      { name: "nonce",        type: "uint256" },
      { name: "deadline",     type: "uint256" },
    ],
  };
  const message = {
    projectId: PROJECT_ID,
    roundId: ROUND_ID,
    contributor: business.contributor,
    score: business.score,
    proofHash,
    paymentIdHash,
    nonce,
    deadline: Math.floor(Date.now() / 1000) + deadlineSec,
  };

  // 4. 签名
  const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY);
  const signature = await wallet.signTypedData(domain, types, message);

  // 5. 自检（强烈建议！失败一次能省 100 次踩坑）
  const recovered = ethers.verifyTypedData(domain, types, message, signature);
  if (recovered.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`签名自检失败: recovered=${recovered}, expected=${wallet.address}`);
  }

  return {
    proof: message,
    signature,
    agentSigner: wallet.address,
  };
}
```

---

## 4. HTTP API 暴露：/api/sign-contribution

```typescript
// agent-代理/src/server.ts
import express from "express";
import { signContribution } from "./sign-contribution";

const app = express();
app.use(express.json());

app.post("/api/sign-contribution", async (req, res) => {
  try {
    const { contributor, source, evidenceId, score, paymentId } = req.body;
    if (!contributor || !source || !evidenceId || !score || !paymentId) {
      return res.status(400).json({ error: "missing fields" });
    }

    const result = await signContribution(
      { projectId: 0, roundId: 0, contributor, source, evidenceId, score },
      paymentId
    );

    res.json(result);
  } catch (err: any) {
    console.error("sign-contribution error", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Agent listening on :3001"));
```

---

## 5. 完整调用链（端到端）

```bash
# 1. 启动 Agent
cd agent-代理
AGENT_PRIVATE_KEY=0x... POOL_ADDRESS=0x876A... \
  CHAIN_ID=11155111 PROJECT_ID=1 ROUND_ID=1 \
  npm run dev

# 2. 前端调 Agent 拿签名
curl -X POST http://localhost:3001/api/sign-contribution \
  -H "Content-Type: application/json" \
  -d '{
    "contributor": "0x73E4...8567",
    "source": "github",
    "evidenceId": "pr-123",
    "score": 50,
    "paymentId": "pay-2026-06-04-001"
  }'

# 返回：
# {
#   "proof": {
#     "projectId": 1, "roundId": 1,
#     "contributor": "0x73E4...8567", "score": 50,
#     "proofHash": "0x...", "paymentIdHash": "0x...",
#     "nonce": 1717430400000, "deadline": 1717434000
#   },
#   "signature": "0x...",
#   "agentSigner": "0xAgentSignerAddress"
# }

# 3. 前端拿 (proof, signature) 调合约
# 任何人都可以提交，不一定是 agentSigner
cast send $POOL_ADDRESS "recordContributionBySig((uint256,uint256,address,uint256,bytes32,bytes32,uint256,uint256),bytes)" \
  "(1,1,0x73E4...8567,50,0x...,0x...,1717430400000,1717434000)" \
  "0x签名" \
  --rpc-url $SEPOLIA_RPC_URL --private-key $SENDER_KEY
```

---

## 6. 5 个最容易踩的坑

### 坑 1：chainId 不一致
- 症状：`InvalidSignature` revert
- 解决：确保 `CHAIN_ID` 和前端链 ID 一致（Sepolia = 11155111）

### 坑 2：types 字段顺序错
- 症状：`InvalidSignature` revert
- 解决：**字段名、类型、顺序必须和合约完全一致**（见合约文档第 9.2 节）

### 坑 3：proofHash 不稳定
- 症状：每次签名结果不同
- 解决：用 `canonicalize()` 字典序序列化，别直接 `JSON.stringify(obj)`（依赖 key 顺序）

### 坑 4：AGENT_PRIVATE_KEY 不对
- 症状：`InvalidSignature` revert
- 解决：用 `cast call $POOL_ADDRESS "agentSigner()(address)"` 查链上 agentSigner，对比本地钱包地址

### 坑 5：deadline 单位
- 症状：合约以为未过期，本地以为过期
- 解决：`deadline` 是 **Unix 秒级时间戳**（不是毫秒！）

---

## 7. 自检 checklist

- [ ] `CHAIN_ID = 11155111`（Sepolia）
- [ ] `POOL_ADDRESS = 0x876A0741223EDdaE081Ef22beA513E92335B1Bd5`
- [ ] `AGENT_PRIVATE_KEY` 对应的钱包地址 = `cast call agentSigner()` 返回值
- [ ] `canonicalize()` 实现稳定（key 字典序）
- [ ] `deadline` 是秒级时间戳
- [ ] 自检 `verifyTypedData` 通过
- [ ] 跑通 `cast send recordContributionBySig` 一条 demo

---

## 8. 30 分钟集成清单

- [ ] 装 `ethers@^6`
- [ ] 配 `.env`（AGENT_PRIVATE_KEY / POOL_ADDRESS / CHAIN_ID / PROJECT_ID / ROUND_ID）
- [ ] 复制 `signContribution()` 函数
- [ ] 写 HTTP 端点 `/api/sign-contribution`
- [ ] 跑一次 curl，拿到 `{ proof, signature, agentSigner }`
- [ ] 用 `cast send` 提交到 Sepolia，验证 `scores()` 累加成功
- [ ] 监听 `ContributionRecorded` 事件确认

---

## 9. x402 业务层如何配合

```typescript
// 业务层 x402 流程（在 sign 之前）
async function evaluateAndSign(req: SignRequest) {
  // 1. 校验业务证据（GitHub PR / Notion 评论 / Discord 消息等）
  const evidence = await verifyEvidence(req.evidenceId);

  // 2. 按规则算 score
  const score = scoringRule(evidence);

  // 3. 生成 paymentId（业务侧唯一）
  const paymentId = `pay-${Date.now()}-${req.contributor.slice(0, 8)}`;

  // 4. 走 EIP-712 签名
  return signContribution(
    { ...req, source: evidence.source, score },
    paymentId
  );
}
```

**Agent 业务层**负责：拉证据 → 算分 → 生成 paymentId
**Agent 签名层**负责：EIP-712 signContribution()
**链上合约**负责：验签 + 累加

---

> 最后更新：2026-06-03 | 维护：Hermes
> 配套：前端 quickstart（`docs-文档/frontend-quickstart.md`）+ 合约接口说明
