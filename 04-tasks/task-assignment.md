# CGHub MVP 黑客松 · 任务分配与代码仓库结构

> 版本：**v1.1** | 日期：2026-06-03（晚更新）
> 黑客松周期：2026-06-01 → 2026-06-14（两周）
> 赛道：Cobo · Agentic Economy × Cobo Agentic Wallet
> **v1.1 变更**：合约合并为 ContributionPool；测试网统一 Sepolia；签名机制 x402+EIP-712 分工（详见文末"v1.1 变更说明"）

---

# 一、代码仓库结构

```
creators-galaxy/
└── 02-projects/
    └── cghub-mvp-hackathon/
        ├── contracts-合约/           # 🔴 合约火堆产出
        │   ├── ContributionPool.sol      # 贡献分账资金池（含贡献记录+收益分配，已合并）
        │   ├── interfaces/                # 接口定义
        │   │   └── IContributionPool.sol  # （可选）
        │   ├── test/                      # 合约测试
        │   │   └── ContributionPool.t.sol
        │   ├── scripts/                   # 部署/演示脚本
        │   │   ├── deploy.s.sol
        │   │   └── RecordDemoContribution.s.sol
        │   └── docs/introduce/            # 接口文档 + ABI
        │       ├── ContributionPool.abi.json
        │       └── CGHub-合约接口对接说明.md
        │
        ├── frontend-前端/             # 🟡 前端火堆产出
        │   ├── src/
        │   │   ├── components/           # UI组件
        │   │   │   ├── ContributionForm.tsx
        │   │   │   ├── DistributionView.tsx
        │   │   │   ├── WalletConnect.tsx
        │   │   │   └── AgentStatus.tsx
        │   │   ├── pages/
        │   │   │   ├── index.tsx         # 贡献提交首页
        │   │   │   ├── dashboard.tsx      # 管理面板
        │   │   │   └── agent.tsx         # Agent状态页
        │   │   ├── hooks/                # 自定义hooks
        │   │   │   ├── useCoboWallet.ts
        │   │   │   └── useContribution.ts
        │   │   ├── lib/                  # 工具函数
        │   │   │   └── cobo-sdk.ts       # Cobo SDK封装
        │   │   └── App.tsx
        │   ├── public/
        │   ├── package.json
        │   └── next.config.js
        │
        ├── agent-代理/                # 🔵 Agent火堆产出
        │   ├── src/
        │   │   ├── contribution-recorder.ts   # 贡献记录Agent
        │   │   ├── x402-prover.ts              # x402证明生成
        │   │   ├── wallet-agent.ts             # Cobo Wallet调用
        │   │   ├── mcp-server.ts               # MCP工具服务
        │   │   └── index.ts                    # 入口
        │   ├── tools/                      # MCP工具定义
        │   │   ├── record-contribution.ts
        │   │   ├── generate-proof.ts
        │   │   ├── check-balance.ts
        │   │   └── request-distribution.ts
        │   ├── package.json
        │   └── tsconfig.json
        │
        ├── scripts-脚本/               # 🟢 辅助火堆产出
        │   ├── deploy.ts                # 部署脚本
        │   ├── test-suite.ts            # 测试套件
        │   ├── generate-proof.ts       # 证明生成工具
        │   └── demo-recorder.ts         # Demo录屏辅助
        │
        ├── docs-文档/                  # 全体共享
        │   ├── README.md                # 项目说明
        │   ├── API.md                   # API接口文档
        │   └── QA.md                    # 评委问答
        │
        ├── reference-agent-safe-pay/    # 参考项目（不修改）
        │   ├── contracts-合约/
        │   ├── frontend-前端/
        │   ├── demo-演示/
        │   └── scripts-脚本/
        │
        └── 03-PRD/                     # 需求文档
        └── 04-tasks/                   # 本文件
```

---

# 二、任务分配（按火堆）

## 🔴 合约火堆 · 掌火人：白织

**仓库目录：** `contracts-合约/`

