# CGHub MVP Hackathon

创客星球（CGHub）MVP 黑客松开源仓库。

## 项目定位

CGHub Contribution Agent 是一个面向 AI 协作团队的贡献记录与价值分配基础设施。

核心闭环：

```text
团队协作过程 → Agent 记录贡献 → 贡献评分 → 贡献证明 → 分配建议 → Cobo Agent Wallet 分配/模拟分配
```

一句话：**用 Agent 记录贡献，用 Wallet 分配价值。**

## 目录结构

- `agent/`：贡献记录与评分 Agent
- `frontend-前端/`：前端 MVP
- `contract/`：合约相关代码
- `03-caw-example/`：Cobo Agent Wallet 示例
- `03-PRD/`：产品需求文档
- `04-tasks/`：任务分工与进展同步
- `05-proposals/`：方案与提案文档
- `docs-文档/`：辅助文档

## 当前 MVP 目标

1. 记录团队协作中的贡献事件；
2. 按规则计算贡献分；
3. 生成每个人的贡献报告；
4. 输出团队贡献排名和分配建议；
5. 形成可解释的贡献证明；
6. 接入 Cobo Agent Wallet，完成一次分配或模拟分配；
7. 在 Demo 中讲清楚完整闭环。



## 依赖说明

为了保持开源仓库轻量，本仓库不直接提交 `node_modules/`、Foundry `contract/lib/` 依赖源码、`broadcast/`、`cache/`、`out/` 等生成产物。

合约依赖请在本地执行：

```bash
cd contract
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge build
```

## License

MIT
