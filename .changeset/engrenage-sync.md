---
"@auaust/engrenage": minor
---

Add `engrenage sync [targets…] [--check]`, which syncs every project file engrenage derives from the config. Without targets it runs all of them. With `--check` it writes nothing, reports each outdated file and exits non-zero. Each changed file is reported as `created`, `synced` or `outdated`. The first targets are `agents` and `vscode`.

The new `@auaust/engrenage/vscode` entry exports `syncVscodeFiles`, and `@auaust/engrenage/vscode/constants` exports the `integrations` it applies. Each integration applies only when the project declares its package:

- `eslint`: ESLint fix on save, with the built-in organize and sort imports actions turned off, plus the ESLint extension recommendation.
- `prettier`: Prettier as the default formatter, format on save and `prettier.requireConfig`, plus the Prettier extension recommendation.
- `typescript`: `js/ts.tsdk.path` pointing to the workspace TypeScript, with the deprecated `typescript.tsdk` removed.

Only these keys are written into `.vscode/settings.json`, and missing recommendations are appended to `.vscode/extensions.json`. Comments and every other key stay as they are. The new `vscode.settings` and `vscode.extensions` config keys decide which files are synced: `true` syncs the file and creates it when missing, `false` ignores it, and the default syncs it only when it exists.

**Breaking:** `engrenage agents sync` is removed in favour of `engrenage sync agents`.

**Breaking:** `syncFiles` takes a list of `{ file, initial?, update }` entries instead of shared `files` and `update` options. A missing file is created from `initial`; without `initial` it fails. `syncFiles`, `syncAgentFiles` and `syncBarrels` now return `{ file, status }` results instead of the outdated file paths. `FileSync`, `SyncResult`, `SyncResults` and `SyncStatus` are exported from `@auaust/engrenage`.
