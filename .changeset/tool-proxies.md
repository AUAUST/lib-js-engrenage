---
"@auaust/engrenage": minor
---

Add tool proxy commands that run each tool with the flags the engrenage setup implies. They resolve the tool from the project (an optional peer dependency) and fail with the package to install when it is missing. Every further argument is passed to the tool as is, `--help` included, and the tool's exit code or signal becomes engrenage's.

| Command           | Runs                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `tsc`             | `tsc --noEmit --project <files.tsconfig>`                           |
| `tsc:dist`        | `tsc --noEmit --project <files.distTsconfig>`                       |
| `vitest`          | `vitest run --typecheck`                                            |
| `vitest:watch`    | `vitest watch --typecheck`                                          |
| `vitest:coverage` | `vitest run --coverage`                                             |
| `vitest:dist`     | `vitest run --typecheck --mode build`, which tests the built output |
| `tsdown`          | `tsdown`                                                            |
| `vite`            | `vite`                                                              |
| `eslint`          | `eslint --cache --cache-location node_modules/.cache/eslint`        |
| `prettier`        | `prettier --write --ignore-unknown`                                 |
| `prettier:check`  | `prettier --check --ignore-unknown`                                 |
| `prettier:all`    | `prettier --write --ignore-unknown <root>`                          |

The `PackageJson` model exposes the manifest's `bin` field.
