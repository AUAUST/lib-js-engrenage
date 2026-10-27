---
"@auaust/engrenage": minor
---

- Add `config.filesystem`, a cached view of the project files that reads lazily and writes everything on flush
- Sync targets, `syncFiles`, `syncIgnoreFile` and `syncBarrels` take the resolved config first and write through `config.filesystem` instead of returning results
- Read `config.packageJson` and `config.environment` through `config.filesystem`, so they follow pending writes
- Add `--vscode-settings` and `--vscode-extensions` to `engrenage sync`, and create a VS Code file when its `vscode` option is `true`
- Limit the changesets sync to `$schema`; `engrenage init` adds `@changesets/cli` and runs `changeset init`
- Add the `@auaust/engrenage/pnpm` entry; `engrenage init` creates a missing `pnpm-workspace.yaml`
- Declare `@changesets/cli` as an optional peer dependency
