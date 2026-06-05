# CGHub MVP 前端

本目录为 CGHub 黑客松前端火堆的最小可运行实现。目标是：

- 贡献提交页面
- 钱包连接（MetaMask / Cobo 预留）
- Cobo 分账触发逻辑
- 贡献记录展示与 Dashboard

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
- `lib/cobo-sdk.ts`：Cobo 分账请求入口，当前为占位实现

## 后续集成建议

1. 将 `lib/cobo-sdk.ts` 中的 `requestCoboDistribution` 替换为真实 Cobo SDK / 后端接口调用。
2. 对接合约火堆的 ContributionLedger / Distribution 合约接口。
3. 增加 `Cobo Agentic Wallet` 专用连接逻辑和 Pact 审批状态显示。
