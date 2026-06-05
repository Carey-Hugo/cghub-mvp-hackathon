# 创客星球 MVP 黑客松 · 协作规范 v0.1

> 探索AI原生蜂巢思维+篝火模式人机协作，两周迭代打磨

---

## 1. 群定位

| 角色 | 说明 |
|------|------|
| 信息同步总站 | 本群所有关键信息在此同步、对齐、存档 |
| 外部入口 | 外部协作通过本群接入 |

**具体任务开发** → 各人与自己的 AI Agent 私有协作，不在本群刷屏

---

## 2. 成员命名

- [ ] 大家修改 Telegram 昵称为好记易识别的名字
- [ ] 完成后来此处填写：

| 昵称 | 专业背景 | 当前角色 | 可贡献 | 感兴趣方向 |
|------|---------|---------|--------|-----------|
| Hugo | - | 发起人/产品 | - | - |
| 总助 Hermes | AI Agent | 协调/记录 | 信息整理、进度追踪 | - |

---

## 3. 信息流规范

### 3.1 成果汇报节奏
- **每日站会**（晚8点前）：每人简短同步「今日进展 + 明日计划 + 卡点」
- **里程碑节点**：每完成一个功能模块，同步到本群并 @ Hermes 记录

### 3.2 消息格式建议
```
【进展】功能模块名
- 完成什么：xxx
- 待确认事项：xxx @相关人
- 卡点：xxx（需要什么帮助）
```

### 3.3 找 Hermes 的方式
- 直接 @总助main + 描述需求或问题
- 阶段性成果直接丢给他归档
- 外部参考资料随手转发给他吸收

---

## 4. 任务协作原则

```
篝火模式：
- 问题抛出来，不是一个人扛
- 有解决方案就接，没把握的主动说"我可以试试"
- 遇到卡点 → 描述清楚（环境/步骤/错误信息）再 @ Hermes

蜂巢思维：
- 各人专注自己的模块，自主推进
- 关键决策结论同步到本群
- 需要对齐时再拉齐，不做无谓的会议
```

---

## 5. 文件归档

- 代码 → GitHub 仓库同步
- 文档 → Obsidian Vault 统一管理
- 图片/截图 → 本群或转发给 Hermes 存档
- 本规范 → 持续迭代，每次修订标注版本日期

---

## 7. 关键时间节点（官方）

| 日期 | 事项 |
|------|------|
| 6月2日 20:00-21:00 | **Open Day**（今晚）— 规则/赛道/提交要求/团队格式说明 |
| 6月1日-6月12日 | Build Period — 组队、开发、测试、Demo准备 |
| 6月1日-6月12日 工作日 19:00-20:00 | Office Hour — 技术/Q&A/产品/Demo问题 |
| 6月1日-6月12日 20:00-21:00 | Workshop — 技术资源/方向/检查点/Demo指导 |
| **6月13日 12:00 (UTC+8)** | **提交截止** — README + Demo视频 + 运行说明 + 测试网验证 |
| 6月14日 | Demo Day — 入选项目展示与评审 |
| 6月17日 | 获奖公示 |

---

### 今晚 Open Day 参与方式

**Zoom 会议：**
- 链接：https://us06web.zoom.us/j/83363381707?pwd=EBLgDxtSqFUFfGILalRDivEZ6usgNf.1
- 会议号：833 6338 1707
- 密码：797161

**X 直播：**
- 直播链接：https://x.com/i/broadcasts/1kKzDDaVzZRJv
- 回放：如活动已结束，可直接点开 X 直播链接查看回放

---

## 8. 提交物要求（官方）

- [ ] README（项目说明）
- [ ] Demo 视频
- [ ] 运行说明
- [ ] 测试网验证

---

## 10. 赛道方向（详细版）

| 赛道 | 奖池 | 核心关注 |
|------|------|---------|
| Cobo 赛道 | 3500 USDT | Agentic Commerce × Agentic Wallet |
| Z.AI 赛道 | 3500 USDT + API补贴 | Web3 × Long-Horizon Task |

---

### Cobo 赛道｜Agentic Economy × Cobo Agentic Wallet

**核心：Agent 参与经济活动的应用或基础设施，Agent 需要有真实的资金执行能力**

