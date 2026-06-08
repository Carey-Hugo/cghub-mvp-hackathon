# Agent API / MCP 工具文档

> Agent 是 CGHub 的核心中间层，负责贡献签名、链上交互和收益分配。
>
> 技术栈：TypeScript + ethers.js v6 + @cobo/agentic-wallet SDK + @modelcontextprotocol/sdk

---

## 一、MCP 工具（4 个）

MCP Server 文件：`agent/src/mcp-server.ts`，stdio 通信。支持 Claude Code / Cursor 等 MCP 客户端直接调用。

### 1. sign-contribution

Agent 用 agentSigner 私钥把一条贡献签成 EIP-712 ContributionProof。**只签名，不发交易。**

| 属性 | 值 |
|------|-----|
| MCP 工具名 | `sign-contribution` |
| 对应文件 | `agent/tools/sign-contribution.ts` |

**输入参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contributor` | string (address) | 是 | 贡献者收款地址 |
| `score` | number | 是 | 贡献分数（权重） |
| `source` | string | 是 | 贡献来源，如 `"github"` |
| `evidenceId` | string | 是 | 证据 ID，如 `"pr-123"` |
| `paymentId` | string | 否 | 业务支付 ID；不传则自动生成 |

**返回值：**

```json
{
  "proof": {
    "projectId": "1",
    "roundId": "1",
    "contributor": "0x...",
    "score": "50",
    "proofHash": "0x...",
    "paymentIdHash": "0x...",
    "nonce": "1717430400000",
    "deadline": "1717434000"
  },
  "signature": "0x..."
}
```

---

### 2. submit-contribution

把 Agent 签好的 (proof, signature) 上链。**由 CAW 钱包发交易**（pact 范围内），不需要单独 executor 私钥。

| 属性 | 值 |
|------|-----|
| MCP 工具名 | `submit-contribution` |
| 对应文件 | `agent/tools/submit-contribution.ts` |

**输入参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `proof` | object | 是 | `sign-contribution` 产出的 proof |
| `signature` | string | 是 | EIP-712 签名 |

**返回值：**

```json
{
  "txId": "caw-tx-uuid",
  "status": "success",
  "txHash": "0x..."
}
```

---

### 3. check-pending

查询贡献者在当前轮的可领金额、已得分、已领取。**只读 RPC，不发交易。**

| 属性 | 值 |
|------|-----|
| MCP 工具名 | `check-pending` |
| 对应文件 | `agent/tools/check-pending.ts` |

**输入参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contributor` | string (address) | 是 | 贡献者地址 |

**返回值：**

```json
{
  "pending": "50000000",    // 可领取 USDC（最小单位）
  "score": "50",            // 累计分数
  "claimed": "0"            // 已领取
}
```

---

### 4. trigger-claim

pending > 0 时驱动 CAW 钱包调用 `claimFor` 代领分账。钱从 ContributionPool → contributor，CAW 钱包只是调用方（出 gas）。

| 属性 | 值 |
|------|-----|
| MCP 工具名 | `trigger-claim` |
| 对应文件 | `agent/tools/trigger-claim.ts` |

**输入参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contributor` | string (address) | 是 | 贡献者地址 |

**返回值：**

```json
{
  "txId": "caw-tx-uuid",
  "status": "success",
  "txHash": "0x...",
  "pending": "50000000"
}
```

如果 pending 为 0，返回：

```json
{ "skipped": true, "reason": "pending 为 0，无可领金额" }
```

---

## 二、SDK 核心模块

### contribution-recorder（贡献签名）

文件：`agent/src/contribution-recorder.ts`

| 函数 | 说明 |
|------|------|
| `buildProof(input)` | 组装 ContributionProof（含 proofHash、paymentIdHash 计算） |
| `signProof(proof)` | 用 agentSigner 私钥签 EIP-712 |
| `selfVerify(proof, signature)` | 自检：恢复地址 == agentSigner |
| `recordContribution(input)` | 一步到位：组装 + 签名 + 自检 |

### wallet-agent（Cobo Wallet 调用）

文件：`agent/src/wallet-agent.ts`

| 方法 | 说明 |
|------|------|
| `checkPending(contributor)` | 读合约 pending()（只读 RPC） |
| `claimForContributor(contributor)` | CAW 钱包调 claimFor 代领 |

### executor（链上交易执行器）

文件：`agent/src/executor.ts`

| 函数 | 说明 |
|------|------|
| `contractCall(contract, calldata, requestId)` | CAW SDK 发合约调用，返回 txId |
| `waitTx(txId, timeoutMs)` | 轮询交易直到上链确认（默认 120s 超时） |

---

## 三、EIP-712 常量

文件：`agent/src/config.ts`

```typescript
// Domain
const EIP712_DOMAIN = {
  name: "CGHubContributionPool",
  version: "1",
  chainId: 11155111,          // Sepolia
  verifyingContract: "<POOL_ADDRESS>",
};

