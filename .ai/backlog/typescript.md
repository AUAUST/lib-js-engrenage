# typescript

Generated tsconfigs: include globs, managed fields and checks.

## 1. Generated `include` uses brace globs that TypeScript does not expand.

- Where: `src/typescript/setup/produceTsconfigInclude.ts`, default `typescript.files` (`**/*.{ts,tsx}`).
- Problem: `include` patterns like `src/**/*.{ts,tsx}` match no file, because TypeScript supports only `*`, `?` and `**/` in them. A generated environment tsconfig therefore includes nothing, and `engrenage typecheck` passes on a type error. Found while testing #68 (the test sets `typescript.files: "**/*.ts"` to work around it).
- Expected: the generated `include` expands braces, or lists one pattern per extension.
- Done when a project on the default `typescript.files` fails `engrenage typecheck` on a type error in `src/` or `tests/`.
