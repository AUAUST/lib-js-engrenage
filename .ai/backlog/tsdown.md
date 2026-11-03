# tsdown

Generated tsdown build configuration: entries, outputs and declaration files.

## 1. tsdown emits declaration files for the bin entry.

- why: the bin is not a library entry, so `dist/bin/engrenage.d.mts`, built from `defineTsdownConfig` (`src/tsdown`), is useless to consumers and ships in the package.
- want: no declaration files for the bin entry.
- done: a build leaves no `.d.mts` under `dist/bin/` while library entries keep theirs.
