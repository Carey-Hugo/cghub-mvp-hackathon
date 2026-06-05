# CAW 跑通检查清单

> 给 Hugo 的：按顺序做，做完一项勾一项

## Phase 1 · 凭证准备（你来做）

### 步骤 1.1 · 注册 Cobo 开发者账号
- [ ] 打开 https://www.cobo.com/agentic-wallet
- [ ] 点 "Get Started" 或 "Sign Up"
- [ ] 用邮箱注册（建议用和 CGHub 一样的邮箱，方便统一）
- [ ] 登录后进入 **Dev Console**

### 步骤 1.2 · 创建 Agent
- [ ] Console → 左侧菜单 → **Agents** → **Create Agent**
- [ ] 命名：`CGHub-MVP-Agent`
- [ ] 复制 **API Key**（形如 `a...`）到一个临时记事本

### 步骤 1.3 · 创建/选择 Wallet
- [ ] Console → 左侧菜单 → **Wallets** → **Create Wallet**
- [ ] 类型：**Cobo Smart Wallet**（推荐用于 Agent 场景）
- [ ] 链：**Sepolia** 测试网
- [ ] 复制 **Wallet UUID**（形如 `xxx-xxx-xxx`）

### 步骤 1.4 · 充值 Sepolia ETH
- [ ] 复制钱包地址
- [ ] 打开 Sepolia Faucet：https://sepoliafaucet.com/
- [ ] 粘贴地址 → 请求 0.5 ETH（够跑很多次）
- [ ] 等 1-2 分钟到账

### 步骤 1.5 · 填入 .env
- [ ] 在服务器上：`cd /home/ubuntu/creators-galaxy/creators-galaxy/02-projects/cghub-mvp-hackathon/03-caw-example`
- [ ] `cp .env.example .env`
- [ ] 填入：
  ```
  AGENT_WALLET_API_KEY=<步骤 1.2 的 API Key>
  AGENT_WALLET_WALLET_UUID=<步骤 1.3 的 Wallet UUID>
  CAW_DESTINATION=<另一个测试地址，比如 MetaMask 钱包地址>
  ```

## Phase 2 · 跑通示例（我做）

- [ ] `npm run quickstart` 运行
- [ ] 截图保存输出日志
- [ ] 把日志归档到 `creators-galaxy/hackathon/operations-log/02-CAW-Quickstart-2026-06-03.md`

## Phase 3 · 后续（基于这次跑通后展开）

- [ ] x402 微支付示例（CGHub 核心场景）
- [ ] Pact Policy 多维度配置（白名单/限额/时间窗）
- [ ] 审计日志分析脚本

---

## 卡点预案

**如果你卡在「没收到 Faucet 的 ETH」：**
- 试 https://www.alchemy.com/faucets/ethereum-sepolia
- 试 https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- 用 Alchemy 账号登录每天能领 0.5 ETH

**如果你卡在「Agent 创建失败」：**
- 可能是账号未完成 KYC，Cobo 某些功能需要
- 或者在控制台顶部会有"完成开发者认证"提示

**如果你卡在「Wallet UUID 找不到」：**
- 列表里找 "Address" 或 "Wallet ID" 字段
- 它长这样：`f47ac10b-58cc-4372-a567-0e02b2c3d479`
