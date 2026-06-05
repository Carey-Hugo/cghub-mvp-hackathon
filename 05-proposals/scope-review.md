# 创客星球(CGHub) MVP 黑客松 · Scope Review

> 范围评审 v1.0 | 2026-06-03 | Hugo + Hermes
> 归档：`02-projects/cghub-mvp-hackathon/05-proposals/scope-review.md`

---

## 一、评审目的

两周时间内，**做哪些、不做哪些、用什么节奏做**，需要和团队对齐。

Scope Review 解决三个问题：
1. **边界明确** — 什么算"完成"，什么算"超范围"
2. **优先级清晰** — 当冲突时砍哪一项保哪一项
3. **节奏可执行** — 11 天倒计时，每一天该出什么东西

---

## 二、In-Scope（明确做）

### 2.1 必须完成（M0 — Demo Day 前必须有）

| ID | 模块 | 验收标准 | 责任火堆 | 截止 |
|----|------|---------|----------|------|
| M0-1 | Cobo Agentic Wallet 集成 | Pact 提交 + 转账 + Policy 拒绝有日志 | Agent | ✅ Day 1 (6/3) |
| M0-2 | ContributionLedger 合约 | 部署到 Monad Testnet，含 recordContribute 函数 | 合约 | Day 5 (6/8) |
| M0-3 | Distribution 合约 | 部署到 Monad Testnet，含 distribute 函数 | 合约 | Day 7 (6/10) |
| M0-4 | x402 证明生成器 | TypeScript 函数，输入贡献 ID 输出证明 JSON | Agent | Day 7 (6/10) |
| M0-5 | Agent Distributor | 监听贡献 → 自动调 CAW 转账 | Agent | Day 9 (6/12) |
| M0-6 | 端到端演示 | 一行命令触发，跑完全部 8 步 | Agent + 合约 | Day 10 (6/13) |
| M0-7 | README + Demo 视频 | 符合官方提交要求 | 辅助 | Day 12 (6/13) |
| M0-8 | 测试网证据 | 至少 3 个 TX hash + 钱包地址 | 辅助 | Day 12 (6/13) |

**验收门槛**：M0-1 到 M0-8 全部完成 = Demo Day 可演示。

### 2.2 优先实现（M1 — 有了能加分）

| ID | 模块 | 验收标准 | 责任火堆 | 截止 |
|----|------|---------|----------|------|
| M1-1 | MCP Server | 11 个工具可被 Claude Code 调用 | Agent | Day 9 (6/12) |
| M1-2 | React Dashboard | 看贡献 + 分账 + 审计 | 前端 | Day 10 (6/13) |
| M1-3 | Telegram 通知 Bot | 贡献提交 / 分账到账 / 争议推送 | 辅助 | Day 10 (6/13) |
| M1-4 | CAW Pact 策略多样化 | 限额 / 白名单 / 时间窗 3 种策略 | 合约 | Day 8 (6/11) |

### 2.3 锦上添花（M2 — 时间允许才做）

| ID | 模块 | 验收标准 | 责任火堆 |
|----|------|---------|----------|
| M2-1 | Agent Profile（N-card 风格） | 能力声明 + 钱包地址 + 风险边界 | 辅助 |
| M2-2 | 争议裁决流程 | 模拟一个争议 case 跑通 | Agent |
| M2-3 | 多 Agent 互雇 | Recorder 雇 Prover，Prover 雇 Distributor | Agent |

---

## 三、Out-of-Scope（明确不做）

### 3.1 范围外项目（两周内不碰）

| 不做 | 原因 | 后续 |
|------|------|------|
| **完整 DAO 治理系统** | 提案/投票/委员会是 CGHub W2 主线，黑客松后做 | 创客星球正式版 |
| **多链跨链分发** | 复杂度高，先单链跑通 | Phase 2 |
| **KYC / 合规审计** | 测试网，不涉及合规 | 未来上主网时做 |
| **Mobile App / 原生 App** | CAW App 配对阻塞 + 时间紧 | 团队拓展后 |
| **完整身份系统（L0-L4 等级）** | 是 CGHub 长期架构，黑客松不演示完整版 | 创客星球正式版 |
| **AI 自动评估贡献价值** | 黑盒、不可控、容易有偏差 | 用固定数值模拟 |

### 3.2 显式降级（不深入做）

| 模块 | 降级方式 |
|------|----------|
| **贡献评估** | 不做 AI 评估，固定金额 0.01 ETH |
| **分账规则** | 单一规则：100% 给贡献者（不做多角色分账） |
| **多签治理** | 不做（CAW 的 Owner Pair 已经覆盖审批） |
| **跨链桥** | 不做（Sepolia/Monad 单链跑通即可） |
| **数据库** | 不做（用 IPFS 存证明哈希 / 链上存关键数据） |

---

## 四、优先级决策矩阵

当时间冲突时，按下面优先级砍：

```
P0（必须做，砍了 Demo 就跑不起来）：
  - M0-2 ContributionLedger 合约
  - M0-3 Distribution 合约
  - M0-5 Agent Distributor
  - M0-6 端到端演示
  - M0-7 README

P1（重要，砍了影响体验）：
  - M0-8 测试网证据
  - M1-1 MCP Server
  - M1-2 React Dashboard
  - M1-4 CAW Pact 策略多样化

P2（加分，砍了不致命）：
  - M1-3 Telegram Bot
  - M2-1/2/3
```

**砍单原则**：
- 砍 M2 不影响提交 → 优先砍 M2
- 砍 M1 影响评委评分 → 谨慎
- 砍 P0 直接 Demo 失败 → **绝对不砍**

