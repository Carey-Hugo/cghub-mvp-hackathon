/**
 * 环境变量 + EIP-712 domain/types 常量。集中放，别散在各文件。
 */

import type { ethers } from 'ethers';

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env: ${name}`);
  return v;
}

export const config = {
  // Cobo
  cobo: {
    basePath: env('AGENT_WALLET_API_URL', 'https://api.agenticwallet.cobo.com'),
    apiKey: env('AGENT_WALLET_API_KEY', ''),
    walletUuid: env('AGENT_WALLET_WALLET_UUID', ''),
    chainId: env('COBO_CHAIN_ID', 'SETH'),
  },
  // 链 / 合约
  chain: {
    poolAddress: env('POOL_ADDRESS', '0x876A0741223EDdaE081Ef22beA513E92335B1Bd5'),
    usdcAddress: env('USDC_ADDRESS', '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'),
    chainId: Number(env('CHAIN_ID', '11155111')),
    rpcUrl: env('SEPOLIA_RPC_URL', 'https://ethereum-sepolia-rpc.publicnode.com'),
  },
  round: {
    projectId: BigInt(env('PROJECT_ID', '1')),
    roundId: BigInt(env('ROUND_ID', '1')),
  },
  // agentSigner 私钥（链下签 EIP-712 proof）
  agentPrivateKey: env('AGENT_PRIVATE_KEY', ''),       // 必须等于链上 agentSigner()
  // CAW：用 Cobo SDK 提交链上交易；本地 cobo-tss-node signer 需在线完成钱包签名
  caw: {
    pactId: env('CAW_PACT_ID', ''),
    srcAddress: env('CAW_SRC_ADDRESS', ''), // CAW 钱包 EVM 地址
    chainId: env('COBO_CHAIN_ID', 'SETH'),
  },
};

/** EIP-712 domain（白织说明 9.1） */
export const EIP712_DOMAIN = {
  name: 'CGHubContributionPool',
  version: '1',
  chainId: config.chain.chainId,
  verifyingContract: config.chain.poolAddress,
};

/** EIP-712 types，字段顺序锁死，跟合约 CONTRIBUTION_TYPEHASH 一致 */
export const EIP712_TYPES: Record<string, ethers.TypedDataField[]> = {
  ContributionProof: [
    { name: 'projectId', type: 'uint256' },
    { name: 'roundId', type: 'uint256' },
    { name: 'contributor', type: 'address' },
    { name: 'score', type: 'uint256' },
    { name: 'proofHash', type: 'bytes32' },
    { name: 'paymentIdHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};
