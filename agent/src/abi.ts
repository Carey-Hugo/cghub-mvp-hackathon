/**
 * 运行时加载 ContributionPool ABI。
 * ABI 由合约负责人提供，放在 abi/ContributionPool.abi.json，本仓库不存手写版。
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ethers } from 'ethers';

const ABI_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../abi/ContributionPool.abi.json');

let cached: ethers.InterfaceAbi | undefined;

export function loadPoolAbi(): ethers.InterfaceAbi {
  if (cached) return cached;
  if (!existsSync(ABI_PATH)) {
    throw new Error(
      `缺 ABI：把合约的 ContributionPool ABI 放到 ${ABI_PATH}\n` +
        `（forge build → jq '.abi' out/ContributionPool.sol/ContributionPool.json > 该文件）`,
    );
  }
  cached = JSON.parse(readFileSync(ABI_PATH, 'utf8')) as ethers.InterfaceAbi;
  return cached;
}
