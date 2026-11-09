# tsdown

Generated tsdown build configuration: entries, outputs and declaration files.

## 1. Tsdown config and entry self-references are hand-built

- sites: `src/tools/tsdown/operations/createTsdownConfig.ts:177` (repeated `=== undefined` checks; a "prop if defined" helper, placed in `src/utils` or toolkit: decision), `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:12` (specifier rebuilt from the entry name; `PathAlias` should carry it).
- want: helper and `PathAlias` specifier.

## 2. Declarations stay bundled because rolldown-plugin-dts keeps externalized `import()` types verbatim

- site: `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:39`
- want: an upstream fix in rolldown-plugin-dts (repository not AUAUST's: stays here, no issue).

## 3. Build lists are maintained by hand beside their source

- sites: `tsdown.config.ts:5` (commander and @clack transitive dependencies, mirrored in `inlinedDependencies`), `src/project/build/setup/createBuildToolStep.ts:4` (build tools not read from `build.tools` contributions).
- want: the bundled dependency closure derived from the package; build tools read from their contributions.

## 4. Bin declarations are generated, then deleted

- site: `src/tools/tsdown/plugins/createOmittedDeclarationsPlugins.ts:6`
- want: tsdown skips bin declarations per entry.