赛道方向（可选）：
- **01｜Agent-Native Payments** — Agent成为互联网一等支付公民，HTTP 402自动完成支付，不依赖API Key
  - 示例：Agent自主调用付费LLM、购买数据集、租用GPU
- **02｜Trustless Agent Work Agreements** — 基于ERC-8183实现Agent间去信任工作协议：发布→托管→交付→验收/驳回→付款
  - 示例：Research Agent发包给Analyst Agent，自动比稿验收付款
- **03｜Agent Resource Procurement** — Agent根据任务自主发现、比价、采购算力、数据、API、存储等资源
- **04｜Autonomous Trading** — Agent自主执行链上交易策略：套利、做市、组合管理、流动性挖矿
- **05｜A2A Economy** — 多个Agent各自拥有钱包，Agent-to-Agent经济体：互雇、拍卖、分账、管理Treasury

**Cobo赛道规则（硬性）：**
1. 项目必须围绕 Agent 与资金操作场景展开
2. Agent 的资金相关操作必须通过 **Cobo Agentic Wallet（CAW）** 完成
3. Agent 需要具备真实的资金执行能力（支付/转账/结算/收益管理/资产调度），不能只停留在流程设计
4. CAW 必须是资金流程中的**关键组件**，不能是可替换的展示元素
5. 最终成果必须为**可运行或可演示的产品原型**，不接受纯PPT/概念设计/Mockup

**提交要求补充：**
- GitHub Repo + README
- Demo视频（建议3-5分钟）
- 使用CAW的关键代码或配置说明
- 如涉及链上交互：测试网地址 + Transaction Hash + Agent Wallet地址 + 流程截图

**Cobo赛道评审侧重：**
- 场景贴合度：AI如何参与经济活动，不只是把钱包作为附属功能
- CAW关键性：CAW是否是资金流程关键组件
- 资金流程完整度：Demo展示Agent从任务触发到资金操作完成的主要流程
- 可演示性：稳定展示核心流程
- 风险边界说明：权限/账户/链上交互的边界和控制方式

**Cobo参考资料：**
- 官网：https://www.cobo.com/agentic-wallet
- Recipes：https://agenticwallet.cobo.com/agentic-wallet/recipes
- 文档：https://www.cobo.com/products/agentic-wallet/manual/start-here/introduction
- SDK：https://www.cobo.com/products/agentic-wallet/manual/developer/quickstart-overview

---

### Z.AI 赛道｜Web3 × Long-Horizon Task

**核心：让Agent自主拆解复杂任务、制定多步骤计划、持续调用工具、迭代修复，完成从需求到交付的完整Web3工作流**

赛道方向（可选）：
- **01｜Agentic Dev Tools for Web3** — 用一句话交付完整Web3工程：需求分析→合约设计→代码编写→测试迭代→漏洞修复→部署准备→文档输出
- **02｜Long-Horizon Tasks × Gaming** — 复杂游戏关卡设计/虚拟世界构建/剧情生成与任务编排
- **03｜AI × 3D World / 空间构建** — AI-Powered 3D World Builder（虚拟地产/NFT展馆/DAO活动空间/Web3游戏场景与关卡设计）
- **04｜Long-Horizon Tasks × 链上数据** — 多链适配Agent/链上数据分析与可视化/自动化报告
- **05｜AI × 内容生产** — 长程内容生产工作流：选题→调研→创作→发布→数据分析
- **06｜Long-Horizon Tasks × 创作者经济** — 创作者DAO协作系统：任务拆解→贡献追踪→价值分配

**Z.AI赛道规则：**
- 体现长程、自主、持续执行，不做一次性生成或普通API调用
- 最终成果需为可运行或可演示的产品原型

---

> **CGHub应选择赛道分析：**
> - CGHub的Payment/Commerce主线（贡献记录→价值分配）→ 高度吻合**Cobo赛道方向02/05**（Trustless Agent Work Agreements + A2A Economy）
> - CGHub的Governance方向（规则制定/争议裁决/角色权限）→ 可延伸至**Z.AI赛道方向06**（创作者DAO协作系统）
> - **建议：主攻Cobo赛道**，Z.AI赛道可作为演示补充

