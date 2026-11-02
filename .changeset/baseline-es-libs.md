---
"@auaust/engrenage": minor
---

- **Breaking:** baseline environments type built-ins from TypeScript ES libs selected from the snapshot, written to `lib`, instead of `noLib` and `typescript-baseline-lib`
- **Breaking:** `<env>.tsconfig.lib` is accepted for a baseline environment and replaces or adjusts the selected libs (`esnext.*` libs are added through `append`)
- **Breaking:** `typescript-baseline-lib` is no longer a peer dependency nor added by `engrenage init`; projects can remove it from their `devDependencies`
- **Breaking:** a `src.apis` library group whose lib is already selected is left out of `types` with a warning
