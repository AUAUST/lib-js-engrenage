---
"@auaust/engrenage": minor
---

Add the `workspaces` option: globs of workspace directories, each with a package name pattern (`@scope/app-{dir}`) and tsconfig options. `engrenage sync` keeps `pnpm-workspace.yaml#packages` in line with the globs (`pnpm` target) and writes the managed keys of each workspace `package.json` (`name`, `private`, `version`, `license`, the `#self/*` import) and `tsconfig.json` (`workspaces` target), preserving every other key. tsdown, Vitest, ESLint and the base tsconfig references include the workspaces, and `importRules` forbids root `src` importing a workspace and a workspace importing another that is not a declared dependency.
