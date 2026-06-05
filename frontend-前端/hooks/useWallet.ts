import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shortAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    setError(null);
    if (typeof window === "undefined") {
      setError("未检测到浏览器环境。请在浏览器中打开该页面。");
      return null;
    }

    const anyWindow = window as any;
    if (!anyWindow.ethereum) {
      setError("未检测到浏览器钱包。请安装 MetaMask 或 Cobo Agentic Wallet 扩展。");
      return null;
    }

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(anyWindow.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      const connectedAddress = await signerInstance.getAddress();
      const network = await provider.getNetwork();

      setAddress(connectedAddress);
      setSigner(signerInstance);
      setChainId(Number(network.chainId));
      return connectedAddress;
    } catch (connectError) {
      console.error(connectError);
      setError("钱包连接失败，请检查钱包并重试。" + (connectError instanceof Error ? ` ${connectError.message}` : ""));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  return {
    address,
    signer,
    chainId,
    shortAddress,
    isLoading,
    isConnected: Boolean(address),
    error,
    connectWallet,
    disconnect,
  };
}
