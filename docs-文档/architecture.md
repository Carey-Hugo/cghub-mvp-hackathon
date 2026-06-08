# CGHub 项目架构

## 项目定位

CGHub Contribution Agent 是一个面向 AI 协作团队的贡献记录与价值分配基础设施。核心闭环：

```
团队协作过程 → Agent 记录贡献 → 贡献评分 → EIP-712 签名证明 → 链上存证 → Cobo Agentic Wallet 自动收益分配
```

**一句话：用 Agent 记录贡献，用 Wallet 分配价值。**

---

## 目录结构

```
cghub-mvp-hackathon/
├── contract/                     # 智能合约（Solidity / Foundry）
│   ├── src/ContributionPool.sol            # 贡献分账资金池合约（257行）
│   ├── script/                             # 部署 + Demo 脚本
│   │   ├── Deploy.s.sol                    # 部署脚本
│   │   ├── LocalDemo.s.sol                 # 本地演示
│   │   └── RecordDemoContribution.s.sol     # Demo 贡献记录
│   └── test/MockUSDC.t.sol                 # 合约测试
│
├── agent/                        # AI Agent（TypeScript）
│   ├── src/
│   │   ├── index.ts                        # 端到端入口（自测/录屏用）
│   │   ├── mcp-server.ts                   # MCP Server（4 个工具）
│   │   ├── config.ts                       # 环境变量 + EIP-712 常量
│   │   ├── types.ts                        # 共享类型定义
│   │   ├── contribution-recorder.ts        # 贡献签名模块
│   │   ├── wallet-agent.ts                 # Cobo Wallet 调用
│   │   ├── executor.ts                     # 链上交易执行器（CAW SDK）
│   │   ├── x402-prover.ts                  # x402 证明生成
│   │   ├── http-server.ts                  # HTTP API 服务
│   │   └── abi.ts                          # ABI 加载
│   ├── tools/                              # MCP 工具定义
│   │   ├── sign-contribution.ts            # 签名工具
│   │   ├── submit-contribution.ts          # 上链工具
│   │   ├── check-pending.ts                # 查询工具
│   │   └── trigger-claim.ts                # 分账工具
│   ├── abi/ContributionPool.abi.json       # 合约 ABI
│   └── docs/                               # Agent 方案文档
│
├── frontend-前端/                # 前端（Next.js）
│   ├── pages/
│   │   ├── index.tsx                       # 贡献提交首页
│   │   ├── dashboard.tsx                    # 管理面板
│   │   └── _app.tsx                        # App 入口
│   ├── components/
│   │   ├── ContributionForm.tsx            # 贡献提交表单
│   │   ├── DistributionView.tsx            # 分配查看组件
│   │   └── WalletConnect.tsx               # 钱包连接组件
│   ├── hooks/
│   │   ├── useCoboWallet.ts                # Cobo Wallet Hook
│   │   ├── useContributionPool.ts          # 合约交互 Hook
│   │   └── useWallet.ts                    # 通用钱包 Hook
│   └── lib/
│       ├── contract.ts                     # 合约连接配置
│       ├── cobo-sdk.ts                     # Cobo SDK 封装
│       └── agent-api.ts                    # Agent API 调用
│
├── docs-文档/                    # 项目文档
│   ├── architecture.md                     # 本文件
│   ├── contract.md                         # 合约文档
│   ├── agent-api.md                        # Agent API / SDK 文档
│   ├── frontend-quickstart.md              # 前端接入指南
│   ├── agent-signing-template.md           # Agent EIP-712 签名模板
│   ├── deployment.md                       # 部署文档（完成后填写）
│   ├── demo-guide.md                       # 演示指南（完成后填写）
│   └── status.md                           # 项目状态清单（完成后填写）
│
└── reference-agent-safe-pay/    # 参考项目 AgentVault（前序黑客松作品）
```

---

