# abi/

合约编译后导出，丢到这里，文件名固定 `ContributionPool.abi.json`：

```bash
forge build
jq '.abi' out/ContributionPool.sol/ContributionPool.json \
  > .../agent/abi/ContributionPool.abi.json
```

代码运行时从 `src/abi.ts` 读这个文件；没到位会直接报错提示。
