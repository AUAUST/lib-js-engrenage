# tsdown

Generated tsdown build configuration: entries, outputs and declaration files.

## 1. tsdown emits declaration files for the bin entry.

- why: the bin is not a library entry, so `dist/bin/engrenage.d.mts`, built from `defineTsdownConfig` (`src/tools/tsdown`), is useless to consumers and ships in the package.
- want: no declaration files for the bin entry.
- done: a build leaves no `.d.mts` under `dist/bin/` while library entries keep theirs.

## 2. Tsdown config and entry self-references are hand-built

- sites: `src/tools/tsdown/operations/createTsdownConfig.ts:201` (repeated `=== undefined` checks; a "prop if defined" helper, placed in `src/utils` or toolkit: decision), `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:12` (specifier rebuilt from the entry name; `PathAlias` should carry it).
- want: helper and `PathAlias` specifier.

## 3. Declarations stay bundled because rolldown-plugin-dts keeps externalized `import()` types verbatim

- site: `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:39`
- want: an upstream fix in rolldown-plugin-dts (repository not AUAUST's: stays here, no issue).

## 4. `tsdown.config.ts` hand-lists transitive dependencies

- site: `tsdown.config.ts:5` (commander and @clack dependencies, mirrored in `inlinedDependencies`).
- want: bundling a package brings its own dependency closure.
