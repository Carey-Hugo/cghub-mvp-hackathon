# CGHub MVP 前端

本目录为 CGHub 黑客松前端火堆的最小可运行实现。目标是：

- 贡献提交页面
- 钱包连接（MetaMask / Cobo 预留）
- Agent 签名 + CAW executor 上链提交
- Cobo `claimFor` 代领触发逻辑
- 贡献记录、链上 Round、分账结果与审计事件 Dashboard

## 快速启动

```bash
cd creators-galaxy/02-projects/cghub-mvp-hackathon/frontend-前端
npm install
npm run dev
```

打开 `http://localhost:3000`，即可查看前端演示页面。

## 说明

- `pages/index.tsx`：贡献提交主界面
- `pages/dashboard.tsx`：贡献记录仪表盘
- `components/WalletConnect.tsx`：钱包连接组件
- `components/ContributionForm.tsx`：贡献提交表单
- `components/DistributionView.tsx`：分账结果展示
- `hooks/useCoboWallet.ts`：Cobo Wallet 状态和请求封装
- `lib/cobo-sdk.ts`：Cobo 分账请求入口，调用 Agent 后端 `/api/trigger-claim`

## 后续集成建议

1. 启动 `agent/` 后端 `npm run api`，确保 `/api/sign-contribution`、`/api/submit-contribution`、`/api/trigger-claim` 可用。
2. 配置可用的 Sepolia RPC：`NEXT_PUBLIC_RPC_URL`。
3. 如需更完整的历史审计，调大 `NEXT_PUBLIC_EVENT_LOOKBACK_BLOCKS`。
