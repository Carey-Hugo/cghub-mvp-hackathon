/**
 * 模块 2：x402 证明生成
 * x402 在闭环里是"支付层"那一环（方案第三节）。分账主线走 claimFor（见 wallet-agent），
 * 不依赖 x402。x402 演到多深待团队定（方案 3.3），这里先留接口骨架。
 */

import type { X402Proof } from './types.js';

/**
 * 生成 x402 支付证明。
 * TODO: 接 Cobo 原生 payment(x402) 或 caw 的 x402 支付能力；MVP 暂未实现。
 */
export async function generateX402Proof(_challenge: string): Promise<X402Proof> {
  throw new Error('x402 支付尚未接入（方案 3.3：演到多深待团队定）');
}

/** 生成业务支付 id（进 paymentIdHash）。最小实现，先用时间戳串 */
export function newPaymentId(prefix = 'pay'): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${d}-${Math.random().toString(36).slice(2, 8)}`;
}
