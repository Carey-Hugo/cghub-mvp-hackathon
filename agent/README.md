# Agent 火堆 · agent/

掌火人：大番薯。方案见 `docs/Agent方案设计.md`。

## 干嘛的

Agent 用 agentSigner 私钥把贡献签成合约认的 EIP-712 证明，再让 CAW 钱包把交易发上链（记录贡献 / 代领分账）。链下 proof 签名由 `AGENT_PRIVATE_KEY` 完成；CAW 钱包发链上交易时需要本机 `cobo-tss-node` signer 在线，否则交易会停在 `Processing/signing`。

闭环：`agentSigner 签 proof（链下）→ CAW 钱包 contractCall 上链 → ContributionPool 验签记账 / claimFor 分账`。

## 本地联调怎么跑

先启动 CAW 本地 signer（只在持有这把 CAW 钱包 profile 的机器上需要）：

```bash
caw node start
```

然后启动 Agent API：

```bash
cd agent
npm install
npm run api    # 起 HTTP API 给前端（默认 :8787），见 docs/API.md
```

需要单独跑端到端自测时再用：

```bash
npm run dev    # 签贡献 → CAW 上链 recordContributionBySig，会真实提交一笔测试交易
npm run mcp    # 起 MCP server（stdio）
```

`.env` 是本地机密配置，按 `.env.example` 填，避免提交到仓库。队友要跑真实 CAW 上链，需要拿到对应 CAW 凭证、active pact，并完成/复用这把钱包的本地 TSS profile；否则可以只跑前端读取和签名接口级联调。

## 目录

```
agent/
├── src/
│   ├── config.ts                # env + EIP-712 domain/types
│   ├── types.ts                 # ContributionProof 等类型
│   ├── abi.ts                   # 运行时加载 abi/
│   ├── contribution-recorder.ts # 模块1：组织 proof + EIP-712 签名
│   ├── x402-prover.ts           # 模块2：x402 支付层（待接 Cobo payment）
│   ├── executor.ts              # Cobo SDK 发交易（CAW 钱包当 executor）
│   ├── wallet-agent.ts          # 模块3：checkPending + claimFor
│   ├── mcp-server.ts            # 模块4：MCP 工具服务
│   └── index.ts                 # 入口：端到端串联
├── tools/                       # MCP 工具：sign/submit-contribution、check-pending、trigger-claim
├── abi/ContributionPool.abi.json
├── docs/{Agent方案设计.md, API.md}
├── .env.example                 # .env 本地创建，勿提交
├── package.json / tsconfig.json
```

## 现状

- ✅ 记录链路实测上链：`npm run dev` 跑通 sign → CAW recordContributionBySig（Sepolia）
- ✅ 前端联调：`npm run api` + 前端按钮可走 sign → submit → refresh
- ✅ CAW signer 要求已确认：本机 `cobo-tss-node` 在线时可签名并广播；不在线会卡在 `Processing/signing`
- ✅ ABI / EIP-712 / 哈希规则 / proofSalt 全部对齐链上合约（链上实测一致）
- ✅ proof/signature HTTP API 可用（前端对接见 docs/API.md）
- ⏳ claimFor 分账：代码已接同机制，待 owner `finalizeRound` 后可实测
- ⏳ x402：待团队定演到多深（方案 3.3）

## 关键配置（本地 .env）

- `AGENT_PRIVATE_KEY`：agentSigner（链上 `agentSigner()` 对应私钥）
- `AGENT_WALLET_API_KEY` / `_WALLET_UUID`：CAW 钱包凭证
- `CAW_PACT_ID` / `CAW_SRC_ADDRESS`：发交易用的 pact 与 CAW 钱包地址
- `POOL_ADDRESS` / `USDC_ADDRESS` / `PROJECT_ID` / `ROUND_ID`：合约参数
