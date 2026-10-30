# toolkit

Upstream @auaust/toolkit decisions that may affect engrenage.

## 1. Pending toolkit decisions that may need engrenage support.

- Problem: open toolkit decisions may require engrenage changes; none is a requirement yet, and each is settled in its toolkit issue first.
  - Export check in CI (AUAUST/lib-js-toolkit#110 question 6): if the barrel check joins the shared CI sequence, engrenage's script setup and generated workflows include it.
  - Build-time stripping of helper metadata (AUAUST/lib-js-toolkit#116 question 1, option A): runtime metadata objects must never reach the bundle; a tsdown plugin in engrenage's builder is one option. Optional compile-time erasure of identity looseners (AUAUST/lib-js-toolkit#149 question 5) would use the same mechanism.
  - Translation injection (AUAUST/lib-js-toolkit#119 question 3): injecting translations without bundling them by default may need a build plugin.
  - Build output defects (toolkit backlog `merge.18`, `merge.19`): empty module entries emit `.d.mts` files that fail `typecheck:dist`, and the root namespace object differs from the module entry's namespace in `dist/`. Both come from the tsdown and rolldown-plugin-dts output engrenage's builder configures.
- Done when each decision states whether engrenage must change, and the resulting requirements are separate entries.
