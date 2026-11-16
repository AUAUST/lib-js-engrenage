---
"@auaust/engrenage": minor
---

`build.outDir`, `src.bundled` and the src tsconfig `types` follow the selected build tool (Vite: `dist`, bundled, `vite/client`; tsdown: `dist`), and the `library` preset prefers tsdown when `build.tool` is unset.
