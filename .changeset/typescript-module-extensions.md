---
"@auaust/engrenage": minor
---

- Drop `.mts` and `.cts` from every environment's TypeScript files by default: globs, tsconfig includes, test patterns, aliases, workspace exports and barrels take `.ts` alone
- Add the `moduleExtensions` TypeScript option, as in `typescript({ moduleExtensions: [".mts", ".cts"] })`, to opt an environment into those module formats
