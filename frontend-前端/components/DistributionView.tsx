interface DistributionViewProps {
  result: string;
}

export function DistributionView({ result }: DistributionViewProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>分账结果</h2>
      </div>
      <div className="status-box">
        {result ? (
          <>
            <p>分账请求已提交：</p>
            <pre>{result}</pre>
          </>
        ) : (
          <p>分账结果会在提交贡献后显示。若没有执行，请检查 Cobo Wallet 是否连接。</p>
        )}
      </div>
    </div>
  );
}