---

## 11. AI 工具使用

任意工具均可（AI 编码/对话/设计/调试工具均可组合使用）。
重点不是代码本身，而是是否真正把 AI 用成生产力：围绕明确问题完成原型→文档→演示→链上证据→后续迭代说明。

---

## 12. 参赛方式

- 支持个人或自由组队（建议 3-5 人，开发/产品/研究/运营/设计跨职能）
- 共学成员与非共学成员均可报名、组队、提交
- 每个团队只能提交一个项目，选最符合项目特点的赛道

---

## 13. 提交物清单（完整版）

- [ ] 项目名称 + 一句话简介
- [ ] GitHub Repo（含 README：项目背景/安装运行/核心功能/技术架构/API工具）
- [ ] Demo 视频（建议 3-5 分钟，展示核心流程）
- [ ] 项目说明文档 Proposal（问题/方案/目标用户/技术实现/完成度/后续计划）
- [ ] 链上/测试网证据（合约地址/交易哈希/测试账号/操作记录截图）
- [ ] 团队信息（成员/角色/钱包地址/联系方式）

> 静态展示、设计稿、未实现方案不在评审范围内

---

## 14. 评审标准（五维度）

| 维度 | 说明 |
|------|------|
| Innovation 创新性 | 新机制、新流程、新应用方式或问题解法 |
| Technical Execution 技术实现 | 核心功能可运行、架构清晰、技术选型合理 |
| User Experience 用户体验 | 用户路径清楚、交互顺畅、Demo 能体现真实使用场景 |
| Ecosystem Impact 生态影响 | 后续发展潜力、为生态/用户群体带来价值 |
| Demo Quality 演示质量 | 现场演示稳定清晰有说服力、问答能回应关键问题 |

评分：Demo展示 + 项目说明 + 代码/文档材料 + 现场问答 综合判断

---

## 15. 合规与安全边界

- 项目需为本次活动期间完成，能说明新增贡献
- 不得提交恶意/欺诈/侵犯隐私/违法项目
- 使用第三方 API/SDK/开源代码需在 README 说明
- 涉及私钥/钱包权限/用户数据：使用测试环境，说明权限边界、失败处理、人工介入条件

---

## 16. 参赛报名链接

## 17. 参考项目：AgentVault（ Monad Blitz 黑客松）

**项目仓库**：https://github.com/HOLYGITHUBUSER/hecthon_monad_hangzhou_20260413
**定位**：基于 Monad 链的 Agent 原生安全支付系统
**获奖**：第2名，$500 + 机械键盘

### 技术架构（可直接借鉴）

```
AI Agent (Claude Code / OpenClaw)
    ↓ MCP 调用
MCP Server（11个工具）
    ↓ SDK（含预检/重试/错误翻译）
Smart Contract Wallet（链上合约）
    ↓ 执行支付
x402 付费 API / MPP 服务
```

### 核心技术组件

| 组件 | 说明 | CGHub可借鉴 |
|------|------|------------|
| **Smart Contract Wallet** | 非托管链上金库，Owner持主私钥，Agent持Session Key | CGHub贡献资金托管 |
| **Policy Engine** | 差异化单笔/日限额 + 白名单 + 超额审批 | CGHub分账规则引擎 |
| **10层安全检查** | 授权→过期→暂停→单笔→全局→余额→次数→日额→白名单→审批 | CGHub资金安全模型 |
| **MCP Server** | 11个工具，AI Agent自然语言调用合约 | CGHub的Agent协作接口 |
| **x402协议** | HTTP 402机器对机器支付，Agent按次付费调用API | CGHub价值结算协议 |
| **Telegram审批Bot** | 大额支付推送人类确认 | CGHub争议裁决通知 |
| **链上账本/审计** | 每笔操作记录+policyHit策略命中 | CGHub贡献记录不可篡改 |
| **React Dashboard** | 全功能面板：存取款/授权/审批/白名单/账本 | CGHub管理界面 |

### 合约核心功能（AgentVault.sol 465行）

**Owner操作**：`deposit()` / `withdraw()` / `authorizeAgent()` / `revokeAgent()` / `updateAgentConfig()` / `addWhitelist()` / `approvePayment()` / `rejectPayment()` / `emergencyPause()`