| 文件 | 负责人 | 截止 | 依赖 |
|------|--------|------|------|
| `ContributionLedger.sol` | 白织 | Day3 | - |
| `Distribution.sol` | 白织 | Day5 | ContributionLedger |
| `interfaces/IContributionLedger.sol` | 白织 | Day3 | - |
| `interfaces/IDistribution.sol` | 白织 | Day3 | - |
| `libs/x402verifier.sol` | 白织 | Day5 | x402协议研究 |
| `test/ContributionLedger.t.sol` | 老曹健身版 | Day7 | 合约部署完成 |
| `test/Distribution.t.sol` | 老曹健身版 | Day7 | 合约部署完成 |
| `scripts/deploy.ts` | 白织 + 老曹健身版 | Day5 | 合约完成 |
| **Cobo SDK接入** | 白织 | Day10 | SDK文档 |

### 合约任务详细拆解

**Day 1-3（第一堆火）**
- [ ] 设计贡献记录合约接口（贡献者地址、内容、价值、时间戳）
- [ ] 定义x402证明验证接口
- [ ] 输出`接口文档.md`给前端和Agent对接
- [ ] 部署到测试网，获取合约地址

**Day 4-7（散开燃烧）**
- [ ] 实现收益分配合约（按贡献权重分账）
- [ ] 实现Cobo SDK的pact审批/策略限制逻辑
- [ ] 完成转账和审计日志功能
- [ ] 编写测试用例（老曹健身版）

**Day 8-10（第二堆火）**
- [ ] 集成Cobo Agentic Wallet SDK
- [ ] 端到端测试：贡献→记录→证明→分账全流程
- [ ] 部署到主测试网，获取tx hash

---

## 🟡 前端火堆 · 掌火人：老实人

**仓库目录：** `frontend-前端/`

| 文件 | 负责人 | 截止 | 依赖 |
|------|--------|------|------|
| Next.js项目初始化 | 老实人 | Day3 | - |
| `pages/index.tsx`（贡献提交） | 老实人 | Day5 | 合约接口 |
| `pages/dashboard.tsx`（管理面板） | 老实人 | Day7 | 合约接口 |
| `components/WalletConnect.tsx` | loong | Day5 | Cobo SDK |
| `components/ContributionForm.tsx` | Fox | Day5 | 合约接口 |
| `components/DistributionView.tsx` | loong | Day7 | 合约接口 |
| `hooks/useCoboWallet.ts` | 老实人 | Day7 | Cobo SDK |
| `lib/cobo-sdk.ts` | 白织 | Day8 | Cobo SDK |

### 前端任务详细拆解

**Day 1-3（第一堆火）**
- [ ] 初始化Next.js + TypeScript项目
- [ ] 确定UI框架和组件库
- [ ] 搭建项目结构（参考仓库结构）
- [ ] 对接合约火堆接口文档

**Day 4-7（散开燃烧）**
- [ ] 完成贡献提交表单UI
- [ ] 实现MetaMask/Cobo Wallet连接
- [ ] 完成分配合成界面
- [ ] 集成Cobo SDK前端支付UI（白织提供）

**Day 8-10（第二堆火）**
- [ ] 前端 + 合约全流程对接
- [ ] 展示贡献记录和分账结果
- [ ] 准备Demo录屏素材

---

## 🔵 Agent火堆 · 掌火人：大番薯

**仓库目录：** `agent-代理/`

| 文件 | 负责人 | 截止 | 依赖 |
|------|--------|------|------|
| `contribution-recorder.ts` | 大番薯 | Day5 | 合约接口 |
| `x402-prover.ts` | 大番薯 | Day7 | x402协议 |
| `wallet-agent.ts` | 大番薯 + mini Quan | Day7 | Cobo SDK |
| `mcp-server.ts` | 大番薯 | Day7 | MCP SDK |
| `tools/record-contribution.ts` | 大番薯 | Day5 | 合约 |
| `tools/generate-proof.ts` | mini Quan | Day7 | x402 |
| `tools/request-distribution.ts` | 大番薯 | Day7 | 合约 |

### Agent任务详细拆解

**Day 1-3（第一堆火）**
- [ ] 设计Agent架构（贡献触发→记录→证明→分账）
- [ ] 确认x402证明输出格式
- [ ] 研究Cobo Agentic Wallet接入方式
- [ ] 输出Agent方案文档给合约和前端

