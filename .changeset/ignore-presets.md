---
"@auaust/engrenage": minor
---

Add the `gitignore` and `prettierignore` targets to `engrenage sync`, which fill `# @ignore <preset>` blocks in `.gitignore` and `.prettierignore`. A block runs until the next marker, so consecutive presets share one `# @end`. Lines outside the blocks stay as they are, and a file without markers is left untouched. An unknown preset fails with an error naming the marker and the file. Each preset writes one or more titled groups, each under a `# <Title>` comment and separated by blank lines.

Both files offer a `defaults` preset with their fixed groups and a `project` preset with the groups inferred from the config:

- `.gitignore`:
  - `defaults`: `JavaScript` (`node_modules`, pnp and pnpm store files, `*.tgz`, `*.tsbuildinfo`, `.eslintcache`, npm and pnpm debug logs), `Package locks` (the lockfiles of other package managers, never `pnpm-lock.yaml`), `Operating systems` (macOS and Windows metadata files), `Environment` (`.env` and `.env.*`, except `.env.example`), `Logs` (`/logs`, `*.log`) and `Editors` (JetBrains, Fleet, Nova, Sublime Text, Vim swap and Visual Studio files; `.vscode` stays project-owned, since the `vscode` target syncs files there). Each group is also its own preset: `javascript`, `lockfiles`, `os`, `env`, `logs`, `editors`.
  - `project`: `Output` (the tsconfig `outDir`) and `Coverage`, anchored to the root.
- `.prettierignore`:
  - `defaults`: `Package locks` (the `.gitignore` group plus `pnpm-lock.yaml`) and `ESLint suppressions`.
  - `project`: the same `Output` and `Coverage` groups as `.gitignore`, `Changelog` when the project depends on `@changesets/cli`, and `Codegen` with `files.generated` anchored to the root.

The new `@auaust/engrenage/git` entry exports `syncGitignoreFile`, and `@auaust/engrenage/git/constants` its groups. `@auaust/engrenage/prettier` exports `syncPrettierignoreFile`, and `@auaust/engrenage/prettier/constants` its groups, which extend the git ones. `@auaust/engrenage` exports the shared `syncIgnoreFile` with its `IgnorePresets` and `GlobGroup` types. The new `files.prettierignore` config key (default `.prettierignore`) points to the Prettier ignore file.

The resolved config gains `directories.output`, the tsconfig `outDir` when it lies inside the project root. `files.generated` now holds only the configured globs: ESLint adds `coverage/**` and `directories.output` to its ignores itself, so linting ignores the same files as before.
