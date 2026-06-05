# CGHub 黑客松 · 进展同步 · 2026-06-03 晚

> 本文档跟踪前端、合约、Agent 三条火堆的实时进展、接口对齐、待解决问题。

---

## ✅ 今日进展

### 🟡 前端火堆（已完成 MVP 并合入 main）
- **仓库**：`frontend-前端/`
- **状态**：MVP 已合入 main 分支，准备联调
- **已实现页面**（截图证据）：
  - 贡献提交页（标题/金额/说明 + 提交按钮）
  - 钱包连接（Cobo CAW，已选 0x73E4...8567）
- **阻塞**：等合约组提供 ABI + 测试账号

### 🔴 合约火堆（已部署测试网 + 文档）
- **仓库分支**：`add-cghub-contract`
- **已部署**（Ethereum Sepolia）：
  - `ContributionPool`：`0x876A0741223EDdaE081Ef22beA513E92335B1Bd5`
  - USDC：`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
  - projectId=1, roundId=1（已开池）
- **ABI**：`docs/introduce/` 目录
- **核心机制**：
  - owner 创建 round → 出资方 fund → Agent EIP-712 签名贡献 → recordContributionBySig 上链 → owner finalize → contributor claim
  - 推荐 Cobo 调用 `claimFor()` 代领
- **下一步**：与 Cobo Agentic Wallet 的 Pact 审批、受限合约调用进一步结合

---

## 🚨 必须立即拉齐的接口对齐问题

### 问题 1：合约命名和拆分不一致 ⚠️ 高优先级

| 任务分配（task-assignment.md） | 合约组实际交付 |
|---|---|
| `ContributionLedger.sol` | ❌ 没有 |
| `Distribution.sol` | ❌ 没有 |
| — | `ContributionPool.sol`（合并实现） |
| `IContributionLedger` / `IDistribution` | — |
| 依赖 `x402verifier.sol` 库 | ❌ 改用 EIP-712 签名 |

**影响**：前端按任务分配文档找了半天没找到 `ContributionLedger` 和 `Distribution`。

**待决策**：
- A. 合约拆成两个合约（Ledger + Distribution），匹配任务分配
- B. 任务分配文档更新成 `ContributionPool` 单一合约（推荐：当前实现更完整）

### 问题 2：测试网网络不同 ⚠️ 高优先级

- **前端要求**：Polygon Mumbai
- **合约已部署**：Ethereum Sepolia

**待决策**：
- A. 合约重新部署到 Mumbai
- B. 前端改用 Sepolia（推荐：USDC 地址 `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` 是 Sepolia Circle 官方 USDC，Mumbai 的是另一套）

### 问题 3：签名机制不同 ⚠️ 中优先级

- **任务分配设计**：`x402verifier.sol`（x402 证明验证）
- **合约实际实现**：EIP-712 签名（`agentSigner` 私钥签 ContributionProof）

**说明**：EIP-712 是当前生产标准，x402 是更上层的 HTTP 402 协议，可以共存（Agent 业务侧做 x402，链上用 EIP-712 验签），但需要明确分工。

### 问题 4：贡献数据模型差异 ⚠️ 中优先级

- **合约实际**：`score` 字段（按比例分账）
- **前端界面**："贡献金额"（固定数值）
- 建议前端补充"贡献分数"或"贡献权重"概念，或前端只发业务数据让 Agent 算分

### 问题 5：测试资源申请

**前端申请**：
- Cobo CAW（白织/CAW 负责人私信）
- AGENT_WALLET_API_KEY / WALLET_UUID / API_URL
- 或临时测试账号 + Pact 审批触发步骤

**合约可立刻提供**：
- ✅ ABI（在 `docs/introduce/`）
- ✅ 部署地址（Sepolia）
- ✅ 文档（已发到群里）
- ❌ Cobo 凭据（不在合约组范围，需白织/CAW 团队）

---

## 📋 6/4-6/5 关键里程碑

- **6/4 EOD**：对齐 5 个接口问题，确定 ABI 名称 + 测试网
- **6/5**：前端接入合约 ABI，跑通"贡献提交 → 签名 → 记录 → 查询分数"完整链路

---

> 最后更新：2026-06-03 22:00  | 维护：Hermes（军师）
