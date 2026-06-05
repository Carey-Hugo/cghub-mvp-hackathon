# 创客星球(CGHub) MVP 黑客松 · Proposal Memo

> 立项书 v1.0 | 2026-06-03 | Hugo + Hermes
> 归档：`02-projects/cghub-mvp-hackathon/05-proposals/proposal-memo.md`

---

## 一、TL;DR

**用两周时间** + **AI Agent 自主执行链上支付**的能力，**证明 CGHub 的核心闭环可以跑通**：
「贡献记录 → x402 证明 → Cobo Agentic Wallet 自动收益分配」。

- **参赛赛道**：Cobo · Agentic Economy（3500U 奖池）
- **核心命题**：Agent-Native Payments + A2A Economy
- **关键证据**：已跑通 Cobo Agentic Wallet 完整流程（2026-06-03 quickstart，Sepolia 链上 TX `0x28015a...`）

---

## 二、为什么做这个项目

### 2.1 真实问题

Web3 创作者经济长期卡在三个点：
1. **贡献难量化** — 谁做了什么、值多少钱，没法统一记录
2. **分配难执行** — 算清楚了钱，链上转账、Gas 估算、跨链分发，全靠人工
3. **信任难传递** — 中间人抽成、规则不透明、争议无机制

### 2.2 CGHub 的回答

把 **"分配"这个动作** 交给 **AI Agent** 自主执行：
- 贡献者上传任务 → Agent 自动评估价值 → 链上记录 → x402 证明 → 钱包自动分账
- 全程不依赖人工跑腿、人工转账、人工对账
- **人类只在"边界"出现**：策略审批、争议裁决、规则调整

### 2.3 为什么是现在（Why Now）

1. **Cobo Agentic Wallet 2026 上线** — Agent 第一次可以"持 MPC 钱包 + 跑策略 + 自审批"
2. **x402 协议成熟** — HTTP 402 标准化机器付费，Agent 可作为"互联网一等支付公民"
3. **A2A Economy 概念验证窗口** — 多个 Agent 互雇、互付、协作的范式尚未定型

---

## 三、目标用户与场景

### 3.1 一级用户：创客 / 贡献者

**痛点**：贡献做完没人结算，结算完没人打款，打款完没人审计

**CGHub 给的**：贡献提交 → 自动评估 → 自动结算 → 链上凭据

### 3.2 二级用户：项目组织者 / DAO 管理员

**痛点**：分配规则写好但执行不到位，多签耗时间，跨链分发难

**CGHub 给的**：规则即代码，分配即事务，全程可审计

### 3.3 三级用户：黑客松评委 / 生态观察者

**关注点**：Agent 能否真正"自主"操作资金？CAW 是不是资金流程关键组件？

**CGHub 演示**：Sepolia 测试网上，每一步都有 TX hash + 审计日志可查

---

## 四、方案设计

### 4.1 核心架构

```
┌─────────────────┐
│  贡献者（人类）  │ ──上传任务、提交证明
└────────┬────────┘
         ↓
┌─────────────────┐
│  Agent 集群     │ ──评估价值、生成 x402 证明
│  · Recorder     │
│  · Prover       │
│  · Distributor  │
└────────┬────────┘
         ↓
┌─────────────────┐
│  链上存证       │ ──贡献记录合约
│  (Solidity)     │ ──分账规则合约
└────────┬────────┘
         ↓
┌─────────────────┐
│  Cobo Agentic   │ ──MPC 钱包 + Pact 策略
│  Wallet (CAW)   │ ──自动执行转帐
└────────┬────────┘
         ↓
┌─────────────────┐
│  收款方（人类/  │ ──到账通知
│  Agent 钱包）    │ ──链上凭据
└─────────────────┘
```

### 4.2 最小闭环（Demo Day 必跑通）

```
Step 1. 贡献者通过 Telegram / Web 上传一项任务
Step 2. CGHub Recorder Agent 评估价值（模拟：固定 0.01 ETH）
Step 3. 提交至链上 ContributionLedger
Step 4. 自动生成 x402 证明
Step 5. CAW 收到请求，提交 Pact（policy: 单次 0.001 ETH 限额）
Step 6. Pact auto-active（Demo 阶段）
Step 7. Distributor Agent 调用 transferTokens
Step 8. 收款方到账 + 审计日志生成
```

### 4.3 关键差异化

| 维度 | 传统 DAO 分配 | CGHub MVP |
|------|-------------|----------|
| 价值评估 | 投票/委员会 | Agent 自动 + 规则 |
| 链上记账 | 手动调合约 | Agent 自动提交 |
| 转账执行 | 多签人工 | CAW Pact 自动 |
| 审计 | 链上 Event | CAW 审计 + 链上 Event 双重 |
| 争议 | 委员会 | Telegram Bot 推送 + 链上证据 |

---

## 五、目标完成度

### 5.1 Demo Day 必须（Must-have）

