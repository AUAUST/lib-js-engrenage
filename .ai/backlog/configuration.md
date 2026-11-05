# configuration

Project configuration contract: environments, option shapes and list options.

## 1. Environments for a Shopify theme and non-TypeScript languages are undefined.

- why: the next engrenage project is a Shopify theme (#61 environment model, plan #37): Liquid directories at the root (`sections/`, `snippets/`, `layout/`, `templates/`, `blocks/`), TypeScript and CSS in `src/` (CSS under `src/styles/`), output into `assets/` rather than a published `dist/`; engrenage only knows TypeScript today. Settled in the plan so the model already fits: an environment is a runtime context (where code runs), not a file type, so environments never nest. A language is a file kind inside environments: each language owns its file globs (TypeScript: `typescript.files`), and an environment's files for a language are its `dirs` × that language's globs. CSS under `src/styles/` is `src` code in the CSS language, so no `styles` environment is needed.
- want, when the theme project starts:
  1. A `theme` preset: Liquid and theme directories as a new known environment (Liquid runs on Shopify, not in the browser), `assets/` as the build output, no `exports` or package publishing.
  2. A CSS language domain (`css.files`, Stylelint or ESLint CSS through `@eslint/css`), owning its rules the way the ESLint entry owns TypeScript rules.
  3. Liquid tooling (Theme Check, Prettier's Liquid plugin) and how its directories reach the ignore files and formatters.
- done: the theme project's requirements are written as issues, or obsolete if engrenage is not used for it.

## 2. CI and test timeouts are not configurable, nor per environment.

- why: recent commit `fix: tests timeout in CI` changed a timeout; the value is fixed rather than a configuration option.
- want: the CI/test timeout is a configuration option, overridable per environment (see the environment model in `configuration.1`), with the current value as default.
- done: the timeout is set through the project configuration, per environment, and no generated config hardcodes it.

## 3. Host presets are missing for the projects adopting engrenage.

- why: projects where engrenage is the JavaScript part of a host (a Shopify theme, a Shopify extensions app, Laravel) need presets resolving to the traits of #153 (`published`; owned directories in `configuration.5`), so environment defaults never land in host directories. Related: `configuration.1`. A `shopify-extensions` preset would hold: the `extensions/*` workspace globs and their environments (Preact JSX, Polaris types, no Node built-ins, bundled `src`), the discovered `pages/` role, the host's files (`shopify.*.toml`, locales, GraphQL codegen output) as foreign or generated, one build entry per extension, not published.
- done: each adopting project has its preset, added when that project adopts engrenage; obsolete if the project never does.

## 4. `listDiscoveredGlobs` widens `files.discovered` with role-discovered globs, without a changeset.

- why: #141 added it, so `files.discovered` now includes role globs (for this repository `tests/**/setup.ts`). No changeset was added; consumers may see new discovered files.
- want: check whether consumers are affected and add a changeset if so.

## 5. Owned directories have no trait yet; deferred with host presets (#153)

- why: #153 step 3 lists "owned directories" as a first trait and a test of a host preset owning `tests/`; the issue does not say what the trait carries or how a preset declares it, and no host preset exists. Decided: deferred; #153 adds only `published`.
- want: a data-carrying trait or option (`ownedDirectories`) that environment `dirs` defaults skip, designed with the first host preset.
- done: a host preset declaring a directory as owned keeps the environment default out of it.

## 6. Option names reuse one word for different vocabularies

- why: `layout` is `roots | mirror` in `tests` and `commands | domains` in `bin` and `scripts`; `commands` is both a `layout` value and the `bin.commands` entry map; `./config` and `./config/constants` resolve to different domains; prettier, git and agents take sections in `engrenage.config.ts` while eslint, vite, vitest and tsdown take options only as definer arguments.
- want: distinct names (`tests.mirror`, `bin.tree`, `bin.entries`) and one rule for where tool options live.
- done: each option name has one meaning and every tool is configured the same way.

## 7. The "No package.json found" guard is repeated in five modules

- sites: `src/workflows/cli/operations/createStepContext.ts:65`, `src/tools/tsdown/operations/createTsdownConfig.ts:150`, `src/tools/changesets/setup/syncChangesetConfig.ts:52`, `src/tools/pnpm/setup/createPnpmStep.ts:29`, `bin/engrenage/pnpm/upgrade.ts:45`, `describeMissing` of `createPackageJson`.
- why: each checks the resolved config has a package.json and throws the same error.
- want: the resolved config exposes a required package.json path.

## 8. Config declarations state defaults they do not own or did not verify

- sites: `src/foundation/options/config/declareManagedList.ts:21`, `src/project/config/operations/createProjectSections.ts:335`, `src/project/environments/config/schemas/binSchema.ts:31`, `testsSchema.ts:76`, `src/project/tsconfig/config/declareEnvironmentTsconfig.ts:93`, `src/tools/github/config/schemas/githubSchema.ts:13`.
- why: defaults are computed elsewhere, so declarations only document them; three claims were never run. The explicitness check reads raw input (see `structure.12`).
- want: run the unverified behaviour and correct the text; the `tests.dist` default depends on its published trait in its declaration.

## 9. `build.outDir` resolution depends on parsing the tsconfig

- sites: `src/project/config/operations/createProjectSections.ts:670` (unreadable tsconfig hides the output directory, so its alias is generated instead of skipped), `:740` (resolved on access, unlike other sections), `src/project/tsconfig/operations/produceTsconfigOutDir.ts:45` (revalidates raw `build`; `structure.8`).
- want: the output directory resolves without parsing the tsconfig; the resolved build section exposes it.

## 10. Option declarers and helpers sit in the wrong modules

- sites: `src/foundation/options/config/declareLocation.ts:9` (declarers split by imports, not concern), `src/foundation/options/index.ts:52` (`globsSchema.ts` also default-exports `globSchema`, which no barrel exposes), `src/foundation/options/utils/createAccessors.ts:7` (generic factory used by the tsconfig and package.json models), `src/project/structure/config/schemas/structureOptions.ts:12` (spreadable record of declarations in `schemas`). Related: `structure.17`, `structure.18`.
- want: each declarer and schema in the module its concern names; `globSchema` in its own module.

## 11. Project config caches go stale or load the file twice

- sites: `src/project/config/operations/createProjectSections.ts:247` (memo key holds only the base tsconfig content, so staged changes to an extended local tsconfig are missed within a pass), `src/project/config/operations/readConfig.ts:7` (duplicates `workflows/registry` `readConfig` and `loadConfig`, second cache, no validation).
- why: definers read an unvalidated partial config; a process may load the file twice. Adjacent: #57, `structure.20`.
- want: one validating loader and one cache owner; the memo key covers extended local tsconfigs.

## 12. `define` stays in `project/config`, so its tests run from source only

- site: `src/project/config/utils/define.ts:7`
- why: `define` needs internals `project/config` does not export; its public-specifier tests became source-only (`structure.22`).
- want: a placement that lets the tests reach the public entry.
