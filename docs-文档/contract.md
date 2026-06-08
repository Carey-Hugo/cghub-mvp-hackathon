# ContributionPool 智能合约文档

> 合约文件：`contract/src/ContributionPool.sol`（257 行）
>
> Solidity 0.8.24 | Foundry | Sepolia 测试网

---

## 概述

ContributionPool 是一个基于 EIP-712 签名验证的贡献分账资金池合约。核心设计：

- **Owner** 创建 Round 并注入资金
- **Agent** 用 EIP-712 签名证明贡献，任何人可代提交上链
- **贡献者** 在 Round 结束后按分数比例领取 USDC

**关键约束**：只有链上配置的 `agentSigner` 签出的 proof 能被合约接受，任何人都能发交易上链。

---

## 数据结构

### Round

```solidity
struct Round {
    address token;      // 分配代币地址（USDC）
    uint256 funded;     // 已注入资金总额
    uint256 totalScore; // 该轮所有贡献分总和
    bool exists;        // 是否已创建
    bool finalized;     // 是否已结算
}
```

### ContributionProof

```solidity
struct ContributionProof {
    uint256 projectId;
    uint256 roundId;
    address contributor;    // 贡献者收款地址
    uint256 score;          // 贡献分数
    bytes32 proofHash;      // 防重放 key（唯一且非零）
    bytes32 paymentIdHash;  // 对账锚点（挂 x402 paymentId）
    uint256 nonce;
    uint256 deadline;       // proof 过期时间（Unix 秒）
}
```

---

## 状态变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `agentSigner` | address | Agent 签名地址（由 Owner 设置） |
| `rounds[projectId][roundId]` | Round | Round 信息 |
| `scores[projectId][roundId][contributor]` | uint256 | 贡献者累计分数 |
| `claimed[projectId][roundId][contributor]` | uint256 | 贡献者已领取金额 |
| `usedProofs[proofHash]` | bool | proofHash 防重放标记 |

---

## 事件

| 事件 | 参数 | 触发时机 |
|------|------|----------|
| `AgentSignerUpdated` | oldSigner, newSigner | Owner 更新 agentSigner |
| `RoundCreated` | projectId, roundId, token | Owner 创建 Round |
| `RoundFunded` | projectId, roundId, amount | 出资方注入资金 |
| `ContributionRecorded` | projectId, roundId, contributor, score, proofHash, paymentIdHash | 贡献记录上链 |
| `RoundFinalized` | projectId, roundId | Owner 结算 Round |
| `Claimed` | projectId, roundId, contributor, amount | 贡献者领取收益 |

---

## 函数

### Owner 函数

| 函数 | 参数 | 说明 |
|------|------|------|
| `setAgentSigner(newSigner)` | address | 更换 Agent 签名地址 |
| `createRound(projectId, roundId, token)` | uint256, uint256, address | 创建分配轮次 |
| `fundRound(projectId, roundId, amount)` | uint256, uint256, uint256 | 注入资金（ERC-20 转入合约） |
| `finalizeRound(projectId, roundId)` | uint256, uint256 | 结算轮次（须 funded>0 且 totalScore>0） |

### 公开函数（任何人可调用）

| 函数 | 参数 | 说明 |
|------|------|------|
| `recordContributionBySig(proof, signature)` | ContributionProof, bytes | 提交 Agent 签名过的贡献证明 |
| `claim(projectId, roundId)` | uint256, uint256 | 贡献者自己领取 |
| `claimFor(projectId, roundId, contributor)` | uint256, uint256, address | 代领（推荐 CAW 用此方法） |
| `pending(projectId, roundId, contributor)` | view | 查询可领取金额 |

---

## recordContributionBySig 验签流程

```
1. Round 必须存在（exists == true）
2. Round 未结算（finalized == false）
3. proof.deadline > block.timestamp（未过期）
4. proof.contributor != address(0)
5. proof.score > 0
6. proof.proofHash != bytes32(0)
7. usedProofs[proof.proofHash] == false（防重放）
8. ECDSA.recover(digest, signature) == agentSigner（验签）
       ↓ 全部通过
9. usedProofs[proofHash] = true
10. scores[projectId][roundId][contributor] += score
11. round.totalScore += score
12. emit ContributionRecorded(...)
```

---

## 分账公式

```solidity
pending = funded * score / totalScore - claimed
```

- 只有 Round 已 `finalized` 且 `totalScore > 0` 时 `pending > 0`
- 领取后 `claimed` 累加，防止重复领取

---

## 自定义错误（Custom Errors）

| 错误 | 触发条件 |
|------|----------|
| `ContributionPool__InvalidSigner` | agentSigner 设为零地址 |
| `ContributionPool__InvalidToken` | Round token 为零地址 |
| `ContributionPool__RoundAlreadyExists` | 重复创建同一 Round |
| `ContributionPool__RoundNotFound` | Round 不存在 |
| `ContributionPool__RoundFinalized` | Round 已结算 |
| `ContributionPool__ZeroAmount` | fundRound amount = 0 |
| `ContributionPool__ExpiredProof` | proof.deadline < block.timestamp |
| `ContributionPool__InvalidContributor` | contributor = address(0) |
| `ContributionPool__ZeroScore` | score = 0 |
| `ContributionPool__InvalidProofHash` | proofHash = bytes32(0) |
| `ContributionPool__ProofAlreadyUsed` | proofHash 已被使用 |
| `ContributionPool__InvalidSignature` | 验签不通过 |
| `ContributionPool__NoFunds` | finalize 时 funded = 0 |
| `ContributionPool__NoContributions` | finalize 时 totalScore = 0 |
| `ContributionPool__NoClaimableAmount` | claim 时 pending = 0 |

---

## EIP-712 Domain

```solidity
string name = "CGHubContributionPool"
string version = "1"
uint256 chainId = 11155111  // Sepolia
address verifyingContract = <部署地址>
```

### ContributionProof TypeHash

```solidity
keccak256(
    "ContributionProof(uint256 projectId,uint256 roundId,address contributor,uint256 score,bytes32 proofHash,bytes32 paymentIdHash,uint256 nonce,uint256 deadline)"
)
```

**字段顺序必须和 Agent 签名侧完全一致，一个字节都不能错。**

---

## 部署信息

| 项目 | 值 |
|------|-----|
| 合约地址 | 待填写 |
| 网络 | Ethereum Sepolia (chainId: 11155111) |
| USDC 地址 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`（Circle 官方 Sepolia USDC） |
| Solidity 版本 | 0.8.24 |
| 框架 | Foundry |

---

## 继承关系

```
Ownable          → onlyOwner 权限控制
EIP712           → _hashTypedDataV4, EIP-712 domain
ReentrancyGuard  → nonReentrant 防重入
```

## 依赖

- `@openzeppelin/contracts/access/Ownable.sol`
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`
- `@openzeppelin/contracts/utils/cryptography/EIP712.sol`
- `@openzeppelin/contracts/utils/cryptography/ECDSA.sol`
- `@openzeppelin/contracts/utils/ReentrancyGuard.sol`
