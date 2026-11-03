# eslint-import-context

Upstream eslint-import-context dependency and type issues.

## 1. eslint-import-context type-imports type-fest without depending on it.

- why: `eslint-import-context/lib/types.d.ts` imports `KebabCase` and `LiteralUnion` from `type-fest`, which it does not declare, so the dist type check (`skipLibCheck: false`) fails once a test reaches a source module that loads `eslint-plugin-import-x` (the VS Code sync now does, through the ESLint config). An ambient `type-fest` module in `env.d.ts` stands in for both types.
- want: eslint-import-context declares `type-fest` (or import-x stops exposing those types).
- done: the `type-fest` module is deleted from `env.d.ts`.