- [x] CAW 跑通（2026-06-03 完成）✅
- [ ] ContributionLedger 合约（Solidity）部署到 Monad Testnet
- [ ] Distribution 合约 + 分账规则
- [ ] Agent 端：Recorder + Prover + Distributor（TS SDK）
- [ ] 端到端自动化：一次命令行触发，跑完全流程
- [ ] 录屏 3-5 分钟 + README + 测试网 TX

### 5.2 争取实现（Nice-to-have）

- [ ] MCP Server（11 个工具可调用）
- [ ] React Dashboard（实时看贡献和分账）
- [ ] Telegram Bot（争议裁决 / 审批通知）

### 5.3 不做（Out of Scope）

- ❌ 完整 DAO 治理系统（W2 主线，黑客松后做）
- ❌ 多链跨链分发（聚焦 Sepolia/Monad 单链）
- ❌ KYC / 合规（测试网跑通即可）
- ❌ Mobile App（CAW App 配对阻塞，用 CLI 跑通）

---

## 六、技术选型

| 模块 | 技术 | 理由 |
|------|------|------|
| 链 | **Monad Testnet** | AgentVault 已验证，活跃测试网 |
| 合约 | Solidity + **Foundry** | 测试快、安全、Gas 优化好 |
| 钱包 | **Cobo Agentic Wallet** | 赛道硬性要求 |
| Agent | TypeScript + viem | 与 CAW SDK 同语言 |
| 证明 | x402（HTTP 402） | CAW 内置支持 |
| 前端 | Next.js + wagmi | 与白织前端栈一致 |
| 协作 | Telegram + GitHub | 黑客松默认 |

---

## 七、时间表

| 节点 | 日期 | 完成物 |
|------|------|--------|
| Day 0 (今天) | 6/3 | CAW quickstart ✅、三份立项文档 |
| Day 1-3 | 6/4-6 | 合约骨架、Agent 架构、Foundry 项目初始化 |
| Day 3（第一堆火） | 6/7 | 分工启动、接口对齐 |
| Day 7 | 6/7 | 中间检查点、端到端 demo |
| Day 10 | 6/10 | MVP 完成，全流程串联 |
| Day 13 | 6/13 | README + Demo 视频 + 测试网证据 |
| Day 14 | 6/14 | Demo Day 路演 |

**剩余 11 天**

---

## 八、关键证据（已落地）

### 8.1 Cobo Agentic Wallet 跑通

- 链：Sepolia（SETH）
- Agent ID：`caw_agent_54eeddcfaffb424f`
- Wallet UUID：`3a0bfd41-c5b6-410a-8bfa-0ab09b2199b0`
- ETH 地址：`0xf140fc225dcb2a94475f84a7a5b0b2c3768715c4`
- 合规转帐 TX：`0x28015a0708ebc14aad46e808f9a737fe24d2016384d1eb8ac3941962d92cf09c`
- Policy Deny 验证：HTTP 403, `TRANSFER_LIMIT_EXCEEDED`
- 详细日志：`hackathon/operations-log/02-CAW-Quickstart-2026-06-03.md`

### 8.2 文档体系

- 协作规范：`01-group-norms.md`（v0.6，349 行）
- PRD：`03-PRD/MVP-hackathon-PRD.md`（v1.0，271 行）
- 任务分配：`04-tasks/task-assignment.md`（v1.0，285 行）
- 本提案 + Scope Review + Risk Memo：5 号目录

---

## 九、关键判断

### 9.1 假设（要 Demo 验证）

1. **CAW 可作为 P2P 转账通道**：✅ 已验证（合规 + 拒绝两个场景）
2. **Monad Testnet Foundry 可流畅部署**：⏳ 待白织验证
3. **x402 证明可与 CAW Pact 流程衔接**：⏳ 待大番薯验证
4. **三天内可完成合约骨架 + Agent 集成**：⚠️ 取决于白织和大番薯到位时间

### 9.2 不假设（不赌）

- ❌ 不假设 App 配对能跑通（HarmonyOS 兼容性问题）
- ❌ 不假设 Mumbai 测试网（已弃用）
- ❌ 不假设完整多 Agent 协作（先单 Agent 跑通）
- ❌ 不假设有现场网络（Demo 全预录）

---

## 十、后续计划

- **6/14 之后**：
  - 如果获奖 → 拉团队做完整版（DAO 治理 + 多链 + 移动端）
  - 如果未获奖 → 沉淀为 CGHub W2-G3 实战案例库
  - **无论如何**：CAW 跑通经验 + 完整 PRD + 复盘，进入创客星球知识库

---

> **Tag：** #Proposal #CGHub #Hackathon #Cobo #CAW #A2A #AgenticEconomy
> **关联文档**：
> - `scope-review.md`（本目录）
> - `risk-memo.md`（本目录）
> - `../../03-PRD/MVP-hackathon-PRD.md`
> - `../04-tasks/task-assignment.md`
