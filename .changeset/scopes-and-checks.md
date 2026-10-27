---
"@auaust/engrenage": minor
---

- Rename the ESLint convention scopes: `files.code`, `files.config`, `files.discovered`, `files.generated`, `files.test`, `files.source`, `files.bin`, `files.scripts`, `files.tests`, `files.code.published` and `files.code.private` select code files; `dir.source`, `dir.bin`, `dir.scripts`, `dir.tests`, `dir.published` and `dir.private` select every file in those directories
- Move `packageJsonPropertyOrder` out of `@auaust/engrenage/eslint/constants`, compose it from shared package.json field groups, and order `optionalDependencies` before `peerDependencies` and `inlinedDependencies` after them
- Run type tests by default in `engrenage vitest`, `vitest:watch` and `vitest:dist`; pass `--no-typecheck` to skip them
- Print a start message and "All good!" for `engrenage vitest`, `vitest:dist`, `vitest:coverage`, `prettier:check` and `sync --check`
- Use `engrenage typecheck:dist` in the standard `build` script
- Reject block markers with an unknown directive or no arguments, and `@end` markers that close no block