**Day 4-7（散开燃烧）**
- [ ] 实现贡献记录Agent逻辑
- [ ] 实现x402证明生成
- [ ] 实现MCP Server工具（11个工具参考AgentVault）
- [ ] 实现Cobo Wallet调用（mini Quan协助）

**Day 8-10（第二堆火）**
- [ ] 全流程串联：贡献→证明→Cobo Wallet→分账
- [ ] 端到端自动化演示
- [ ] 验证Agent持有钱包、自己发起分配

---

## 🟢 辅助火堆 · 掌火人：老曹健身版

**仓库目录：** `scripts-脚本/` + `docs-文档/`

| 文件 | 负责人 | 截止 | 依赖 |
|------|--------|------|------|
| `scripts/test-suite.ts` | 老曹健身版 | Day7 | 合约部署 |
| `scripts/demo-recorder.ts` | 老曹健身版 | Day13 | 前端完成 |
| `docs/README.md` | 老曹健身版 + 全体 | Day13 | 全部完成 |
| `docs/API.md` | 白织 + 大番薯 | Day10 | 合约+Agent完成 |
| `docs/QA.md` | 老曹健身版 + 全体 | Day13 | Demo完成 |

### 辅助任务详细拆解

**Day 1-3（第一堆火）**
- [ ] 熟悉项目架构和代码库
- [ ] 制定测试计划
- [ ] 了解Cobo SDK测试方法

**Day 4-7（散开燃烧）**
- [ ] 编写合约单元测试
- [ ] 编写集成测试
- [ ] 追踪和记录Bug

**Day 8-10（第二堆火）**
- [ ] 全流程测试
- [ ] 辅助脚本开发（部署、证明生成）
- [ ] bc_tools协助简单任务

**Day 11-14（第三堆火）**
- [ ] Demo录屏辅助脚本
- [ ] README + 操作指南
- [ ] QA文档（评委可能问的技术问题）
- [ ] 协助各火堆修复问题

---

# 三、接口对接表（关键依赖）

```
合约火堆（白织）
    │
    ├─ 接口文档 ─────────────────→ 前端火堆（老实人）：贡献提交UI
    │                                └─ 合约地址 + ABI → frontend/lib
    │
    ├─ 接口文档 ─────────────────→ Agent火堆（大番薯）：贡献记录Agent
    │                                └─ 合约地址 + ABI → agent/tools
    │
    └─ Cobo SDK ─────────────────→ 前端火堆：支付UI（白织提供）
         └─ Cobo SDK ─────────────→ Agent火堆：Wallet调用（大番薯）

前端火堆（老实人）← ─ ─ ─ ─ ─ → Agent火堆（大番薯）
   UI状态同步        贡献触发 + 证明查询
```

**关键接口（必须Day3确定）：**
1. `recordContribution(address contributor, string memory content, uint256 value)` → tx hash
2. `generateProof(contributionId)` → x402 proof string
3. `requestDistribution(contributionId)` → 触发Cobo Wallet

---

# 四、Git提交规范

```
[contracts] 新增/修改 合约功能
[frontend] 新增/修改 前端功能
[agent] 新增/修改 Agent功能
[docs] 新增/修改 文档
[test] 新增/修改 测试用例
[chore] 杂项（依赖、配置）
```

---

# 五、里程碑检查点

| 日期 | 里程碑 | 通过标准 |
|------|--------|---------|
| Day 3（6/7） | 第一堆火烧完 | 合约骨架+接口文档 ✅ 前端初始化 ✅ Agent方案 ✅ |
| Day 7（6/7） | 中间检查点 | 合约可部署 ✅ 前端Demo可用 ✅ Agent流程跑通 ✅ |
| Day 10（6/10） | MVP完成 | 全流程串联 ✅ Cobo Wallet对接 ✅ |
| Day 13（6/13） | Demo提交 | README ✅ Demo视频 ✅ 测试网验证 ✅ |
| Day 14（6/14） | Demo Day | 路演+评审 |

