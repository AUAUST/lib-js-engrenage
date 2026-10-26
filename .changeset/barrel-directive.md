---
"@auaust/engrenage": minor
---

`syncBarrels` fills `// @barrel <glob> <mode>` blocks, which replace `@reference` and `@registry`. The glob is relative to the barrel, or to the root with a leading `/`, and matches every module except the barrel itself and declaration files. The mode picks the re-export: `all` writes `export * from`, `named` writes `export { <file> } from` and `default` writes `export { default as <file> } from`; file names that are not identifiers, or that collide, fail. Barrels are found under `directories.source` and selected by directory (`src/eslint`) or, when unambiguous, by directory name. Block fillers receive every argument of their marker.

**Breaking:**

- Barrel blocks must use `@barrel`: `// @reference <directory>` becomes `// @barrel /<directory>/*.ts all`.
- `@auaust/engrenage/typescript/constants` drops `barrelModules`; `barrelFiles` is now one glob matched in each source directory.