**Agent操作**：`agentPay()` / `agentWithdraw()`

**查询**：`getLedgerEntry()` / `getAgentDailyOps()` / `getAgentConfig()`

### 演示场景设计（3个必做场景）

| 场景 | 流程 | 预期结果 |
|------|------|---------|
| **Scenario 1** | Agent小额支付API费用（日限额内） | ✅ 自动通过 |
| **Scenario 2** | Agent超额支付（超单笔限额） | ❌ 被合约拒绝，返回PaymentError |
| **Scenario 3** | 查看审计日志 | 📋 完整支付记录+policyHit |

### 技术栈参考

- 智能合约：Solidity 0.8.28 + **Foundry**（替代Hardhat）
- SDK：ethers.js v6 + TypeScript
- MCP Server：@modelcontextprotocol/sdk
- 前端：React 19 + Vite + TailwindCSS（零UI库）
- 通知：Telegram Bot API
- 机器支付：x402协议（HTTP 402）
- 测试网：**Monad Testnet**（Mumbai已弃用，不推荐）

### CGHub MVP可复用的模式

1. **合约架构**：参考AgentVault的Policy Engine，做CGHub的分账规则引擎
2. **MCP工具**：参考11个MCP工具设计，做CGHub的贡献记录/价值分配接口
3. **演示场景**：参考3场景设计，做CGHub的贡献→记录→x402证明→分账演示
4. **Dashboard**：参考React Dashboard，做CGHub的贡献管理面板
5. **Telegram Bot**：参考审批Bot，做CGHub的争议裁决通知

---

> **重要提示**：Cobo赛道要求Agent资金操作必须通过CAW（不是自己写的合约），但AgentVault的**架构思路**（合约钱包+Policy Engine+MCP+审计账本）完全可以复用到CGHub的产品设计中。

---

## 18. CGHub Hackathon MVP 方向建议

基于官方赛道要求 + AgentVault参考项目，建议：

### 最小闭环（Demo Day必须展示）

```
贡献者A提交任务 → Agent记录贡献 → x402证明 → 合约分账 → 到账通知
```

### 技术选型建议

| 模块 | 建议技术 | 说明 |
|------|---------|------|
| 链上合约 | Solidity + **Foundry**（替代Hardhat） | 更快、更安全的测试框架 |
| 测试网 | **Monad Testnet** 或其他活跃测试网（Mumbai已弃用） | polygon Mumbai测试网不稳定 |
| Agent SDK | TypeScript + ethers.js | 贡献预检/记录/分账调用 |
| MCP Server | @modelcontextprotocol/sdk | AI Agent自然语言交互 |
| 证明协议 | x402（HTTP 402） | 贡献证明的机器付费协议 |
| 通知 | Telegram Bot | 分账到账/争议裁决通知 |
| 前端 | React + Vite + TailwindCSS | 贡献管理Dashboard |

### 分工建议（3-5人）

- **合约 + 后端**：Solidity+Foundry写贡献记录合约+分账规则引擎，部署到测试网
- **Agent SDK + MCP**：Python/TS写SDK，集成x402，实现贡献记录流程
- **前端 + 审批Bot**：React Dashboard + Telegram Bot，人类审批 + 审计日志查看

---

## 19. 修订记录

| 版本 | 日期 | 修订内容 |
|------|------|---------|
| v0.1 | 2026-06-02 | 初始版本，Hugo 发起 |
| v0.2 | 2026-06-02 | 补充官方时间节点、Openday提醒 |
| v0.3 | 2026-06-02 | 同步赛道方向、奖池、AI工具、参赛方式、提交物清单、评审标准、合规边界、报名链接 |
| v0.4 | 2026-06-02 | 详细同步官方两个赛道内容、Cobo CAW规则、提交要求 |
| v0.5 | 2026-06-02 | 补充AgentVault参考项目（架构/合约/MCP/演示场景），输出CGHub MVP方向建议和分工建议 |
| v0.6 | 2026-06-02 | 技术栈调整：Foundry替代Hardhat，Mumbai测试网替换为Monad Testnet |