---

*文档状态：v1.1 | 最后更新：2026-06-03（Hermes 补位）*
*归档位置：creators-galaxy/02-projects/cghub-mvp-hackathon/04-tasks/*

---

# 附录：v1.1 变更说明（2026-06-03 晚）

## 变更 1：合约合并为 ContributionPool

**v1.0 设计**：
- `ContributionLedger.sol`（贡献记录）
- `Distribution.sol`（收益分配）
- `x402verifier.sol` 库

**v1.1 实际交付**：
- `ContributionPool.sol`（合并实现，含贡献记录+分账+claim）
- 签名机制改用 EIP-712（OpenZeppelin EIP712）

**为什么合并**：
- 当前 MVP 单一合约更简单、gas 更省、接口更清晰
- EIP-712 是 Web3 行业标准，可读性比 x402 自定义库好
- 联调压力小，2 周 MVP 周期内可交付

**v1.0 任务分配表的调整**：

| v1.0 任务 | v1.1 实际 | 说明 |
|----------|----------|------|
| `ContributionLedger.sol` | → 合并入 `ContributionPool.sol` | 函数名调整为 `recordContributionBySig` |
| `Distribution.sol` | → 合并入 `ContributionPool.sol` | 函数名调整为 `fundRound` / `finalizeRound` / `claim` / `claimFor` |
| `IContributionLedger.sol` | — | 当前 MVP 不需要接口隔离 |
| `IDistribution.sol` | — | 同上 |
| `x402verifier.sol` | → 改用 EIP-712 | Agent 业务层仍可做 x402，链上验签 EIP-712（见分工） |

## 变更 2：测试网统一 Sepolia

**v1.0 文档**：`Polygon Mumbai`（前端文档）
**v1.1 实际**：`Ethereum Sepolia`（合约已部署）

**为什么**：
- 合约组用 Sepolia，USDC 地址 `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` 是 **Circle 官方 Sepolia USDC**
- Mumbai 的 USDC 测试基础设施不如 Sepolia 完善
- Sepolia 是当前 L1 测试网主流

**前端调整**：
- `chainId = 11155111`（不是 80001/80002）
- RPC 改用 Sepolia 节点（Infura/Alchemy 都支持）
- 已部署的 Cobo CAW 测试钱包可能需要重新配置链

## 变更 3：签名机制 x402 + EIP-712 分工

**v1.0 设计**：x402verifier 库验签
**v1.1 实际**：EIP-712 + x402 分工

| 层 | 技术 | 负责方 |
|----|------|--------|
| 业务层 | x402（HTTP 402 Payment Required） | Agent |
| 签名层 | EIP-712（agentSigner 私钥签 ContributionProof） | Agent |
| 链上层 | `ECDSA.recover` 验签 | 合约 |

**Agent 业务层**生成 canonical payload → **Agent 签名层**做 EIP-712 → **合约**验签 + 累加

## 变更 4：数据模型 score 优先

**v1.0 隐含**：前端填"贡献金额"
**v1.1 实际**：合约按 `score` 比例分账（`pending = funded * myScore / totalScore`）

**前端调整**：
- 贡献表单增加"贡献分数"字段（或由 Agent 算分）
- 详见 `docs-文档/frontend-quickstart.md` 第 5.3 节

---

# 附录：Hermes 补位工作登记（透明化）

| 时间 | 补位事项 | 受影响火堆 | 通知掌火人 |
|------|---------|-----------|-----------|
| 2026-06-03 22:00 | 起草 `docs-文档/frontend-quickstart.md` | 🟡 前端 | ✅ 已 DM 同步 |
| 2026-06-03 22:00 | 起草 `docs-文档/agent-signing-template.md` | 🔵 Agent | ✅ 已 DM 同步 |
| 2026-06-03 22:00 | 更新 task-assignment.md 到 v1.1 | 🔴 合约 | ✅ 群内公告同步 |
| 2026-06-03 22:00 | 起草 4 个 DM 催办模板（6/4 12:00 触发） | 全部 | — |

**原则**：补位完成必须 30 分钟内告知掌火人，避免"被抢活"误解。