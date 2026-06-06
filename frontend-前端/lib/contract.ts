import { ethers } from "ethers";
import ContributionPoolABI from "./abi/ContributionPool.json";

const EXTENDED_ABI = [
  ...ContributionPoolABI,
  "function owner() view returns (address)",
  "function agentSigner() view returns (address)",
  "event RoundFunded(uint256 indexed projectId,uint256 indexed roundId,uint256 amount)",
  "event ContributionRecorded(uint256 indexed projectId,uint256 indexed roundId,address indexed contributor,uint256 score,bytes32 proofHash,bytes32 paymentIdHash)",
  "event RoundFinalized(uint256 indexed projectId,uint256 indexed roundId)",
  "event Claimed(uint256 indexed projectId,uint256 indexed roundId,address indexed contributor,uint256 amount)",
];

export const POOL_ADDRESS =
  process.env.NEXT_PUBLIC_POOL_ADDRESS ||
  "0x876A0741223EDdaE081Ef22beA513E92335B1Bd5";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/CKaBUdjDAQpKoSMHn5ie3";

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
}

export function getPoolReadOnly() {
  return new ethers.Contract(POOL_ADDRESS, EXTENDED_ABI, getProvider());
}

export function getPoolWithSigner(signer: ethers.Signer) {
  return new ethers.Contract(POOL_ADDRESS, EXTENDED_ABI, signer);
}
