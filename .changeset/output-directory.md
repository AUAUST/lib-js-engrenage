---
"@auaust/engrenage": minor
---

- Add `directories.output` and `build.emptyOutDir` to `engrenage.config.ts`; the output directory still defaults to the tsconfig `outDir` and is emptied before each build by default
- Apply them to tsdown (`outDir`, `clean`), Vite (`build.outDir`, `build.emptyOutDir`) and the Vitest output guard
- Print "Typechecking..." or "Linting..." before `engrenage tsc`, `tsc:dist` and `eslint`, and "All good!" when they pass
- Load `tsdown.config.ts` with tsx by default in `engrenage tsdown`, and add `tsx` as an optional peer dependency that `engrenage init` installs with tsdown
