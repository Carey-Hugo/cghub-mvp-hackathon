<div align="center">

# 🏗️ CGHub Contribution Agent

### AI Agent 自主贡献记录与价值分配 — Agent 记录贡献，Wallet 分配价值

**AI × Web3 Agentic Builders Hackathon — Cobo 赛道参赛项目**

[![Sepolia](https://img.shields.io/badge/Chain-Sepolia-836EF9?logo=ethereum)](https://sepolia.etherscan.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-Protocol-FF6B35?logo=anthropic)](https://modelcontextprotocol.io)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?logo=nextdotjs)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 💡 一句话

> 团队协作产生贡献 → Agent 自动记录评分 → 链上存证 → Cobo Agentic Wallet 自动分配收益。人类只在边界出现。

---

## ✨ 核心亮点

| 亮点 | 说明 |
|------|------|
| 🔗 **链上存证** | 贡献记录上链，EIP-712 签名验证，不可篡改 |
| 🤖 **Agent 原生** | Agent 自主签名贡献证明 → 驱动 CAW 上链 → 自动分账，全流程无需人类操作 |
| 💰 **按分分配** | 贡献者按 score 占比领取 USDC，公式透明：`pending = funded × score / totalScore` |
| 🧩 **MCP 集成** | 4 个 MCP 工具，Claude Code 等 AI 客户端用自然语言即可完成签名→上链→分账 |
| 🔐 **Cobo Agentic Wallet** | 资金操作经 CAW Pact 策略管控，每次 allowed/denied 有审计日志 |
| 📋 **可审计** | 链上事件完整记录每次贡献和领取，任何人可验证 |
| 🖥️ **前端 Dashboard** | Next.js 全功能面板：贡献提交 / 分数查询 / 可领金额 / 一键领取 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     👤 贡献者                                │
│   前端提交贡献信息  ←→  Next.js Dashboard                   │
│   贡献表单 / 分数查询 / 可领金额 / 领取                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ POST /api/sign-contribution
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              🤖 CGHub Agent（TypeScript）                    │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ sign-contribution│  │ submit-contribution│               │
│  │ EIP-712 签名     │──│ CAW 钱包发交易    │               │
│  └────────┬────────┘  └────────┬────────┘                  │
│           ↓                    ↓                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ check-pending    │  │ trigger-claim    │                  │
│  │ 查询可领金额      │──│ CAW 代领分账     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  MCP Server（4 tools）←→ Claude Code / Cursor               │
└──────────────────────┬──────────────────────────────────────┘
                       │ CAW contractCall
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           🏦 Cobo Agentic Wallet（CAW）                      │
│   Pact 策略 → 审批 → 转账 → 审计日志                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ 链上交易
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         📜 ContributionPool 合约（Sepolia 链上）             │
│                                                             │
│  createRound → fundRound → recordContributionBySig          │
│       ↓ EIP-712 验签                                        │
│  累加 score → totalScore                                    │
│       ↓ finalizeRound                                       │
│  claim / claimFor → USDC 到账                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 MCP 工具

| 类别 | 工具 | 说明 |
|------|------|------|
| ✍️ 签名 | `sign-contribution` | Agent 用 EIP-712 签贡献证明（只签不发交易） |
| 📤 上链 | `submit-contribution` | CAW 钱包发 `recordContributionBySig` 上链 |
| 📊 查询 | `check-pending` | 查可领金额 / 分数 / 已领取 |
| 💰 分账 | `trigger-claim` | pending>0 时 CAW 代领，USDC 直达贡献者 |

---

## 🎯 赛道要求全覆盖

| # | 赛道评审维度 | CGHub 实现 |
|---|------------|-----------|
| 1 | **场景贴合度** | Agentic Commerce 真实演示：贡献→评估→分配，Agent 自主完成资金操作 |
| 2 | **CAW 关键性** | CAW 是资金流程核心：Pact 管控 contractCall，每次操作有审计日志 |
| 3 | **资金流程完整度** | 全流程：记录贡献→EIP-712签名→CAW上链→finalize→claimFor 分账 |
| 4 | **可演示性** | MCP 工具 + 前端 Dashboard + CLI 端到端脚本，多方式展示核心流程 |
| 5 | **风险边界说明** | 见 [contract.md](docs-文档/contract.md) 错误码 + [agent-api.md](docs-文档/agent-api.md) 环境变量 |

### 加分特性

| 特性 | 说明 |
|------|------|
| 🔐 EIP-712 签名验证 | Agent 链下签名，合约链上验签，任何人可代提交 |
| 🧩 MCP 协议集成 | 4 个工具注册，AI 客户端自然语言驱动全流程 |
| 🖥️ Next.js Dashboard | 贡献提交 / 分数查询 / 可领金额 / 一键领取 |
| 📋 链上事件审计 | ContributionRecorded / RoundFinalized / Claimed 完整可查 |
| 🔄 CAW Pact 策略 | 转账金额、目标合约受 Pact 范围约束 |

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd cghub-mvp-hackathon

# 2. 安装合约依赖
cd contract
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge build

# 3. 安装 Agent 依赖
cd ../agent
cp .env.example .env
# 编辑 .env 填入 CAW_API_KEY / WALLET_UUID / AGENT_PRIVATE_KEY 等
npm install
npm run build

# 4. 安装前端依赖
cd ../frontend-前端
cp .env.example .env
npm install
npm run dev            # → http://localhost:3000
```

### 各模块启动

```bash
# Agent MCP Server（stdio）
cd agent && npm start

# 前端 Dashboard
cd frontend-前端 && npm run dev

# 合约测试
cd contract && forge test

# 端到端演示
cd agent && npm run demo
```

---

## 🎬 Demo 场景

| 场景 | 说明 | 预期结果 |
|------|------|----------|
| **Scenario 1** | 贡献者提交 → Agent 签名 → CAW 上链 | ✅ ContributionRecorded 事件，分数累加 |
| **Scenario 2** | finalizeRound → 查可领金额 → claim | ✅ USDC 到账，Claimed 事件 |
| **Scenario 3** | 查审计日志 / 链上事件 | 📋 完整贡献记录 + 分配记录 |

```bash
# 端到端演示（详细脚本见 docs-文档/demo-guide.md）
cd agent && npm run demo
```

---

## 📦 已部署合约

| 项目 | 值 |
|------|-----|
| 合约地址 | 待填写 |
| 网络 | Ethereum Sepolia (chainId: 11155111) |
| USDC 地址 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Agent Signer | 待填写 |
| 合约源码 | [`contract/src/ContributionPool.sol`](contract/src/ContributionPool.sol) (257 行) |

---

## 📁 项目结构

```
cghub-mvp-hackathon/
├── README.md                                   # 本文件
├── LICENSE                                     # MIT
├── .gitignore
│
├── contract/                                   # 🔴 智能合约（Solidity/Foundry）
│   ├── src/ContributionPool.sol                # 贡献分账资金池（257行）
│   ├── script/
│   │   ├── Deploy.s.sol                        # 部署脚本
│   │   ├── LocalDemo.s.sol                     # 本地演示
│   │   └── RecordDemoContribution.s.sol         # Demo 贡献记录
│   └── test/MockUSDC.t.sol                     # 合约测试
│
├── agent/                                      # 🔵 AI Agent（TypeScript）
│   ├── src/
│   │   ├── index.ts                            # 端到端入口
│   │   ├── mcp-server.ts                       # MCP Server（4 tools）
│   │   ├── config.ts                           # 环境变量 + EIP-712 常量
│   │   ├── types.ts                            # 共享类型
│   │   ├── contribution-recorder.ts            # EIP-712 贡献签名
│   │   ├── wallet-agent.ts                     # Cobo Wallet 调用
│   │   ├── executor.ts                         # CAW SDK 交易执行
│   │   └── x402-prover.ts                      # x402 证明生成
│   ├── tools/                                  # MCP 工具定义
│   │   ├── sign-contribution.ts
│   │   ├── submit-contribution.ts
│   │   ├── check-pending.ts
│   │   └── trigger-claim.ts
│   └── abi/ContributionPool.abi.json           # 合约 ABI
│
├── frontend-前端/                              # 🟡 前端（Next.js）
│   ├── pages/
│   │   ├── index.tsx                           # 贡献提交页
│   │   ├── dashboard.tsx                       # 管理面板
│   │   └── _app.tsx
│   ├── components/
│   │   ├── ContributionForm.tsx                # 贡献表单
│   │   ├── DistributionView.tsx                # 分配查看
│   │   └── WalletConnect.tsx                   # 钱包连接
│   ├── hooks/
│   │   ├── useCoboWallet.ts                    # Cobo Wallet Hook
│   │   ├── useContributionPool.ts              # 合约交互 Hook
│   │   └── useWallet.ts
│   └── lib/
│       ├── contract.ts                         # 合约连接
│       ├── cobo-sdk.ts                         # Cobo SDK 封装
│       └── agent-api.ts                        # Agent API 调用
│
├── docs-文档/                                  # 📚 项目文档
│   ├── architecture.md                         # 架构文档
│   ├── contract.md                             # 合约文档
│   ├── agent-api.md                            # Agent API/SDK 文档
│   ├── frontend-quickstart.md                  # 前端接入指南
│   ├── agent-signing-template.md               # Agent EIP-712 签名模板
│   ├── deployment.md                           # 部署文档（待填写）
│   ├── demo-guide.md                           # 演示指南（待填写）
│   └── status.md                               # 状态清单（待填写）
│
└── reference-agent-safe-pay/                   # 参考项目 AgentVault
```

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 智能合约 | Solidity 0.8.24 + Foundry |
| 合约库 | OpenZeppelin（Ownable / EIP712 / ECDSA / SafeERC20 / ReentrancyGuard） |
| 链 | Ethereum Sepolia (chainId: 11155111) |
| 代币 | USDC（Circle 官方 Sepolia） |
| 钱包 | Cobo Agentic Wallet（CAW） |
| Agent | TypeScript + ethers.js v6 + @cobo/agentic-wallet SDK |
| MCP Server | @modelcontextprotocol/sdk（stdio 通信） |
| 前端 | Next.js 15 + TypeScript + React |
| 签名 | EIP-712（Agent 链下签 → 合约链上验） |

---

## 📄 合约功能一览

### Owner 操作
- `setAgentSigner(newSigner)` — 更换 Agent 签名地址
- `createRound(projectId, roundId, token)` — 创建分配轮次
- `fundRound(projectId, roundId, amount)` — 注入资金（ERC-20）
- `finalizeRound(projectId, roundId)` — 结算轮次

### 公开操作
- `recordContributionBySig(proof, signature)` — EIP-712 验签 → 累加分数（任何人可代提交）
- `claim(projectId, roundId)` — 贡献者自己领取
- `claimFor(projectId, roundId, contributor)` — 代领（CAW 推荐）

### 查询
- `pending(projectId, roundId, contributor)` — 可领取金额
- `rounds(projectId, roundId)` — Round 信息
- `scores(projectId, roundId, contributor)` — 累计分数
- `claimed(projectId, roundId, contributor)` — 已领取

---

## 📚 文档索引

| 文档 | 说明 |
|------|------|
| [architecture.md](docs-文档/architecture.md) | 系统架构、模块关系、数据流 |
| [contract.md](docs-文档/contract.md) | 合约数据结构、函数、验签流程、错误码 |
| [agent-api.md](docs-文档/agent-api.md) | MCP 工具、SDK 模块、类型定义、环境变量 |
| [frontend-quickstart.md](docs-文档/frontend-quickstart.md) | 前端 30 分钟接入指南 |
| [agent-signing-template.md](docs-文档/agent-signing-template.md) | Agent EIP-712 签名模板 |
| [deployment.md](docs-文档/deployment.md) | 部署文档（待填写） |
| [demo-guide.md](docs-文档/demo-guide.md) | 演示指南（待填写） |
| [status.md](docs-文档/status.md) | 项目状态清单（待填写） |

---

<div align="center">

**Built for AI × Web3 Agentic Builders Hackathon · Cobo Track**

</div>
