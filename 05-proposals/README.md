# CGHub MVP 黑客松 · 立项与规划文档集

> 2026-06-03 | 三份核心文档入口

## 📚 文档清单

| # | 文档 | 说明 | 行数 |
|---|------|------|------|
| 1 | [proposal-memo.md](./proposal-memo.md) | 项目立项书：为什么做、做什么、不做什么 | 178 |
| 2 | [scope-review.md](./scope-review.md) | 范围评审：M0/M1/M2 优先级 + 节奏图 + 砍单原则 | 198 |
| 3 | [risk-memo.md](./risk-memo.md) | 风险备忘录：4 红 + 5 黄 + 3 绿 + 应急联系人 | 240 |

## 🎯 核心决策

| 决策 | 内容 |
|------|------|
| 赛道 | Cobo · Agentic Economy（3500U 奖池） |
| 演示闭环 | 贡献记录 → x402 证明 → CAW 自动收益分配 |
| 关键路径 | M0-2 合约 → M0-3 分配 → M0-5 Agent → M0-6 端到端 |
| 时间 | 11 天倒计时（6/3 → 6/14） |
| 节奏 | 3 天骨架 + 4 天实现 + 3 天集成 + 2 天文档 |
| 缓冲 | 3 天冗余 |

## 🔴 当前最大风险

1. **R1 团队关键人不到位**（白织/大番薯）
2. **R4 端到端串联失败**（6/12 前必验证）
3. **R3 Monad Testnet 部署**（未验证）

## ✅ 已完成里程碑

- [x] Cobo Agentic Wallet quickstart 跑通（2026-06-03）
  - Sepolia TX: `0x28015a0708ebc14aad46e808f9a737fe24d2016384d1eb8ac3941962d92cf09c`
  - 详细日志：`../../hackathon/operations-log/02-CAW-Quickstart-2026-06-03.md`

## ⏭ 6/4 (Day 1) 计划

- 等待白织 / 大番薯到位
- Hugo 临时顶合约骨架设计
- 启动 Foundry 项目初始化
- 给 Monad Testnet 申请测试 ETH
