import { ethers } from "ethers";
import ContributionPoolABI from "./abi/ContributionPool.json";

export const POOL_ADDRESS =
  process.env.NEXT_PUBLIC_POOL_ADDRESS ||
  "0x876A0741223EDdaE081Ef22beA513E92335B1Bd5";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://sepolia.infura.io/v3/REPLACE_WITH_YOUR_KEY";

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
}

export function getPoolReadOnly() {
  return new ethers.Contract(POOL_ADDRESS, ContributionPoolABI, getProvider());
}

export function getPoolWithSigner(signer: ethers.Signer) {
  return new ethers.Contract(POOL_ADDRESS, ContributionPoolABI, signer);
}
