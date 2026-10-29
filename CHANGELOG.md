# @auaust/engrenage

## 0.4.3

### Patch Changes

- [`2721271`](https://github.com/AUAUST/lib-js-engrenage/commit/27212710da21e456efb777067aa49dcd712581c1) Thanks [@apademide](https://github.com/apademide)! - - Fix initialization before engrenage's TypeScript presets are installed
  - Add missing esbuild and resolver build approvals to new and existing pnpm workspaces while preserving explicit choices

- [`1e7c7dc`](https://github.com/AUAUST/lib-js-engrenage/commit/1e7c7dcd8a1af050597c1b7b9e553c13bd43a82c) Thanks [@apademide](https://github.com/apademide)! - - Clarify that user questions invite explanation and comparison without implicitly requesting a change.
  - Require explicit consent for instruction changes and distill requests into minimal, actionable rules with clarified intent.

- [`67c0ca5`](https://github.com/AUAUST/lib-js-engrenage/commit/67c0ca572d3f718f73b99baf06cf261f0ce80ef6) Thanks [@apademide](https://github.com/apademide)! - - Offer Istanbul coverage during init and add the coverage script only when its provider is present
  - Offer a missing coverage script when re-running init with Istanbul installed

- [`d9b284d`](https://github.com/AUAUST/lib-js-engrenage/commit/d9b284ddc146250d3ce9a44c6ae5a9f0a895c967) Thanks [@apademide](https://github.com/apademide)! - - Add optional shared backlog setup and migrate legacy Claude backlogs to `.ai/backlog/`.
  - Add an indexed backlog template, scoped maintenance rules and brief shared agent guidance.
  - Add a shared scratchpad with explicit backlog triage instructions and randomized kawaii placeholders.

## 0.4.2

### Patch Changes

- [`b2ff895`](https://github.com/AUAUST/lib-js-engrenage/commit/b2ff89541f1f3774d0b677b2d9e28b32f8305c03) Thanks [@apademide](https://github.com/apademide)! - Disable too strict TypeScript rules

## 0.4.1

### Patch Changes

- [`1f093b4`](https://github.com/AUAUST/lib-js-engrenage/commit/1f093b4ea16f72ae48f77d03f168cb7c4511548c) Thanks [@apademide](https://github.com/apademide)! - - Allow object literal type assertions while continuing to enforce `as` syntax

- [`5440c22`](https://github.com/AUAUST/lib-js-engrenage/commit/5440c22b18a25e9baafbd81d5e0abfb51eb9e978) Thanks [@apademide](https://github.com/apademide)! - - Allow standalone `void` statements to explicitly ignore promises.

- [`2cf7014`](https://github.com/AUAUST/lib-js-engrenage/commit/2cf7014daedea4eb6e35fe049928868c56f7ec84) Thanks [@apademide](https://github.com/apademide)! - - Allow small objects to remain inline while preserving existing multiline formatting.
  - Wrap objects with three or more properties, nested objects, and sibling objects in arrays and argument lists when one requires multiline formatting.

- [`57212f7`](https://github.com/AUAUST/lib-js-engrenage/commit/57212f721ac18f4fbac0ccd9dc020cc9d615114c) Thanks [@apademide](https://github.com/apademide)! - Add recommended stylistic TypeScript ESLint rules

- [`7c9248f`](https://github.com/AUAUST/lib-js-engrenage/commit/7c9248f78c1e4c89ed6b727d566b4716ef588c29) Thanks [@apademide](https://github.com/apademide)! - - Preserve defined global types from env.d.ts in tsdown declaration output

- [`7dcba49`](https://github.com/AUAUST/lib-js-engrenage/commit/7dcba49fa6e36f59a0a8240059cb6bdccae30bd9) Thanks [@apademide](https://github.com/apademide)! - - Remove legacy Claude hook command migration and the `legacyEditHookCommand` export

- [`41c172a`](https://github.com/AUAUST/lib-js-engrenage/commit/41c172a4909866e2dc82fe3fd32564ff81a6defa) Thanks [@apademide](https://github.com/apademide)! - - Enable recommended typed ESLint rules for code with type checking enabled

## 0.4.0

### Minor Changes

- [`2512af8`](https://github.com/AUAUST/lib-js-engrenage/commit/2512af832820c119e4bcb13816cec2c568f7b084) Thanks [@apademide](https://github.com/apademide)! - - Move Claude commands under `engrenage agents claude` and migrate generated hook commands.
  - Select preferred agents during init and generate setup only for selected agents.
  - Add Codex instructions with a scoped rule mapping and patch formatting hooks.
  - Read paths frontmatter from shared rule sources without embedding it into instruction bodies.

### Patch Changes

- [`a8583d1`](https://github.com/AUAUST/lib-js-engrenage/commit/a8583d1b317c18d3283a0d7b1bfde8be9ae61134) Thanks [@apademide](https://github.com/apademide)! - - Separate reviewing missing setup from approving changes in `engrenage init`
  - Ask before creating Vite, Vitest and tsdown configs or filling missing package fields

- [`42259ed`](https://github.com/AUAUST/lib-js-engrenage/commit/42259eda54e7c713672be577af3b037aa31140a7) Thanks [@apademide](https://github.com/apademide)! - - Add interactive agent rule selection and installation by name.
  - Generate initial agent sections from ordered default metadata.
  - Install only default rules during automatic initialization.

- [`079d6d2`](https://github.com/AUAUST/lib-js-engrenage/commit/079d6d2f43436822f45ea3110e992eaca2c35ccb) Thanks [@apademide](https://github.com/apademide)! - - Allow constant conditions, void expressions as arguments and `await` member access in test files
  - Drop `no-unsafe-member-access` and `unicorn/no-negation-in-equality-check`
  - Allow empty object literals in type assertions
  - Allow concise arrows returning simple arrays or literals asserted `as const`

- [`7c84ebc`](https://github.com/AUAUST/lib-js-engrenage/commit/7c84ebcd94e35ac50432d136e328d9f05842874a) Thanks [@apademide](https://github.com/apademide)! - - Set `publishConfig.access` to `public` when `engrenage init` creates a public scoped package
  - Add the shared `agents/rules/changesets.md` agent rules fragment

- [`b349efa`](https://github.com/AUAUST/lib-js-engrenage/commit/b349efabc56595a4227ada6fd2ee1b9644b9e0c2) Thanks [@apademide](https://github.com/apademide)! - - Require blank lines around let and const declarations except between declarations of the same kind

## 0.3.0

### Minor Changes

- [`75f8994`](https://github.com/AUAUST/lib-js-engrenage/commit/75f8994bac01aafb3647edbc7f335a3db2092ad7) Thanks [@apademide](https://github.com/apademide)! - `define()` and `define.values` accept any JSON-serializable value (including objects with `toJSON`, such as `Date` and `URL`) and fail clearly on values that cannot be serialized. The `GlobalValue` and `Globals` types are removed. The `packageJson` passed to `define.values` exposes standard fields such as `version`, `description`, `license`, `author`, `engines` and `files`, each validated when read.

- [`da30bdb`](https://github.com/AUAUST/lib-js-engrenage/commit/da30bdbd32923ea819bd5cbfb613f310a00e1687) Thanks [@apademide](https://github.com/apademide)! - Enforce the `node:` protocol for Node.js builtin imports and dashed lowercase text encoding identifiers (`utf-8`).

- [`406e89b`](https://github.com/AUAUST/lib-js-engrenage/commit/406e89b17d43365071c3df2bd3d5243d8751ddea) Thanks [@apademide](https://github.com/apademide)! - Rename `auaust/func-style` to `auaust/prefer-function-declaration` and allow function expressions assigned to a typed variable.

- [`3c60f65`](https://github.com/AUAUST/lib-js-engrenage/commit/3c60f6556f94c334bca78b9ad0a5b5e9d7806297) Thanks [@apademide](https://github.com/apademide)! - Group the promise and async rules under the `promises` conventions, reported as `auaust/<rule>` and toggleable per convention. Enable `await-thenable`, allowing promise aggregators to receive arrays that mix promises and other values.

### Patch Changes

- [`e96c744`](https://github.com/AUAUST/lib-js-engrenage/commit/e96c744b9bbf62e22d8690ceca292b03f13e2b50) Thanks [@apademide](https://github.com/apademide)! - Allow `__DUNDER__` variables in the naming convention.

- [`5d2ea4c`](https://github.com/AUAUST/lib-js-engrenage/commit/5d2ea4cf39a2670f9c5802a48f3020aec31331d3) Thanks [@apademide](https://github.com/apademide)! - Autofix naming convention reports by renaming the declaration and its references to camelCase or PascalCase, skipping exported declarations and names that would collide.

- [`fb0d06e`](https://github.com/AUAUST/lib-js-engrenage/commit/fb0d06e263d222100129dde9afd4928ac089229a) Thanks [@apademide](https://github.com/apademide)! - Allow unused parameters named `ignored…`, `unused…` or prefixed with `_` in `no-unused-vars`.

- [`f42f4b8`](https://github.com/AUAUST/lib-js-engrenage/commit/f42f4b8484838ee8b9a613ae78f71e03867f4174) Thanks [@apademide](https://github.com/apademide)! - Add `eslint:fix` and `eslint:suppress` commands, and have `engrenage init` add `typecheck`, `lint:check`, `lint:fix` and `lint:suppress` scripts, with `format` calling `engrenage prettier`.

- [`512d509`](https://github.com/AUAUST/lib-js-engrenage/commit/512d509f56faaa23fc4f4d221bf0cf9e05876253) Thanks [@apademide](https://github.com/apademide)! - Report literals widened by their primitive only when written in the union itself, such as `"a" | string`, no longer through a referenced type, such as `Operator | string`. The rule is now the `auaust/no-redundant-types` convention.

- [`26cfbaa`](https://github.com/AUAUST/lib-js-engrenage/commit/26cfbaae672f08b1748cbfe2e9abe7948197e019) Thanks [@apademide](https://github.com/apademide)! - Allow type parameters used only in a function's declared return type, such as `cast<Value>(target: unknown): Value | null`, which callers use to type the result. Type parameters that are never used, or used only once elsewhere, are still reported. The rule is now the `auaust/no-unnecessary-type-parameters` convention.

## 0.2.0

### Minor Changes

- [`a054aa8`](https://github.com/AUAUST/lib-js-engrenage/commit/a054aa8b9cec532f0e7ae3b8bb698f073da8207e) Thanks [@apademide](https://github.com/apademide)! - - Build every `<bin dir>/<name>.ts` and `<bin dir>/<name>/index.ts` as the `<bin dir>/<name>` entry, from the `bin.dirs` of `engrenage.config.ts`, and remove the tsdown `bins` option

- [`2aa09e6`](https://github.com/AUAUST/lib-js-engrenage/commit/2aa09e6d2019b5cd0a2118358299697f56c89eec) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage claude hook edit`, which fixes, formats and lints the file a Claude Code edit touched and reports the remaining lint errors to the agent
  - Add the hook to `.claude/settings.json` through `engrenage init` and the `claude` sync target, opted out with `agents.claudeSettings: false`
  - Shorten the shared code-style rules to the lint conventions that are not fixed automatically

- [`3bcf531`](https://github.com/AUAUST/lib-js-engrenage/commit/3bcf5316e890283b9683f0260abee6f8a08508e6) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage init` to set up a project, or add the pieces it is missing on later runs
  - `engrenage sync` only updates existing files; `init` creates them
  - Write all synced files at once and restore them when a write fails

- [`0f808a1`](https://github.com/AUAUST/lib-js-engrenage/commit/0f808a1b1bdc784b3e9b0f727e3998bdd6235b87) Thanks [@apademide](https://github.com/apademide)! - - Add a `define` config option whose `values` (a record, or a function of `packageJson` and `filesystem`) are serialized and passed as `define` to tsdown, Vite and Vitest
  - Add the `define(value, { exact, type, scope, description })` helper to type a global exactly, override its type, limit it to tests or builds or document its declaration
  - Add the `globals` sync target, writing `declare const` declarations into the `// @define` block of `typescript.envFile` (`env.d.ts` by default), disabled by `define.types: false`
  - Allow block markers without arguments in `syncBlocks`
  - `createViteConfig` takes an `{ isTesting }` option

- [`fe09f61`](https://github.com/AUAUST/lib-js-engrenage/commit/fe09f618d0dab32efe1f80d665c13840a8b94f4d) Thanks [@apademide](https://github.com/apademide)! - - Accept an `info` severity in conventions, the built-in rule maps and the configs passed to `defineEslintConfig`; ESLint receives it as `warn`
  - Show the rules declared `info` at info severity in VS Code, derived from the project's ESLint config by `engrenage sync`
  - Declare the `naming` and `noUnusedVariables` conventions and the DOM unicorn rules as `info`
  - Enable more unicorn rules for likely bugs, dead code, clearer APIs and early exits, leaving out those that conflict with the toolkit and primitive-kit helpers
  - Add the `stylistic.numericSeparators` convention
  - Make the `vscode` sync target and `syncVscodeFiles` asynchronous

- [`28a8bfa`](https://github.com/AUAUST/lib-js-engrenage/commit/28a8bfab064cbb0a7f84d12da4fd560bc3a07108) Thanks [@apademide](https://github.com/apademide)! - - Root `engrenage init` at the working directory and start a package from an empty directory with `pnpm init --bare`
  - Ask the project type first and use it as the default for the following questions; `--yes` takes every default
  - Ask the package name and visibility, and set `version`, `license`, `private` and `author` when missing
  - Ask the build tool (tsdown, Vite or none) and whether to test with Vitest, and create the matching config files
  - Create a missing `tsconfig.json` and, for libraries, `tsconfig.dist.json`
  - Add the standard scripts for the chosen tools instead of failing placeholder scripts
  - Resolve `packageJsonPath`, `tsconfigPath` and the other file locations through `config.filesystem` when read; a missing configured file now fails when read instead of when the config loads
  - Read tsconfig files inside the project through `config.filesystem`
  - Change `defineViteConfig` to take options first, with a `test` layer, and set `resolve.tsconfigPaths` in `createViteConfig`
  - Add `createVitestLayer`; `createVitestConfig` now returns only the test overrides and `defineVitestConfig` builds on `defineViteConfig`

- [`e9a6f43`](https://github.com/AUAUST/lib-js-engrenage/commit/e9a6f43c498162246e803bc13733d7452cfd3668) Thanks [@apademide](https://github.com/apademide)! - - Split the `stylistic.paddingLines` convention into `paddedReturns`, `paddedMultilineDeclarations`, `paddedMultilineExpressions`, `paddedBlocks`, `imports.paddedImports` and `imports.paddedExports`, each reported under its own `auaust/*` rule
  - Pad types, interfaces, functions, classes, enums, namespaces and block statements with blank lines
  - Add `bracedCases`, `paddedCases`, `unpaddedSwitches` and `groupedOverloads` stylistic conventions

- [`9932dfa`](https://github.com/AUAUST/lib-js-engrenage/commit/9932dfa4d6def1e87944b14fe0ed10cab58c8b8d) Thanks [@apademide](https://github.com/apademide)! - - Add `directories.output` and `build.emptyOutDir` to `engrenage.config.ts`; the output directory still defaults to the tsconfig `outDir` and is emptied before each build by default
  - Apply them to tsdown (`outDir`, `clean`), Vite (`build.outDir`, `build.emptyOutDir`) and the Vitest output guard
  - Print "Typechecking..." or "Linting..." before `engrenage tsc`, `tsc:dist` and `eslint`, and "All good!" when they pass
  - Load `tsdown.config.ts` with tsx by default in `engrenage tsdown`, and add `tsx` as an optional peer dependency that `engrenage init` installs with tsdown

- [`5a9924b`](https://github.com/AUAUST/lib-js-engrenage/commit/5a9924b02331120fb355d6b853a68cd98edaa98a) Thanks [@apademide](https://github.com/apademide)! - - Add the `auaust/prefer-return-void` stylistic convention: a non-function block holding only an expression statement and a bare `return` becomes `return void expression;`
  - Add the `auaust/no-return-undefined` stylistic convention, fixing `return undefined;` into `return;`
  - Enable `no-useless-return` in the recommended rules

- [`254d62c`](https://github.com/AUAUST/lib-js-engrenage/commit/254d62ca91074b560561268d53024551cdfa36a4) Thanks [@apademide](https://github.com/apademide)! - - Add `config.filesystem`, a cached view of the project files that reads lazily and writes everything on flush
  - Sync targets, `syncFiles`, `syncIgnoreFile` and `syncBarrels` take the resolved config first and write through `config.filesystem` instead of returning results
  - Read `config.packageJson` and `config.environment` through `config.filesystem`, so they follow pending writes
  - Add `--vscode-settings` and `--vscode-extensions` to `engrenage sync`, and create a VS Code file when its `vscode` option is `true`
  - Limit the changesets sync to `$schema`; `engrenage init` adds `@changesets/cli` and runs `changeset init`
  - Add the `@auaust/engrenage/pnpm` entry; `engrenage init` creates a missing `pnpm-workspace.yaml`
  - Declare `@changesets/cli` as an optional peer dependency

- [`66a4c72`](https://github.com/AUAUST/lib-js-engrenage/commit/66a4c72f554a30dde8fd46fd2d165feae847e8af) Thanks [@apademide](https://github.com/apademide)! - - Add the `imports.noExternalNamespace` convention, reserving namespace imports and `export * as` re-exports for project modules
  - Sort project namespace imports, then project default imports, into their own groups after the named project imports
  - Group wildcard re-exports after the named ones
  - Let comments partition import sorting, as they already do for exports
  - Report `import-x/no-named-as-default` as an error
  - Remove `performance.noValibotNamespace`, which `imports.noExternalNamespace` covers, and drop namespace imports from `performance.noZodNamespace`
  - Resolve imports against the project's own tsconfig instead of the one in the working directory

- [`477a212`](https://github.com/AUAUST/lib-js-engrenage/commit/477a21274ad42b079befcdeb7f67494be5e2c02d) Thanks [@apademide](https://github.com/apademide)! - `defineViteConfig`, `defineVitestConfig` and `defineTsdownConfig` callbacks now receive the resolved config as their first argument, followed by the tool's own arguments.

- [`cdcb48b`](https://github.com/AUAUST/lib-js-engrenage/commit/cdcb48b14e8b1e023adca2dfc21be392000d4aba) Thanks [@apademide](https://github.com/apademide)! - - Rename the ESLint convention scopes: `files.code`, `files.config`, `files.discovered`, `files.generated`, `files.test`, `files.source`, `files.bin`, `files.scripts`, `files.tests`, `files.code.published` and `files.code.private` select code files; `dir.source`, `dir.bin`, `dir.scripts`, `dir.tests`, `dir.published` and `dir.private` select every file in those directories
  - Move `packageJsonPropertyOrder` out of `@auaust/engrenage/eslint/constants`, compose it from shared package.json field groups, and order `optionalDependencies` before `peerDependencies` and `inlinedDependencies` after them
  - Run type tests by default in `engrenage vitest`, `vitest:watch` and `vitest:dist`; pass `--no-typecheck` to skip them
  - Print a start message and "All good!" for `engrenage vitest`, `vitest:dist`, `vitest:coverage`, `prettier:check` and `sync --check`
  - Use `engrenage typecheck:dist` in the standard `build` script
  - Reject block markers with an unknown directive or no arguments, and `@end` markers that close no block

- [`a054aa8`](https://github.com/AUAUST/lib-js-engrenage/commit/a054aa8b9cec532f0e7ae3b8bb698f073da8207e) Thanks [@apademide](https://github.com/apademide)! - - Group `engrenage.config.ts` by meaning instead of by kind, and mirror the groups on the resolved config:
    - `code: { files, configFiles, discoveredFiles }`
    - `source: { dirs }`, `bin: { dirs }`, `scripts: { dirs }`, with `src`, `bin` and `scripts` as defaults
    - `test: { dirs, files, fixtureFiles, coverageDir }`
    - `build: { outDir, emptyOutDir }`
    - `codegen: { files }`
    - `typescript: { tsconfig, distTsconfig }`, `git: { gitignore }`, `prettier: { prettierignore }`
    - `agents: { instructionFiles, snippetsDir }`
  - Remove `directories`, `files`, `tsconfigPath`, `distTsconfigPath`, `gitignorePath` and `prettierignorePath` from the resolved config
  - Accept a single string or an array for every input list, including `presets`
  - Rename the ESLint convention scopes to `code`, `config`, `discovered`, `testFiles`, `source`, `bin`, `scripts`, `tests`, `public` (source and bin) and `private` (tests and scripts)
  - `filesIn` takes one or more directories and globs and returns every combination

- [`6cdd03e`](https://github.com/AUAUST/lib-js-engrenage/commit/6cdd03e0e9e9e6927ad39736f585e699e2b2f6d2) Thanks [@apademide](https://github.com/apademide)! - - Expose every convention rule as `auaust/<rule>`, named after the upstream rule it delegates to, with our options as defaults that projects override key by key; the upstream rule is turned off where the convention applies
  - Rename the convention rules accordingly (`curly` becomes `auaust/curly`, `import-x/no-duplicates` becomes `auaust/no-duplicates`, `@stylistic/padded-blocks` becomes `auaust/unpadded-switches`, …) and replace the `rules` field of conventions with `delegates` and `severity`
  - Replace the `bracedCases` convention with `switches` (`unicorn/switch-case-braces`, `no-fallthrough` reporting unused fallthrough comments) and `noReturnUndefined` with `noUselessUndefined` (`unicorn/no-useless-undefined`)
  - Add the `assignments`, `conditionals`, `exhaustiveSwitches`, `functionDeclarations`, `nameReplacements`, `naming`, `objects`, `typeChecks`, `typeStyle`, `voidPlacement` and `voidReturns` stylistic conventions, `comparisons.noTypeofUndefined`, `imports.noCommonjs` and `promises.returnAwait`
  - Report `naming-convention` as a warning, shown as info in VS Code
  - Replace the `recommendedRules` constant with one constant per plugin: `coreRules`, `typescriptRules`, `typescriptTypeAwareRules`, `importRules`, `stylisticRules` and `unicornRules`
  - Add `eslint-plugin-unicorn` and enable `unicorn/prefer-node-protocol`
  - Enable more correctness rules from ESLint, typescript-eslint (type-aware ones on published and private code) and import-x
  - Enable the recommended `eslint-plugin-package-json` validators
  - Add the `typeAware` ESLint option to turn off every rule that needs type information

### Patch Changes

- [`895ff77`](https://github.com/AUAUST/lib-js-engrenage/commit/895ff77f12aa73fcc9a4ddfc7498c2227539e301) Thanks [@apademide](https://github.com/apademide)! - - Add the `globals.noMathStatics` convention, reporting the `Math` functions that `@auaust/toolkit/math` replaces
  - Let `defineGlobalReplacement` take the list of properties to report

- [`fe1f048`](https://github.com/AUAUST/lib-js-engrenage/commit/fe1f0484df569c31894eb9c604a23a79338475d9) Thanks [@apademide](https://github.com/apademide)! - - Enforce consistent property quotes with `auaust/quote-props` (all quoted or none, methods and shorthand left alone) and set Prettier's `quoteProps` to `preserve`
  - Keep quoted keys in long form with `auaust/object-shorthand` while accepting quoted method shorthand
  - Prefer type arguments on the constructor with `auaust/consistent-generic-constructors`
  - Pad switch cases only once a case body spans several lines or the switch already uses blank lines
  - Let `delegateRule` take its name and the upstream messages to ignore as options

- [`359529f`](https://github.com/AUAUST/lib-js-engrenage/commit/359529fbc85e66efcb106ff90247758cbdff1387) Thanks [@apademide](https://github.com/apademide)! - Allow template literal bodies in `auaust/no-complex-concise-arrows`, restrict `auaust/no-runtime-typeof` to `typeof` comparisons, and configure `prefer-const` with `destructuring: "all"` through the new `stylistic.preferConst` convention.

- [`3c0e7db`](https://github.com/AUAUST/lib-js-engrenage/commit/3c0e7db308501bc2320ee4fc80ae680eafd44736) Thanks [@apademide](https://github.com/apademide)! - - Require `eslint` as a peer dependency, since the `engrenage` CLI always loads it

- [`0728692`](https://github.com/AUAUST/lib-js-engrenage/commit/0728692872b58b4d0b4c2170a80c443ac73f25c3) Thanks [@apademide](https://github.com/apademide)! - The package.json property order places `sideEffects` and tool configs such as `prettier` after scripts and dependencies.

## 0.1.1

### Patch Changes

- [`58c32c3`](https://github.com/AUAUST/lib-js-engrenage/commit/58c32c3c6384a48e43e9c8ca617fd8cf47a49542) Thanks [@apademide](https://github.com/apademide)! - Fix TS2883 in consumer config files that emit declarations: `@auaust/engrenage/config` now re-exports `ConfigInput`, and `Config` and `ResolvedConfig` are interfaces, so their inferred types are named through public entries.

- [`43822b1`](https://github.com/AUAUST/lib-js-engrenage/commit/43822b11a588ffe443d8a8faa3e99f4e17480bed) Thanks [@apademide](https://github.com/apademide)! - The tsdown preset enables `publint` and `attw` only when the project depends on `publint` and `@arethetypeswrong/core`, instead of failing at the pack step when they are not installed.

## 0.1.0

### Minor Changes

- [`fc32d19`](https://github.com/AUAUST/lib-js-engrenage/commit/fc32d19cb8ee56a5aa7781faf62e9b609ae2c565) Thanks [@apademide](https://github.com/apademide)! - `importOrder` puts `@auaust/*` imports in their own group, between the other packages and the project imports, with value imports before type-only imports. The autofix reorders existing imports.

- [`d692c46`](https://github.com/AUAUST/lib-js-engrenage/commit/d692c4678afa3d1bb2cead5253a10eda5ba66571) Thanks [@apademide](https://github.com/apademide)! - `syncBarrels` fills `// @barrel <glob> <mode>` blocks, which replace `@reference` and `@registry`. The glob is relative to the barrel, or to the root with a leading `/`, and matches every module except the barrel itself and declaration files. The mode picks the re-export: `all` writes `export * from`, `named` writes `export { <file> } from` and `default` writes `export { default as <file> } from`; file names that are not identifiers, or that collide, fail. Barrels are found under `directories.source` and selected by directory (`src/eslint`) or, when unambiguous, by directory name. Block fillers receive every argument of their marker.
  
  **Breaking:**
  
  - Barrel blocks must use `@barrel`: `// @reference <directory>` becomes `// @barrel /<directory>/*.ts all`.
  - `@auaust/engrenage/typescript/constants` drops `barrelModules`; `barrelFiles` is now one glob matched in each source directory.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `engrenage sync changesets` (`syncChangesetConfig` from `@auaust/engrenage/changesets`) writes the shared fields of `.changeset/config.json` when `@changesets/cli` is a dependency: `baseBranch`, `commit`, `format`, `updateInternalDependencies`, `access` from `publishConfig.access` (`restricted` by default), `$schema` pinned to the installed `@changesets/config` version, and `changelog`, which uses `@changesets/changelog-github` with `repo` derived from `package.json#repository` when that generator is installed and the repository is on GitHub. Other fields, such as `ignore`, `fixed` and `linked`, stay as the project sets them. `PublishAccess` is exported from `@auaust/engrenage`.
  
  **Breaking:**
  
  - `@auaust/engrenage/vscode/constants` drops `emptyObjectFile` and `formattingOptions`.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - `loadConfig` finds `engrenage.config.*` with c12's own lookup, so the config can also live in `.config/` (`.config/engrenage.ts` or `.config/engrenage.config.ts`), in any format c12 supports. The lookup starts in the given directory (`process.cwd()` by default) and walks up to the nearest `package.json`, so tools running from a subdirectory of the project find it. The project root is the directory holding the config, or the parent of `.config/`. Without a config, the defaults are rooted at the nearest `package.json` directory, or the starting directory when there is none.
  
  **Breaking:**
  
  - Several config files in one directory no longer fail: c12 picks the first in its order.
  - The config of a parent directory now applies to its subdirectories, up to the nearest `package.json`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `directories.source` defaults to `["src", "bin", "scripts"]`, so conventions scoped to source directories and barrel discovery cover `bin/` and `scripts/` without configuration. Missing directories are ignored, and a configured list still replaces the default.

- [`13381c8`](https://github.com/AUAUST/lib-js-engrenage/commit/13381c8146bfebe141dbfaf7a5addf52033a3a27) Thanks [@apademide](https://github.com/apademide)! - Expose each domain's constants as an entry, so projects can reuse engrenage's defaults: `@auaust/engrenage/config/constants` (global config defaults such as `defaultCodeFiles`, `defaultSourceDirectories`, `defaultFixtureFiles`, `builtinGeneratedFiles`, and known file names), `@auaust/engrenage/eslint/constants`, `@auaust/engrenage/typescript/constants`, `@auaust/engrenage/agents/constants` and `@auaust/engrenage/prettier/constants` (`defaultOptions`, also the default export of `@auaust/engrenage/prettier`).

- [`97c8faf`](https://github.com/AUAUST/lib-js-engrenage/commit/97c8faf4623ee576a4637e3c96882f9291993914) Thanks [@apademide](https://github.com/apademide)! - Add `engrenage sync [targets…] [--check]`, which syncs every project file engrenage derives from the config. Without targets it runs all of them. With `--check` it writes nothing, reports each outdated file and exits non-zero. Each changed file is reported as `created`, `synced` or `outdated`. The first targets are `agents` and `vscode`.
  
  The new `@auaust/engrenage/vscode` entry exports `syncVscodeFiles`, and `@auaust/engrenage/vscode/constants` exports the `integrations` it applies. Each integration applies only when the project declares its package:
  
  - `eslint`: ESLint fix on save, with the built-in organize and sort imports actions turned off, plus the ESLint extension recommendation.
  - `prettier`: Prettier as the default formatter, format on save and `prettier.requireConfig`, plus the Prettier extension recommendation.
  - `typescript`: `js/ts.tsdk.path` pointing to the workspace TypeScript, with the deprecated `typescript.tsdk` removed.
  
  Only these keys are written into `.vscode/settings.json`, and missing recommendations are appended to `.vscode/extensions.json`. Comments and every other key stay as they are. The new `vscode.settings` and `vscode.extensions` config keys decide which files are synced: `true` syncs the file and creates it when missing, `false` ignores it, and the default syncs it only when it exists.
  
  **Breaking:** `engrenage agents sync` is removed in favour of `engrenage sync agents`.
  
  **Breaking:** `syncFiles` takes a list of `{ file, initial?, update }` entries instead of shared `files` and `update` options. A missing file is created from `initial`; without `initial` it fails. `syncFiles`, `syncAgentFiles` and `syncBarrels` now return `{ file, status }` results instead of the outdated file paths. `FileSync`, `SyncResult`, `SyncResults` and `SyncStatus` are exported from `@auaust/engrenage`.

- [`491bbff`](https://github.com/AUAUST/lib-js-engrenage/commit/491bbff9a1448fd1b046d4c4c8f118af45138377) Thanks [@apademide](https://github.com/apademide)! - Every entry now re-exports all of its types, and the root entry every shared helper. New exports:
  
  - `@auaust/engrenage`: `validate` (valibot validation with errors naming the subject and each failing key) and the read-only list types `Directories`, `Files` and `Globs`;
  - `@auaust/engrenage/eslint`: `AuaustRules`, `PerfectionistRules` and `UnusedImportsRules`;
  - `@auaust/engrenage/prettier`: `Options`;
  - `@auaust/engrenage/typescript`: `BarrelMode` and `Tsconfig`.

- [`e70afad`](https://github.com/AUAUST/lib-js-engrenage/commit/e70afad37f3b25e75335575531e2df7f043571c1) Thanks [@apademide](https://github.com/apademide)! - Add `defineEslintConfig(options | (engrenage) => options, ...configs)` to `@auaust/engrenage/eslint`. It loads `engrenage.config.ts`, builds the AUAUST configuration from the global values (`directories.source`, `directories.test`, `files.code`, `files.test`, `files.fixtures`, `files.config`, `files.discovered`, `files.generated`, `files.gitignore`), appends the native ESLint configs, and resolves to the flat config array, so `eslint.config.ts` can export it directly. Options toggle categories by purpose:
  
  - `ignore`: the gitignore file, `files.generated`, `coverage/**`, the tsconfig `outDir` and `files.fixtures` under each test directory (`tests/**/fixtures/**` by default);
  - `recommended`: the ESLint and typescript-eslint presets with the AUAUST adjustments;
  - `globals`, `comparisons`, `stylistic`, `imports`, `promises`, `structure`: `false` turns the whole category off, and an object turns off single conventions (`{ comparisons: { noRuntimeTypeof: false } }`). Unknown keys are rejected.
  
  Each restriction is now its own rule under the `auaust/` namespace (`auaust/no-runtime-typeof`, `auaust/no-array-is-array`, `auaust/no-object-statics`, `auaust/no-is-null`, `auaust/no-is-undefined`, `auaust/no-loose-undefined`, `auaust/no-complex-concise-arrows`, `auaust/no-dynamic-import`, `auaust/no-misplaced-tests`), typed in `Rules`. Scoping one off is a native config (`{ files: ["src/utils/is*.ts"], rules: { "auaust/no-runtime-typeof": "off" } }`), and the project's own `no-restricted-syntax` and `no-restricted-properties` no longer replace engrenage's restrictions. `Array.isArray` is now also reported when destructured or accessed with brackets.
  
  `ConfigInput` accepts callback arguments. Validation errors from a union now name the failing nested key.
  
  **Breaking:**
  
  - `createEslintConfig` now takes `(config: ResolvedConfig, options?: Options)` instead of `Conventions`; the `Conventions` type is removed.
  - `createBaseRules`, `createImportRules`, `createStylisticRules`, `createRestrictedSyntaxRules` and `createPromiseRules` are removed: use `defineEslintConfig` options.
  - `filesIn(directory, codeFiles)` takes the code files glob.
  - Restriction reports and `eslint-disable` comments use the `auaust/…` rule IDs instead of `no-restricted-syntax` and `no-restricted-properties`.
  - `syncBlocks(content, syntax, fillers)` takes a record of fillers keyed by directive instead of one fill function.
  - `restrictImports`, `restrictProperties`, `restrictSyntax` and the `ImportPattern`, `RestrictedProperty` and `SyntaxRestriction` types are removed: each restriction is its own `auaust/*` rule, and `Rules` types the options of `no-restricted-imports`, `no-restricted-properties` and `no-restricted-syntax`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `createTsdownConfig` builds ES modules only: it sets `format: "esm"` and resolves bundled dependencies through their `module` field before `main`.
  
  **Breaking:**
  
  - A `package.json` without `"type": "module"` fails the build.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `files.fixtures` is matched inside each test directory, and the resolved `config.files.fixtures` lists the resulting root-relative globs (`tests/**/fixtures/**` by default). ESLint ignores and Vitest excludes the same files.
  
  **Breaking:**
  
  - Vitest no longer excludes fixture directories outside the test directories.
  - `config.files.fixtures` is a list of globs instead of a single glob.
  - `filesIn` moves from `@auaust/engrenage/eslint` to the root entry.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - tsdown entries skip tsconfig path aliases that are neither the package name nor one of its subpaths (`~/*`, `@/*`, `$lib/*`) instead of failing, so projects with internal aliases can build. Those aliases keep resolving from the tsconfig in TypeScript, tsdown and Vitest. The package's own aliases are still validated.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `directories.coverage` (default `coverage`) sets the coverage directory: Vitest writes its reports there, ESLint ignores it, and the `project` ignore preset lists it in `.gitignore` and `.prettierignore`. File names shared across tools, package names and the `package.json` types (`PackageType`) live in the root constants.
  
  **Breaking:**
  
  - `@auaust/engrenage/config/constants` drops `coverageDirectory` (now `defaultCoverageDirectory`), `configFileName`, `packageFile` and the `default…File` names of `tsconfig.json`, `tsconfig.dist.json`, `.gitignore` and `.prettierignore`, which move to the root constants as `engrenageConfigFile`, `packageFile`, `tsconfigFile`, `distTsconfigFile`, `gitignoreFile` and `prettierignoreFile`.
  - The root constant `changesets` is renamed `changesetsCli`.
  - `@auaust/engrenage/git/constants` drops `coverageIgnores`, and the `defaults` ignore preset no longer lists the coverage directory.

- [`be428e8`](https://github.com/AUAUST/lib-js-engrenage/commit/be428e8d2acb017362ab868f904c8d3c094059e1) Thanks [@apademide](https://github.com/apademide)! - Add the `gitignore` and `prettierignore` targets to `engrenage sync`, which fill `# @ignore <preset>` blocks in `.gitignore` and `.prettierignore`. A block runs until the next marker, so consecutive presets share one `# @end`. Lines outside the blocks stay as they are, and a file without markers is left untouched. An unknown preset fails with an error naming the marker and the file. Each preset writes one or more titled groups, each under a `# <Title>` comment and separated by blank lines.
  
  Both files offer a `defaults` preset with their fixed groups and a `project` preset with the groups inferred from the config:
  
  - `.gitignore`:
    - `defaults`: `JavaScript` (`node_modules`, pnp and pnpm store files, `*.tgz`, `*.tsbuildinfo`, `.eslintcache`, npm and pnpm debug logs), `Package locks` (the lockfiles of other package managers, never `pnpm-lock.yaml`), `Operating systems` (macOS and Windows metadata files), `Environment` (`.env` and `.env.*`, except `.env.example`), `Logs` (`/logs`, `*.log`) and `Editors` (JetBrains, Fleet, Nova, Sublime Text, Vim swap and Visual Studio files; `.vscode` stays project-owned, since the `vscode` target syncs files there). Each group is also its own preset: `javascript`, `lockfiles`, `os`, `env`, `logs`, `editors`.
    - `project`: `Output` (the tsconfig `outDir`) and `Coverage`, anchored to the root.
  - `.prettierignore`:
    - `defaults`: `Package locks` (the `.gitignore` group plus `pnpm-lock.yaml`) and `ESLint suppressions`.
    - `project`: the same `Output` and `Coverage` groups as `.gitignore`, `Changelog` when the project depends on `@changesets/cli`, and `Codegen` with `files.generated` anchored to the root.
  
  The new `@auaust/engrenage/git` entry exports `syncGitignoreFile`, and `@auaust/engrenage/git/constants` its groups. `@auaust/engrenage/prettier` exports `syncPrettierignoreFile`, and `@auaust/engrenage/prettier/constants` its groups, which extend the git ones. `@auaust/engrenage` exports the shared `syncIgnoreFile` with its `IgnorePresets` and `GlobGroup` types. The new `files.prettierignore` config key (default `.prettierignore`) points to the Prettier ignore file.
  
  The resolved config gains `directories.output`, the tsconfig `outDir` when it lies inside the project root. `files.generated` now holds only the configured globs: ESLint adds `coverage/**` and `directories.output` to its ignores itself, so linting ignores the same files as before.

- [`ee88308`](https://github.com/AUAUST/lib-js-engrenage/commit/ee88308e303a980897ab329742b7c8b988a87c37) Thanks [@apademide](https://github.com/apademide)! - Add the `importOrder`, `exportOrder` and `noUnused` conventions to the ESLint `imports` category, all autofixable.
  
  - `importOrder` (eslint-plugin-perfectionist) groups imports by source, separated by blank lines: side-effect imports, Node builtins, packages, then project imports (subpath `#…`, internal and relative). Within each group, value imports come before type-only imports, and paths are sorted naturally. Inside braces, values come before types.
  - `exportOrder` sorts exports naturally with values before types. Comments split exports into separate sections that are sorted independently, so generated blocks stay intact.
  - `noUnused` (eslint-plugin-unused-imports) removes unused imports.
  
  `support codegen barrels` now writes re-exports in the same natural order.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - `importOrder` reads the project tsconfig, so imports through any path alias (`$lib/…`, `§/…`) sort with the project imports instead of the packages. Imports are classified with TypeScript's module resolution.
  
  `Convention.rules` and the `rules` of `defineConvention` accept a function of the resolved config, for rule options that depend on the project.

- [`9c59743`](https://github.com/AUAUST/lib-js-engrenage/commit/9c597431b34d32d859e64d1fc3eaa6d679c80231) Thanks [@apademide](https://github.com/apademide)! - Two new shared agent rules describe the AUAUST helper libraries:
  
  - `@auaust/engrenage/agents/rules/prefer-toolkit.md` covers the `@auaust/toolkit` conventions: object helpers instead of `Object.*`, `isArray`, `isNull`/`isUndefined` only as callbacks, subpath entries, `is<Type>` helpers, and preferring toolkit when primitive-kit provides the same helper.
  - `@auaust/engrenage/agents/rules/prefer-primitive-kit.md` covers the `@auaust/primitive-kit` conventions: subpath entries, and helpers over native methods with an equivalent.
  
  A project that depends on a library references its rule from `.claude/rules/`, so the rule is either present and strict or absent.
  
  **Breaking:** `code-style.md` and the `auaust-libraries` section no longer mention toolkit or primitive-kit. Projects using these libraries must reference the new rules to keep that guidance.

- [`7e49ec9`](https://github.com/AUAUST/lib-js-engrenage/commit/7e49ec9f1e2ae74fbdef944f5b4fae391905213d) Thanks [@apademide](https://github.com/apademide)! - Add the `library.json` and `library.dist.json` tsconfig presets. `library.json` extends `base.json` and places `outDir` and `rootDir` in the consuming project. `library.dist.json` type-checks `tests/**/*.ts` and every `env.d.ts` against the built package; extend it after the project's own tsconfig (`"extends": ["./tsconfig.json", "@auaust/engrenage/tsconfig/library.dist.json"]`).
  
  **Breaking:** `base.json` now sets `declaration: false`, so running `tsc` directly no longer writes `.d.ts` files next to sources. Build tools that generate declarations must enable them explicitly (for tsdown: `dts: { compilerOptions: { declaration: true } }`).

- [`426e165`](https://github.com/AUAUST/lib-js-engrenage/commit/426e165bf3ebc79789ea4b60643b95e88e4161ed) Thanks [@apademide](https://github.com/apademide)! - `engrenage sync workflows` (`syncWorkflowFiles` from the new `@auaust/engrenage/github` entry) writes the GitHub Actions workflows of a workflow set into `.github/workflows/`. Each file starts with a generated header and is overwritten as a whole. A project uses the set named after one of its presets, provided it declares the set's required packages. The new `github.workflows` config key picks a set explicitly, or turns the workflows off with `false`. `@auaust/engrenage/github/constants` exports `workflowSets`, and the templates ship as `@auaust/engrenage/github/workflows/<set>/*.yml`.
  
  The `library` set needs `@changesets/cli` and the `ci:check`, `ci:test`, `ci:build` and `ci:publish` scripts; sync fails when `package.json` does not declare one of them.
  
  - `ci.yml` runs on pull requests and on pushes to branches other than `main`. It installs with `--frozen-lockfile`, then runs `ci:check`, `ci:test` and `ci:build` as separate steps.
  - `publish.yml` runs on pushes to `main`. It runs the same steps, then `changesets/action` with `ci:publish`, and declares `id-token`, `contents` and `pull-requests: write`.
  - Node is set up with `node-version-file: package.json`, so the project declares its CI Node version in `devEngines.runtime` (or `engines.node`). pnpm comes from `devEngines.packageManager`.
  
  `PackageJson` exposes `scripts`.

- [`e73fece`](https://github.com/AUAUST/lib-js-engrenage/commit/e73feceade383e7e1271ba2fc9ef2f8f0d2b2f53) Thanks [@apademide](https://github.com/apademide)! - Report `*.test.*` and `*.spec.*` TypeScript files outside the test directories in `createEslintConfig` and `createRestrictedSyntaxRules`, which now accepts `testDirectories` (default `["tests"]`). Export the `testFiles`, `testDirectories` and `misplacedTestRestriction` configuration values from `@auaust/engrenage/eslint`.

- [`fc32d19`](https://github.com/AUAUST/lib-js-engrenage/commit/fc32d19cb8ee56a5aa7781faf62e9b609ae2c565) Thanks [@apademide](https://github.com/apademide)! - Native configs passed to `defineTsdownConfig` and `defineEslintConfig` can be callbacks, like those of `defineViteConfig` and `defineVitestConfig`: `(inlineConfig, context, engrenage) => config` for tsdown and `(engrenage) => config` for ESLint, sync or async. A callback returning nothing adds no config.

- [`ee88308`](https://github.com/AUAUST/lib-js-engrenage/commit/ee88308e303a980897ab329742b7c8b988a87c37) Thanks [@apademide](https://github.com/apademide)! - Add the `noLooseEqual` convention to the ESLint `comparisons` category: strict equality is required except for `== null`, `typeof` comparisons and comparisons between two literals (`eqeqeq: ["error", "smart"]`).

- [`ae85512`](https://github.com/AUAUST/lib-js-engrenage/commit/ae8551214a937b5af32ea75b45abcdef546e9a07) Thanks [@apademide](https://github.com/apademide)! - New `imports.noUnusedVariables` convention: unused local variables, functions and types are reported as warnings (`unused-imports/no-unused-vars`), so imports only they use can be removed too. The VS Code sync shows them as info through `eslint.rules.customizations`. Turn it off with `imports: { noUnusedVariables: false }`.

- [`fc32d19`](https://github.com/AUAUST/lib-js-engrenage/commit/fc32d19cb8ee56a5aa7781faf62e9b609ae2c565) Thanks [@apademide](https://github.com/apademide)! - The ESLint config now lints every `package.json` with eslint-plugin-package-json: top-level keys follow the sort-package-json order (`package-json/order-properties`), and `config`, `dependencies`, `devDependencies`, `optionalDependencies`, `overrides`, `peerDependencies`, `peerDependenciesMeta` and `scripts` are sorted (`package-json/sort-collections`). `exports` keeps its order, since tsdown generates it. Both rules are autofixable and typed in `Rules`. The `packageJson: false` option turns them off.

- [`ae85512`](https://github.com/AUAUST/lib-js-engrenage/commit/ae8551214a937b5af32ea75b45abcdef546e9a07) Thanks [@apademide](https://github.com/apademide)! - `package-json/order-properties` now follows the sort-package-json order with `bin` and `scripts` moved right after `type`, and `inlinedDependencies` right after `devDependencies`. `sort-collections` now sorts `inlinedDependencies` (it listed the misspelled `inlineDependencies`).

- [`cacf66f`](https://github.com/AUAUST/lib-js-engrenage/commit/cacf66f6c3a9eb46a73db87efa04d1bb325e1ce6) Thanks [@apademide](https://github.com/apademide)! - Add the `@auaust/engrenage/config` entry and its `engrenage.config.ts` project file, which holds globally relevant values: `directories` (`source`, `test`), `files` (`code`, `test`, `fixtures`, `config`, `discovered`, `generated`, `gitignore`, `tsconfig`) and `agents` (`instructionFiles`, `snippetsDirectory`). `defineConfig` types the file and accepts either the config object or a callback returning it, sync or async. That input shape is exported as `ConfigInput<Data>` from `@auaust/engrenage`, for every `define…Config` to share. `loadConfig(cwd?)` looks for `engrenage.config.*` in the current directory only (no upward search, no `.config/` directory), warns once and falls back to defaults when it is missing, and rejects unknown keys with an error naming the file and each key path. `loadConfig` reads no project file besides `engrenage.config.*`: it validates it and locates `package.json`, `files.tsconfig` (`tsconfig.json` by default) and `files.gitignore` (`.gitignore` by default). A configured file that does not exist fails, even under its default name; a missing default file resolves to `undefined`. The resolved config holds `root`, `raw` (the validated config as written, without defaults), the absolute `packageJsonPath`, `tsconfigPath` and `gitignorePath`, and `resolve()`, which resolves a path against the root and rejects paths escaping it. Everything else is a lazy, memoized getter, so a file is only read when a value needs it: `directories`, `files` and `agents` merge the defaults with the config; `files.generated` defaults to an empty list. `packageJson` (`manifest`, `name`, `imports`) and `tsconfig` (`compilerOptions` with `extends` and `${configDir}` resolved by TypeScript, root-relative `outDir`, `paths`) expose strict accessors that fail when the file or the field is missing, mirrored under `optional` by accessors returning `undefined` instead; invalid values fail in both. `PackageJson` and `Accessors` are exported from `@auaust/engrenage/config`, and `Tsconfig` from `@auaust/engrenage/typescript`. `c12` and `valibot` are now runtime dependencies.
  
  `engrenage agents sync` reads `agents.instructionFiles` from the config. A bare reference first resolves inside `agents.snippetsDirectory` when the file exists there, then as a package specifier. An unresolved reference fails, naming the reference and the file. `resolveAgentReference` is exported from `@auaust/engrenage/agents`.
  
  **Breaking:**
  
  - `engrenage agents sync` drops `--root`: run it from the project root.
  - `syncAgentFiles` now takes `{ config, check }`, where `config` comes from `loadConfig`, instead of `{ root, check }`.
  - `@auaust/engrenage/eslint` no longer exports `baseRules`, `importRules`, `promiseRules`, `stylisticRules`, `syntaxRestrictions`, `sourceSyntaxRestrictions`, `restrictedProperties`, `misplacedTestRestriction`, `testDirectories`, `testFiles`, `toolConfigFiles` or `typescriptFiles`. The global values are now the defaults of `directories.test`, `files.test`, `files.config` and `files.code`.
  - `@auaust/engrenage/agents` no longer exports `agentFiles` (now the default of `agents.instructionFiles`) or `markdownBlocks`.
  - `@auaust/engrenage/typescript` no longer exports `barrelFiles` or `typescriptBlocks`.
  - `@auaust/engrenage/prettier` no longer exports `prettierOptions` by name: use its default export.
  - `@auaust/engrenage` no longer exports `resolvePath`, now an internal helper, or `resolveReference`: use `resolveAgentReference` from `@auaust/engrenage/agents`.
  - The shipped data files move from `config/` to `data/` in the package. The public paths `@auaust/engrenage/tsconfig/*.json` and `@auaust/engrenage/agents/{rules,sections}/*.md` are unchanged.

- [`e569309`](https://github.com/AUAUST/lib-js-engrenage/commit/e56930922099566c5a2ef9d6e4b1a83af2f36309) Thanks [@apademide](https://github.com/apademide)! - The resolved config exposes `environment`, a lazy view of the packages the project declares. `config.environment.hasDependency(name)` is true for every package listed in the `dependencies`, `devDependencies`, `peerDependencies` or `optionalDependencies` of `package.json`, and for the package's own name. It is always false without a `package.json`. The new `packageJson.dependencies` accessor lists those package names, and an invalid dependency field fails with the field name. `Environment` is exported from `@auaust/engrenage/config`, and `PackageNames` from `@auaust/engrenage`.
  
  ESLint conventions can declare `requires`, a list of package names. Such a convention is on by default only when the environment has every one of them, on top of its presets. ESLint options still turn it on or off individually or by category.
  
  **Breaking:** library-specific conventions now require their library.
  
  - `noObjectStatics`, `noArrayIsArray`, `noIsNull`, `noIsUndefined` and `noToolkitRoot` require `@auaust/toolkit`.
  - `noPrimitiveKitRoot` requires `@auaust/primitive-kit`.
  - `noValibotNamespace` requires `valibot`.
  - `noZodClassic` and `noZodNamespace` require `zod`.
  
  A project that does not declare a library no longer gets these conventions unless its options enable them explicitly.

- [`a8cb7e0`](https://github.com/AUAUST/lib-js-engrenage/commit/a8cb7e0ee36dd3f76f3e93c8cab93df8fdcdc521) Thanks [@apademide](https://github.com/apademide)! - `engrenage.config.ts` accepts `presets`, a list of built-in preset names (for now only `"library"`), resolved as `config.presets` (default `[]`). The names live in `presets` from `@auaust/engrenage/config/constants`, and `Preset` and `Presets` are exported from `@auaust/engrenage/config`. ESLint conventions can list the presets that enable them: such a convention is on by default only when one of its presets is active, and ESLint options still turn it on or off individually or by category.
  
  A new `performance` ESLint category holds conventions enabled by the `library` preset in source directories: `noToolkitRoot` and `noPrimitiveKitRoot` report root imports of `@auaust/toolkit` and `@auaust/primitive-kit` in favor of their subpath entries, `noValibotNamespace` reports `import * as v from "valibot"`, `noZodClassic` reports imports of `zod` in favor of `zod/mini`, and `noZodNamespace` reports namespace, default and `z` imports from `zod/mini` in favor of named imports.

- [`d8c34cf`](https://github.com/AUAUST/lib-js-engrenage/commit/d8c34cfc32475bc7d04adae6f43dc6d2627749da) Thanks [@apademide](https://github.com/apademide)! - **Breaking:**
  
  - `@auaust/engrenage/typescript` no longer exports `readSubpathImports`: read `config.packageJson.imports` from `loadConfig` instead.
  - `syncBarrels` now takes `{ config, barrels, check }`, where `config` comes from `loadConfig`, instead of `{ root, barrels, check }`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - List inputs engrenage never mutates are typed read-only: the native configs of the definers, `syncBarrels` barrels, `createTsdownEntries` path aliases and the tsdown `bundle` option. `ScopeReferences` and `PathAliases` name the read-only lists of `ScopeReference` and `PathAlias`, and `resolvePathAliases` returns `PathAliases`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - **Breaking:**
  
  - `@auaust/engrenage/vite` drops `createViteAliases` and the `Alias` type: Vitest resolves sources through Vite's `resolve.tsconfigPaths`.
  - `PathAlias` drops `alias`, keeping the `name` and `path` tsdown entries need.

- [`a55620d`](https://github.com/AUAUST/lib-js-engrenage/commit/a55620dc31ef16ea94e6aee9f3af39f3353e5d4f) Thanks [@apademide](https://github.com/apademide)! - `createVitestConfig` sets `test.isolate: false`, so test files share workers instead of each starting its own, and `test.restoreMocks: true`, so spies and mocks are restored after each test instead of leaking into the next files.
  
  **Breaking:**
  
  - Tests that rely on a fresh module state per file, or on a mock surviving past the test that created it, must restore that state themselves or opt back in with `test.isolate: true` or `test.restoreMocks: false` through a native config passed to `defineVitestConfig`.

- [`eb5f20a`](https://github.com/AUAUST/lib-js-engrenage/commit/eb5f20a3cc2a53b90e924ce0e0f7127aeb184147) Thanks [@apademide](https://github.com/apademide)! - Remove the `engrenage codegen barrels` command from the published CLI: it only served this package's own sources and now runs as an internal command. `syncBarrels` stays exported from `@auaust/engrenage/typescript`.

- [`65a9c7b`](https://github.com/AUAUST/lib-js-engrenage/commit/65a9c7b2f29e4ed0354ba6c21fae43d4a62e9eb5) Thanks [@apademide](https://github.com/apademide)! - Add tool proxy commands that run each tool with the flags the engrenage setup implies. They resolve the tool from the project (an optional peer dependency) and fail with the package to install when it is missing. The tool's exit code or signal becomes engrenage's.
  
  Further arguments are passed to the tool, `--help` included. Each proxy only adds the flags you did not give: `engrenage prettier --check` checks instead of writing, `engrenage tsc -p other.json` keeps your project, and options after `--` are left alone.
  
  | Command             | Runs                                                                |
  | ------------------- | ------------------------------------------------------------------- |
  | `tsc` (`typecheck`) | `tsc --noEmit --project <files.tsconfig>`                           |
  | `tsc:dist`          | `tsc --noEmit --project <files.distTsconfig>`                       |
  | `vitest`            | `vitest run --typecheck`                                            |
  | `vitest:watch`      | `vitest watch --typecheck`                                          |
  | `vitest:coverage`   | `vitest run --coverage`                                             |
  | `vitest:dist`       | `vitest run --typecheck --mode build`, which tests the built output |
  | `tsdown`            | `tsdown`                                                            |
  | `vite`              | `vite`                                                              |
  | `eslint`            | `eslint --cache --cache-location node_modules/.cache/eslint`        |
  | `prettier`          | `prettier --write --ignore-unknown`, unless a mode is given         |
  | `prettier:check`    | `prettier --check --ignore-unknown`, dropping `--write`             |
  | `prettier:all`      | `prettier --write --ignore-unknown <root>`                          |
  
  The `PackageJson` model exposes the manifest's `bin` field.

- [`5db58e0`](https://github.com/AUAUST/lib-js-engrenage/commit/5db58e0184ab04629bdb7454c050e9bab72a2e10) Thanks [@apademide](https://github.com/apademide)! - **Breaking:** tsconfig presets move from `@auaust/engrenage/typescript/presets/*.json` to `@auaust/engrenage/tsconfig/*.json` (for example `@auaust/engrenage/tsconfig/base.json`). `@auaust/engrenage/typescript` now holds only TypeScript helpers.

- [`6fa23b4`](https://github.com/AUAUST/lib-js-engrenage/commit/6fa23b4a8c6b6e63cacd242f1eceabc03e5cb370) Thanks [@apademide](https://github.com/apademide)! - Add the `@auaust/engrenage/tsdown` entry. `defineTsdownConfig(options | (inlineConfig, context, engrenage) => options, ...configs)` loads `engrenage.config.ts` and returns a tsdown config function, so `tsdown.config.ts` can export it directly. It builds the shared AUAUST library build from the resolved config: one entry per tsconfig `paths` alias (`createTsdownEntries`), `outDir` and `tsconfig` from `files.tsconfig`, declarations and source maps, generated `exports`, publint, attw (`node16` profile, `attwOptions` in `@auaust/engrenage/tsdown/constants`), and `failOnWarn` and `minify` in CI. In CI, the build fails when it changes `package.json`, so stale exports cannot be published. Native configs are merged last with tsdown's `mergeConfig` (objects merge, arrays concatenate). Options:
  
  - `bins`: extra entries (`{ "bin/engrenage": "bin/engrenage/index.ts" }`), excluded from `exports`; a bin that shadows a package entry fails;
  - `customExports`: file exports added to the generated `exports` (`{ "./tsconfig/*.json": "./data/tsconfig/*.json" }`);
  - `bundle`: the only dependencies allowed in the bundle, none by default.
  
  `createTsdownConfig(config, { ci }, options?)` builds the same config without loading it. The `InlineConfig` and `ConfigContext` types name tsdown's config function arguments. `tsdown` is now an optional peer dependency.

- [`0bd357a`](https://github.com/AUAUST/lib-js-engrenage/commit/0bd357a5d376d8a6d6a8f3bd7a4020b8dcceed9e) Thanks [@apademide](https://github.com/apademide)! - Type `Rules` from the schemas of ESLint core and every plugin the shipped configuration registers (`@typescript-eslint`, `import-x`, `@stylistic`), so rule names autocomplete and rule options are checked. Each source is also exported on its own (`CoreRules`, `TypescriptEslintRules`, `ImportXRules`, `StylisticRules`). Projects using other plugins can type their rules by augmenting `Rules` from `@auaust/engrenage/eslint`; unknown rule names remain accepted.

- [`c2f9985`](https://github.com/AUAUST/lib-js-engrenage/commit/c2f9985a89157c883ddb61cdc211c438e892df12) Thanks [@apademide](https://github.com/apademide)! - Add `defineViteConfig` to `@auaust/engrenage/vite` and the `@auaust/engrenage/vitest` entry.
  
  - `defineViteConfig(...configs)` loads `engrenage.config.ts` and returns a Vite config function. Each native config is an object or a `(env, engrenage) => config` callback, merged in order with Vite's `mergeConfig` over the project defaults from `createViteConfig(config)`: `root`, `tsconfig` from `files.tsconfig`, and `build.outDir` from the tsconfig `outDir`.
  - `defineVitestConfig(options?, ...configs)` does the same on top of the Vite defaults, with options given as an object or a `(env, engrenage) => options` callback, so it works in `vitest.config.ts` and `vite.config.ts` alike. `--mode build` tests the build output with the dist tsconfig and no aliases. Any other mode tests sources: imports resolve through the tsconfig `paths` (Vite's `resolve.tsconfigPaths`), and a resolve guard fails when an import of the package itself resolves into `outDir`, comparing real paths so symlinked projects are guarded too (disable it with `{ guardOutDir: false }`). Both modes pass the chosen tsconfig to Vite and to `test.typecheck`, exclude `files.fixtures` from the tests and default the coverage provider to `istanbul`, which consumers install only to run coverage. `createVitestConfig(config, env, options?)` and `createOutDirGuard` build the same pieces without loading the config; `buildMode` is in `@auaust/engrenage/vitest/constants`.
  - The root config gains `files.distTsconfig`. Without it, `tsconfig.dist.json` is used when present, else the tsconfig; a configured file that does not exist fails. The resolved config exposes it as `distTsconfigPath`.
  
  `vitest` is now an optional peer dependency.

### Patch Changes

- [`d692c46`](https://github.com/AUAUST/lib-js-engrenage/commit/d692c4678afa3d1bb2cead5253a10eda5ba66571) Thanks [@apademide](https://github.com/apademide)! - - `loadConfig` retries a load that failed instead of caching the error.
  - A tsconfig that matches no file yet still exposes its compiler options.
  - Subpath imports with conditional targets resolve through their `default` condition, and targets with several `*` fail instead of being skipped.
  - Path aliases outside the package name, wildcard aliases without exactly one `*` on each side fail with a message instead of producing broken tsdown entries, and targets only match files.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - A tsconfig `outDir` outside the project root no longer breaks the resolved config: `tsconfig.outDir` stays relative to the root (`../build`) and is left out of ignored files. An `outDir` equal to the root now fails, naming the tsconfig.

## 0.0.1

### Patch Changes

- [`60a24eb`](https://github.com/AUAUST/lib-js-engrenage/commit/60a24eb43b3616cdb5bb53d2f8673d8df4064d96) Thanks [@apademide](https://github.com/apademide)! - Initial release of shared tooling configuration for AUAUST projects.

  - ESLint flat config builder with AUAUST base, import, stylistic, promise and restricted-syntax rules
  - Prettier config, usable directly as the `prettier` key or extended through a builder
  - Base tsconfig preset (`@auaust/engrenage/typescript/presets/base.json`)
  - Turns tsconfig `paths` into Vite aliases
  - Shared AGENTS.md sections and `.claude/rules` files, kept up to date in consuming projects through `@reference` blocks
  - `engrenage` CLI: `agents sync` syncs agent instruction files, `codegen barrels` generates `index.ts` barrels; both support `--check` for CI
