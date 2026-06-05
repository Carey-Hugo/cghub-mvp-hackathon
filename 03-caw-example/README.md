# CGHub × Cobo Agentic Wallet (CAW) 最小示例

> CGHub MVP 黑客松 **Cobo 赛道**必读：Agent 资金操作必须通过 CAW 完成

## 这是什么

CAW 是 Cobo Agentic Wallet 的缩写。

CGHub 跑通「贡献 → Agent 记录 → x402 证明 → 收益分配」闭环时，**支付层**必须用 CAW，不能自己写合约模拟。

## 文件结构

```
03-caw-example/
├── quickstart.ts       # ⭐ 核心：跑通「提交Pact→审批→转帐→Policy拦截→审计」
├── .env.example        # 环境变量模板
├── README.md           # 本文件
└── examples/           # 扩展示例（黑客松期间补充）
    ├── transfer.ts     # 标准 ERC-20 转帐
    └── x402-payment.ts # x402 微支付（CGHub 核心场景）
```

## 5 分钟快速开始

### 1. 安装依赖

```bash
cd 03-caw-example
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入以下值（来自 [Cobo Agentic Wallet](https://www.cobo.com/agentic-wallet) 控制台）：

| 变量 | 获取方式 |
|------|---------|
| `AGENT_WALLET_API_URL` | 固定写 `https://api.agenticwallet.cobo.com` |
| `AGENT_WALLET_API_KEY` | 控制台 → Agents → 创建 Agent → 复制 API Key |
| `AGENT_WALLET_WALLET_ID` | 控制台 → Wallets → 创建/选择钱包 → 复制 UUID |

### 3. 运行

```bash
npm run quickstart
```

### 4. 预期输出

```
[1/5] 提交 Pact（请求转帐权限，超 0.002 ETH 自动拒绝）...
      Pact 已提交: id=<pact-id>
[2/5] 等待 Owner 在 Cobo Agentic Wallet App 中审批...
      pact status → active (elapsed 0s)
[3/5] Pact 已激活，切换到 pact-scoped API Key
[4/5] 提交合规转帐: 0.001 ETH → 0x111...111
      ALLOWED: tx_id=<tx-id> status=400 (Processing) ...
[4/5] 提交超额转帐: 0.005 ETH → 0x111...111
      ✅ 被正确拒绝: HTTP 403 code=policy_denied ...
[5/5] 查询审计日志...
      最近 2 条审计记录: allowed=1 denied=1
```

## 核心概念 3 分钟速通

### Pact（承诺协议）

Agent 要执行链上操作前，先提交 Pact，说明"我要做什么 + 有什么限制"。

```
{
  policies: [              // 政策：什么能做，什么不能做
    { type: 'transfer', deny_if: { amount_gt: '0.002' } }
  ],
  completion_conditions: [{ type: 'time_elapsed', threshold: '86400' }]
  //                    ↑ 24小时后自动终止，不需要了就过期
}
```

Owner 在 App 里审阅后 approve，Agent 拿到「pact-scoped API Key」才能操作。

### Policy Deny（政策拦截）

Agent 尝试超额转帐时，CAW 在**服务器端**直接拒绝，不上链。Agent 捕获错误后可以 retry 或通知用户。

### 审计日志

每一次允许/拒绝都有记录，Owner 随时可查。

```
allowed=1 denied=1
```

## CGHub 里的角色

| CGHub 角色 | 对应 CAW 概念 |
|-----------|-------------|
| 贡献者 | 转帐 recipient |
| CGHub Agent | CAW Agent（持 pact-scoped API Key） |
| 钱包Owner（你） | Cobo App 中审批 Pact 的人 |
| 收益分配 | CAW transferTokens() |

## x402 支付（进阶）

x402 是「按次付多少就付多少」的微支付协议，CGHub 计划用它做贡献证明到收益分配的结算。

在 Base Sepolia 上用法：

```typescript
// CAW 内置 x402 支持
// 用 caw fetch 调用 x402-enabled 端点，自动处理支付
// 详见 examples/x402-payment.ts（后续补充）
```

## 踩坑提醒

1. **没钱包先创建**：控制台创建钱包 → 往里充 Sepolia ETH（用 faucet）→ 再操作
2. **pact 要先批**：未 Paired 的 Agent 提交 Pact 自动生效；已 Paired 的需要 Owner 在 App 里点批准
3. **Policy deny 不上链**：拒绝操作不会产生链上交易，审计日志里只记 denied
4. **gwei 别太高**：Sepolia 测试网 gas 低，0.001 ETH 已够跑很多次

## 官方文档

- SDK 文档：`https://cobo.com/products/agentic-wallet/manual/developer/api-client-typescript.md`
- Recipes：`https://agenticwallet.cobo.com/agentic-wallet/recipes`
- 本仓库规范：`../01-group-norms.md`（Cobo 赛道规则章节）
