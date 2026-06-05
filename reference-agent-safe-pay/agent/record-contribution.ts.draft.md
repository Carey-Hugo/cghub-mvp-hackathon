# reference-agent-safe-pay/agent/record-contribution.ts · Hermes 草稿备援

> **触发**：2026-06-04 12:00 Hermes 12:00 节点检查 → Agent 风险点第一天，主动补位
> **依据**：`task-assignment-v2.md` §三、§六（Agent 进度慢 → Hermes 主动出 record-contribution 草稿）
> **状态**：🟡 草稿备援，等大番薯 18:00 前回；不回则 Hermes 18:00 推 PR

---

## 4 项 checklist（出 PR 必过）

- [ ] signContribution(contributor, source, evidenceId, score, paymentId) → 返回 { proof, signature, agentSigner }
- [ ] curl 调 /api/sign-contribution 拿到完整返回
- [ ] 用 cast verifyTypedData 自检签名通过
- [ ] 跑通 cast send 上链一条 demo 贡献，scores() 累加成功

## 签名机制（Hermes 已 12:00 拍板）

- **业务层**：x402（agentSigner 私钥放 .env 的 AGENT_PRIVATE_KEY）
- **链上**：EIP-712 验签
- **HTTP 端点**：`/api/sign-contribution`（暴露给前端）
- **canonical payload**：JSON.stringify 字典序序列化
- **参考模板**：`creators-galaxy/02-projects/cghub-mvp-hackathon/docs-文档/agent-signing-template.md`

## 关键参数（来自合约接口文档）

| 参数 | 值 | 备注 |
|------|---|------|
| 合约地址 | `0x876A0741223EDdaE081Ef22beA513E92335B1Bd5` | Sepolia |
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Circle 官方 |
| projectId | 1 | 已开池 |
| roundId | 1 | 已开池 |
| chainId | 11155111 | Sepolia |

## 草稿代码骨架（待大番薯接手 review）

```typescript
// record-contribution.ts · 草稿（Hermes 12:00 备援）
import { ethers } from 'ethers';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY!;
const AGENT_SIGNER_ADDRESS = process.env.AGENT_SIGNER_ADDRESS!;
const RPC_URL = process.env.SEPOLIA_RPC_URL!;
const POOL_ADDRESS = '0x876A0741223EDdaE081Ef22beA513E92335B1Bd5';

const poolAbi = require('./ContributionPool.abi.json');
const provider = new ethers.JsonRpcProvider(RPC_URL);
const agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);

const EIP712_DOMAIN = {
  name: 'CGHubContributionPool',
  version: '1',
  chainId: 11155111,
  verifyingContract: POOL_ADDRESS
};

const CONTRIBUTION_PROOF_TYPES = {
  ContributionProof: [
    { name: 'contributor', type: 'address' },
    { name: 'source', type: 'string' },
    { name: 'evidenceId', type: 'string' },
    { name: 'score', type: 'uint256' },
    { name: 'paymentId', type: 'bytes32' }
  ]
};

export async function signContribution(
  contributor: string,
  source: string,
  evidenceId: string,
  score: string,
  paymentId: string
) {
  // canonical payload（字典序序列化）
  const message = {
    contributor,
    evidenceId,
    paymentId,
    score,
    source
  };

  const signature = await agentWallet.signTypedData(
    EIP712_DOMAIN,
    CONTRIBUTION_PROOF_TYPES,
    message
  );

  return {
    proof: message,
    signature,
    agentSigner: agentWallet.address
  };
}

// HTTP 端点 /api/sign-contribution（Express 风格）
export async function handleSignContribution(req: any, res: any) {
  try {
    const { contributor, source, evidenceId, score, paymentId } = req.body;
    const result = await signContribution(contributor, source, evidenceId, score, paymentId);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
```

## 自检命令（出 PR 必跑）

```bash
# 1. curl 验签端点
curl -X POST http://localhost:3000/api/sign-contribution \
  -H "Content-Type: application/json" \
  -d '{
    "contributor": "0x73E4A8B0Aaf6E12e4cEd1f9cE1bc8567e8581746",
    "source": "github:PR#123",
    "evidenceId": "0xevid123",
    "score": "100",
    "paymentId": "0x0000000000000000000000000000000000000000000000000000000000000001"
  }'

# 2. cast verifyTypedData 自检
cast verifyTypedData \
  0x876A0741223EDdaE081Ef22beA513E92335B1Bd5 \
  "CGHubContributionPool(string version,uint256 chainId,address verifyingContract)" \
  '{"version":"1","chainId":"11155111","verifyingContract":"0x876A0741223EDdaE081Ef22beA513E92335B1Bd5"}' \
  "ContributionProof(address contributor,string source,string evidenceId,uint256 score,bytes32 paymentId)" \
  '{"contributor":"0x73E4A8B0Aaf6E12e4cEd1f9cE1bc8567e8581746","source":"github:PR#123","evidenceId":"0xevid123","score":"100","paymentId":"0x0000000000000000000000000000000000000000000000000000000000000001"}' \
  <signature>

# 3. cast send 上链（需要合约 owner 或 recordContributionBySig 权限）
cast send 0x876A0741223EDdaE081Ef22beA513E92335B1Bd5 \
  "recordContributionBySig((address contributor,string source,string evidenceId,uint256 score,bytes32 paymentId),(bytes signature,address agentSigner),uint256 projectId,uint256 roundId)" \
  ... --rpc-url $SEPOLIA_RPC_URL --private-key $AGENT_PRIVATE_KEY

# 4. 查 scores() 累加
cast call 0x876A0741223EDdaE081Ef22beA513E92335B1Bd5 \
  "scores(uint256,uint256,address)(uint256)" \
  1 1 0x73E4A8B0Aaf6E12e4cEd1f9cE1bc8567e8581746 \
  --rpc-url $SEPOLIA_RPC_URL
```

## DM 给大番薯（Hermes 12:00 已发模板）

```
大番薯，今天 18:00 第一版 record-contribution.ts 截止。
- 4 项 checklist：① EIP-712 签名 ② contributionId 生成 ③ 调合约 recordContributionBySig ④ tx hash 返回
- 模板参考 docs-文档/agent-signing-template.md

【我能帮】Hermes 直接出草稿 PR（你说一声）；review 代码；配测试网环境
【进度同步】今晚 22:00 群内同步，可以吗？
```

---

> **草稿状态**：🟡 备援 | 大番薯 18:00 前接 → 不用推；不回 → Hermes 18:00 推 PR
> **最后更新**：2026-06-04 12:00 | 维护：Hermes