## 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 区块链 | Ethereum Sepolia (chainId: 11155111) | L1 测试网 |
| 智能合约 | Solidity 0.8.24 + Foundry | 使用 OpenZeppelin 库 |
| 合约依赖 | @openzeppelin/contracts | Ownable, EIP712, ECDSA, SafeERC20, ReentrancyGuard |
| 代币 | USDC (Circle 官方 Sepolia) | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| 钱包 | Cobo Agentic Wallet (CAW) | Pact 策略 + 审计日志 |
| Agent | TypeScript + Node.js | ethers.js v6, @cobo/agentic-wallet SDK |
| MCP Server | @modelcontextprotocol/sdk | 4 个工具，stdio 通信 |
| 前端 | Next.js + TypeScript | React Hooks |
| 签名 | EIP-712 | Agent 链下签名，合约链上验签 |

---

## 模块关系与数据流

```
┌──────────────────────┐
│     贡献者（人类）     │ ── 提交贡献信息
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│     前端 (Next.js)    │ ── 表单收集 → POST Agent API
└──────────┬───────────┘
           ↓
┌──────────────────────────────────────────────────┐
│                 Agent 集群                         │
│                                                    │
│  ┌─────────────────┐  ┌──────────────────────┐   │
│  │ sign-contribution│  │ submit-contribution   │   │
│  │ (EIP-712 签名)   │──│ (CAW 钱包上链)         │   │
│  └────────┬────────┘  └──────────┬───────────┘   │
│           ↓                       ↓                │
│  ┌─────────────────┐  ┌──────────────────────┐   │
│  │ check-pending    │  │ trigger-claim         │   │
│  │ (查询可领金额)    │──│ (CAW 代领分账)         │   │
│  └─────────────────┘  └──────────────────────┘   │
│                                                    │
│  MCP Server ──→ 4 个工具注册给 Claude Code 等客户端 │
└──────────────────────┬───────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│           Cobo Agentic Wallet (CAW)                │
│                                                    │
│  Pact（策略限制）→ 审批 → contractCall → 链上交易   │
│  审计日志（每次 allowed/denied 有记录）              │
└──────────────────────┬───────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│         链上合约 ContributionPool                  │
│                                                    │
│  owner createRound → fundRound                      │
│       ↓                                            │
│  recordContributionBySig(proof, signature)          │
│       ↓ 验签通过                                    │
│  累加 score → 累加 totalScore                       │
│       ↓                                            │
│  owner finalizeRound                                │
│       ↓                                            │
│  contributor claim / CAW claimFor                   │
│       ↓                                            │
│  USDC → 贡献者钱包                                  │
└──────────────────────────────────────────────────┘
```

---

## EIP-712 签名架构

Agent 签名侧和合约验签侧的对应关系：

| 层 | 技术 | 负责方 | 做什么 |
|---|---|---|---|
| 业务层 | x402 (HTTP 402) | Agent | 拉贡献证据→算分→生成 paymentId |
| 签名层 | EIP-712 | Agent | 私钥签 ContributionProof，自检 verifyTypedData |
| 链上层 | ECDSA.recover | 合约 | 验签名→防重放(proofHash)→累加分数 |

**任何人**都可以调用 `recordContributionBySig` 替 Agent 提交上链（发交易方不受限），合约只认 `signer == agentSigner`。

---

## 核心流程（端到端）

```
Step 1. 前端收集贡献信息（contributor / score / source / evidenceId）
Step 2. POST /api/sign-contribution → Agent 用 agentSigner 私钥签 EIP-712
Step 3. 返回 { proof, signature } 给调用方
Step 4. submit-contribution → CAW 钱包发 recordContributionBySig 上链
Step 5. 合约验签通过 → 分数累加到 contributor
Step 6. owner finalizeRound（目前手动）
Step 7. 贡献者 claim() 或 CAW 代领 claimFor()
Step 8. USDC 到账 + 事件可查
```
