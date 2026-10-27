---
"@auaust/engrenage": minor
---

- Add a `define` config option whose `values` (a record, or a function of `packageJson` and `filesystem`) are serialized and passed as `define` to tsdown, Vite and Vitest
- Add the `define(value, { exact, type, scope })` helper to type a global exactly, override its type or limit it to tests or builds
- Add the `globals` sync target, writing `declare const` declarations into the `// @define` block of `typescript.envFile` (`env.d.ts` by default), disabled by `define.types: false`
- Allow block markers without arguments in `syncBlocks`
- `createViteConfig` takes a `{ tests }` option
