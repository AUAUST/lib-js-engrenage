---
"@auaust/engrenage": minor
---

`engrenage sync changesets` (`syncChangesetConfig` from `@auaust/engrenage/changesets`) writes the shared fields of `.changeset/config.json` when `@changesets/cli` is a dependency: `baseBranch`, `commit`, `format`, `updateInternalDependencies`, `access` from `publishConfig.access` (`restricted` by default), `$schema` pinned to the installed `@changesets/config` version, and `changelog`, which uses `@changesets/changelog-github` with `repo` derived from `package.json#repository` when that generator is installed and the repository is on GitHub. Other fields, such as `ignore`, `fixed` and `linked`, stay as the project sets them. `PublishAccess` is exported from `@auaust/engrenage`.

**Breaking:**

- `@auaust/engrenage/vscode/constants` drops `emptyObjectFile` and `formattingOptions`.
