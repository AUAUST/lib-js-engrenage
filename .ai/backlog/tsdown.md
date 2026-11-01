# tsdown

Generated tsdown build configuration: entries, outputs and declaration files.

## 1. tsdown emits declaration files for the bin entry.

- Where: `dist/bin/engrenage.d.mts`, produced by the build from `defineTsdownConfig` (`src/tsdown`).
- Matter: the bin is not a library entry, so its declaration file is useless to consumers and ships in the package.
- Expected: the build emits no declaration files for the bin entry.
- Done when a build leaves no `.d.mts` under `dist/bin/` while library entries keep theirs.
