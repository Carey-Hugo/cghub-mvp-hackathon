/**
 * HTTP API 服务：给前端用。
 * 把 4 个工具包成 REST 接口——前端可自行读链，但不碰私钥、不碰 CAW 凭证。
 * CAW 机密凭证只待在本服务的 env 里，绝不下发前端。
 *
 * 跑：npm run api（默认 8787，改 PORT 环境变量）
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { signContributionTool } from '../tools/sign-contribution.js';
import { submitContributionTool } from '../tools/submit-contribution.js';
import { checkPendingTool } from '../tools/check-pending.js';
import { triggerClaimTool } from '../tools/trigger-claim.js';

const PORT = Number(process.env.PORT ?? 8787);

function send(res: ServerResponse, code: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    // 前端是独立 origin，开 CORS（hackathon 先放开，上线再收）
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(text);
}

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {});

    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const path = url.pathname;

    // 健康检查
    if (req.method === 'GET' && path === '/') {
      return send(res, 200, { ok: true, service: 'cghub-agent-api' });
    }

    // 签贡献 → { proof, signature }（只用 agentSigner 私钥，不依赖 CAW）
    if (req.method === 'POST' && path === '/api/sign-contribution') {
      const body = await readJson(req);
      return send(res, 200, await signContributionTool.handler(body));
    }

    // 上链 → { txHash }（执行方钱包发交易）
    if (req.method === 'POST' && path === '/api/submit-contribution') {
      const body = await readJson(req);
      return send(res, 200, await submitContributionTool.handler(body));
    }

    // 查可领 → { pending, score, claimed }（只读 RPC）
    if (req.method === 'GET' && path === '/api/pending') {
      const contributor = url.searchParams.get('contributor');
      if (!contributor) return send(res, 400, { error: '缺 contributor 参数' });
      return send(res, 200, await checkPendingTool.handler({ contributor }));
    }

    // 触发分账 → { txId, status }（后端持 CAW 凭证，走 contractCall claimFor）
    if (req.method === 'POST' && path === '/api/trigger-claim') {
      const body = await readJson(req);
      return send(res, 200, await triggerClaimTool.handler(body));
    }

    send(res, 404, { error: `无此路由: ${req.method} ${path}` });
  } catch (e: any) {
    send(res, 500, { error: e?.message ?? String(e) });
  }
});

server.listen(PORT, () => {
  console.error(`CGHub Agent HTTP API 已启动: http://localhost:${PORT}`);
});
