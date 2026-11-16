---
"@auaust/engrenage": minor
---

- Default `build.outDir`, `src.bundled` and the src tsconfig `types` from the selected build tool (Vite: `dist`, bundled, `vite/client`; tsdown: `dist`)
- Select the build tool the preset prefers when `build.tool` is unset, tsdown for the `library` preset
