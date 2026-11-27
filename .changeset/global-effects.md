---
"@auaust/engrenage": minor
---

- Charge references to globals and their static member paths in `auaust/import-effects`, reached directly or through `globalThis` or a host alias, from ranks each environment's execution host ships
- Rank `structure.effects.modules` symbols by member path, the longest listed path winning
- Give configured `node:` keys their bare specifier twin, as shipped ones have
- Rank `node:perf_hooks` per member and `process.stdout` and `process.stderr` members apart
- Rank `import.meta.env` and `process.env.NODE_ENV` `pure` in environments Vite bundles