// Types（字段顺序锁死，和合约 CONTRIBUTION_TYPEHASH 一致）
const EIP712_TYPES = {
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
```

---

## 四、关键类型定义

文件：`agent/src/types.ts`

```typescript
interface ContributionProof {
  projectId: bigint;
  roundId: bigint;
  contributor: string;
  score: bigint;
  proofHash: string;       // bytes32，防重放 key
  paymentIdHash: string;   // bytes32，对账锚点
  nonce: bigint;
  deadline: bigint;        // Unix 秒
}

interface ContributionInput {
  contributor: string;
  score: number;
  source: string;          // 贡献来源，如 "github"
  evidenceId: string;      // 证据 id，如 "pr-123"
  paymentId: string;       // 业务支付 id
  proofSalt?: string;      // proofHash 的盐，默认 "demo-proof"
}
```

---

## 五、环境变量

文件：`agent/.env.example`

| 变量 | 说明 |
|------|------|
| `AGENT_WALLET_API_URL` | CAW API 地址（默认 `https://api.agenticwallet.cobo.com`） |
| `AGENT_WALLET_API_KEY` | CAW API Key |
| `AGENT_WALLET_WALLET_UUID` | CAW 钱包 UUID |
| `COBO_CHAIN_ID` | 链标识（Sepolia = `SETH`） |
| `CAW_PACT_ID` | Pact ID（覆盖目标合约的 active pact） |
| `CAW_SRC_ADDRESS` | CAW 钱包 EVM 地址 |
| `AGENT_PRIVATE_KEY` | Agent 签名私钥（须等于链上 agentSigner()） |
| `POOL_ADDRESS` | ContributionPool 合约地址 |
| `USDC_ADDRESS` | USDC 代币地址 |
| `CHAIN_ID` | 链 ID（Sepolia = `11155111`） |
| `SEPOLIA_RPC_URL` | Sepolia RPC 节点 |
| `PROJECT_ID` | 项目 ID |
| `ROUND_ID` | 轮次 ID |

---

## 六、端到端调用示例

### 通过 MCP 工具（Claude Code 对话）

```
用户：帮我给 0x1234... 记录一条 github pr-42 贡献，50 分

Agent 内部调用链：
1. sign-contribution(contributor=0x1234..., score=50, source="github", evidenceId="pr-42")
   → 返回 { proof, signature }
2. submit-contribution(proof, signature)
   → 返回 { txHash: "0x..." }
3. check-pending(contributor=0x1234...)
   → 返回 { pending: "0", ... }（Round 未 finalize）
```

### 通过命令行

```bash
# 1. 签贡献
curl -X POST http://localhost:3001/api/sign-contribution \
  -H "Content-Type: application/json" \
  -d '{"contributor":"0x1234...","score":50,"source":"github","evidenceId":"pr-42"}'

# 2. submit（拿返回的 proof + signature）
# 3. owner finalizeRound（Foundry cast 或前端）
# 4. claim
```

---

## 七、当前工具覆盖状态

| 工具 | 状态 | 说明 |
|------|------|------|
| `sign-contribution` | ✅ 可用 | EIP-712 签名 |
| `submit-contribution` | ✅ 可用 | CAW 钱包上链 |
| `check-pending` | ✅ 可用 | 只读查询 |
| `trigger-claim` | ✅ 可用 | CAW 代领分账 |
| `pay-x402` | 🔜 待实现 | x402 微支付 |
| `finalize-round` | 🔜 待实现 | Owner 结算 |
| `get-audit` | 🔜 待实现 | 审计日志查询 |
