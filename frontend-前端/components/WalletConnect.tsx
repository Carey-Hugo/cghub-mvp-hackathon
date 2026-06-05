import { useMemo } from "react";

interface WalletConnectProps {
  address?: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error?: string | null;
  chainId?: number | null;
  onConnect: () => Promise<string | null>;
  onDisconnect: () => void;
}

export function WalletConnect({
  address,
  isConnected,
  isLoading,
  error,
  chainId,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const shortAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const networkName = chainId === 11155111 ? "Sepolia" : chainId ? `Chain ${chainId}` : "未知网络";

  return (
    <div className="wallet-panel">
      {isConnected ? (
        <>
          <div>
            <p>已连接钱包</p>
            <strong>{shortAddress}</strong>
            <p className="hint">网络：{networkName}</p>
          </div>
          <button className="button secondary" onClick={onDisconnect}>
            断开连接
          </button>
        </>
      ) : (
        <>
          <button className="button primary" disabled={isLoading} onClick={onConnect}>
            连接钱包
          </button>
          <p className="hint">请安装 MetaMask 或 Cobo Agentic Wallet 浏览器扩展。</p>
          {error ? <p className="hint">{error}</p> : null}
        </>
      )}
    </div>
  );
}