---

## 五、节奏图（11 天倒计时）

```
6/3 (Day 0)   立项、CAW quickstart ✅
6/4 (Day 1)   🔴 合约骨架设计 + Agent 架构定稿
6/5 (Day 2)   🟡 Foundry 初始化 + Next.js 启动
6/6 (Day 3)   🤝 第一堆火：接口对齐、分工发布
6/7 (Day 4)   🔴 ContributionLedger 初版 + Agent Recorder PoC
6/8 (Day 5)   🔴 Distribution 初版 + x402 Prover PoC
6/9 (Day 6)   🟡 前端 Dashboard 雏形
6/10 (Day 7)  🤝 中间检查点（端到端 demo v0.1）
6/11 (Day 8)  🔴 CAW Pact 策略 + Agent Distributor
6/12 (Day 9)  🟡 MCP Server 雏形 + Dashboard 联调
6/13 (Day 10) 🚀 全流程串联 + README + 录屏
6/13 12:00    💀 提交截止
6/14          🏆 Demo Day
```

**红色块** = 关键路径
**黄色块** = 加分项
**绿色块** = 同步节点

---

## 六、依赖关系图

```
M0-1 (CAW) ─────────────────────┐  ✅ 已完成
                                  ↓
M0-2 (Ledger) ──→ M0-3 (Distribution) ──→ M0-5 (Distributor Agent)
        ↓                                  ↓
M0-4 (x402 Prover) ────────────────→ M0-5
                                       ↓
                            M0-6 (端到端)
                                       ↓
                            M0-7 (README) + M0-8 (证据)
```

**关键路径**：`M0-2 → M0-3 → M0-5 → M0-6`

**并行路径**：
- M0-1 (CAW) — 已完成 ✅
- M0-4 (x402 Prover) — 可与 M0-2 并行
- M1-2 (Dashboard) — 可与 M0-5 并行
- M1-3 (Telegram Bot) — 可最后做

---

## 七、风险与缓冲

### 7.1 缓冲时间

| 阶段 | 计划 | 缓冲 |
|------|------|------|
| Day 1-3 | 设计与骨架 | 1 天 |
| Day 4-7 | 实现 + 测试 | 1 天 |
| Day 8-10 | 集成 + 优化 | 0.5 天 |
| Day 11-12 | 文档 + 录屏 | 0.5 天 |
| 合计 | 10 天 | **3 天缓冲** |

### 7.2 风险场景下的应对

| 风险 | 触发条件 | 应对 |
|------|----------|------|
| 白织不到位 | 6/6 仍无合约 | **Hugo 亲自写 Solidity**（用 AgentVault 参考） |
| 前端没时间 | 6/10 Dashboard 没雏形 | **降级为 CLI 演示 + 录屏** |
| MCP 复杂 | 6/10 没跑通 | **降级为 SDK 直接调用** |
| App 配对未解决 | 6/13 前 | **CLI auto-approved 模式演示**（已验证可用） |
| Monad Testnet 拥堵 | RPC 慢 | **回退 Sepolia**（CAW 已验证可用） |

### 7.3 MVP 失败兜底

如果 6/12 端到端仍跑不通：
- 降级方案：录屏 + README + CAW 单步演示（已完成）
- 提交物：项目完整度 + 文档质量 + 团队协作 + 学习价值
- **仍可拿"最佳学习奖"**（评委看重 AI 工具使用）

---

## 八、验收 Checklist（6/13 12:00 前自检）

- [ ] README 含：项目背景 / 安装运行 / 核心功能 / 技术架构 / API 工具
- [ ] Demo 视频 3-5 分钟，展示端到端流程
- [ ] 运行说明（prerequisites / setup / run）
- [ ] 测试网验证（合约地址 / TX hash / Agent 钱包地址 / 流程截图）
- [ ] 使用 CAW 的关键代码或配置说明
- [ ] 团队信息（成员 / 角色 / 钱包 / 联系方式）
- [ ] 项目说明文档 Proposal（本目录）
- [ ] GitHub Repo 公开可访问

---

## 九、与评审标准的对应

| 评审维度 | CGHub 怎么打 |
|---------|--------------|
| **创新性 Innovation** | A2A Economy + Agent-Native Payments 真实演示（不只概念） |
| **技术实现 Technical** | CAW + x402 + 智能合约 + Agent 四栈融合，证据链完整 |
| **用户体验 UX** | Demo 演示真实使用场景：一句话触发全流程 |
| **生态影响 Ecosystem** | 创客星球真实业务场景，获奖后续可拉团队做完整版 |
| **演示质量 Demo** | 录屏 + 现场演示（取决于网络，准备预录） |

---

## 十、关键决策记录

| 决策 | 内容 | 日期 |
|------|------|------|
| 选 Cobo 赛道 | 符合 CAW 硬性要求 + 3500U 奖池 | 6/1 |
| 选 Monad Testnet | AgentVault 验证过，活跃 | 6/2 |
| 选 Foundry 而非 Hardhat | 测试快 + Gas 优化 | 6/2 |
| App 配对可降级 | HarmonyOS 不支持，CLI 模式足够 | 6/3 |
| 固定金额 0.01 ETH 模拟 | 不做 AI 评估，避免黑盒 | 6/3 |
| 单链 Sepolia/Monad 跑通 | 不做跨链，先打通闭环 | 6/3 |

---

> **Tag：** #ScopeReview #CGHub #Hackathon #Cobo #MVP
> **关联**：`proposal-memo.md` / `risk-memo.md`（本目录）
