# configuration

Project configuration contract: loading, environments, option shapes and list options.

## 1. Liquid and CSS are not languages engrenage knows.

- why: #350 formats Liquid but keeps theme directories outside every environment. Model: environments are runtime contexts and never nest; languages are file kinds inside them.
- want: a `liquid` environment mapping theme directories (#378, #390), and a CSS language domain (Stylelint or `@eslint/css`).
- done: both exist, or obsolete once themes need neither.

## 2. CI and test timeouts are not configurable, nor per environment.

- why: recent commit `fix: tests timeout in CI` changed a timeout; the value is fixed rather than a configuration option.
- want: the CI/test timeout is a configuration option, overridable per environment (see the environment model in `configuration.1`), with the current value as default.
- done: the timeout is set through the project configuration, per environment, and no generated config hardcodes it.

## 3. Host presets are missing for non-Shopify hosts.

- why: a host project (Laravel) needs a preset keeping environment defaults out of host directories (#153 traits); Shopify's are #350.
- done: each adopting project has its preset, or the entry is obsolete.

## 4. `listDiscoveredGlobs` widens `files.discovered` with role-discovered globs, without a changeset.

- why: #141 added it, so `files.discovered` now includes role globs (for this repository `tests/**/setup.ts`). No changeset was added; consumers may see new discovered files.
- want: check whether consumers are affected and add a changeset if so.

## 5. Generic accessor factory sits in the options domain

- site: `src/foundation/options/utils/createAccessors.ts:7`
- why: used by `createTsconfig` and the package.json model.
- want: its own `foundation` home.

## 6. Config loads do avoidable work and keep past results

- sites: `src/project/tsconfig/operations/createTsconfig.ts:1`, `src/tools/git/config/sections/gitSection.ts:15`, `src/project/config/operations/loadConfig.ts:78`
- why: the static `typescript` import costs ~0.2 s on every load; the git section globs the whole tree where `git ls-files` lists the tracked set; `refresh` rides on `loadConfig` because an operations module exports one name.
- want: lazy compiler import; git section asks Git; a role for module-level state (planning).

## 7. Option sections and tsconfig paths are cast or unchecked

- sites: `src/foundation/options/config/declarers/declareSection.ts:7`, `src/foundation/options/types/Section.ts:4`, `src/foundation/options/utils/createResolver.ts:215`, `src/foundation/options/utils/createAccessors.ts:40`, `src/project/tsconfig/utils/readTsconfigPaths.ts:19`
- why: `Config` comes from the annotation, unchecked against the resolver; the resolver context is `unknown`, narrowed bivariantly; sections get the open resolver, so key reads are untyped; compose cannot type getters from a dynamic map; hand-written paths are cast.
- want: section context typed through `Resolver<Context, Sections>`; paths validated against a schema.

## 8. Options infer meaning from shape or wording, and defaults live elsewhere

- sites: `src/foundation/options/utils/applyInputDefaults.ts:26`, `:57`, `src/foundation/options/utils/validate.ts:37`, `src/foundation/options/config/declarers/declareManagedList.ts:21`, `src/tools/git/config/schemas/gitSchema.ts:25`
- why: a list adjustment is recognised by shape; creating a parent object skips an object option's computed default; valibot's default message detected by wording; some defaults are computed elsewhere and only documented.
- want: the declared option decides; no wording matches; defaults computed at the declaration.

## 9. Contributed environments are trusted past their checks

- sites: `src/project/config/config/schemas/extensionSchema.ts:79`, `src/project/environments/operations/resolveEnvironmentTsconfig.ts:22`, `src/project/structure/operations/readStructureOption.ts:11`, `src/tools/typescript/operations/resolveTsconfigEnvironment.ts:11`
- why: entries are typed as their slot's though only `load`, `enabled`, structure fields or tsconfig shape are checked.
- want: boundary validation for every field a contributed environment resolves.

## 10. Config codegen asserts what it could type

- sites: `scripts/codegen/operations/generateConfigTypes.ts:146`, `:309`, `scripts/codegen/operations/composeInputSchemas.ts:9`
- why: every custom schema but one reads as `GlobalsFactory`; the draft 07 schema is asserted to the draft 04 type; `Section` erases its declaration type, so readers assert presence.
- want: each custom schema mapped to its type; `ConfigInput` type-checked against the sections (planning).

## 11. Workflow builtins own no config key

- site: `src/workflows/builtins/index.ts:1`
- why: `eslint`, `vite`, `vitest`, `tsdown` options come only from definer arguments.
- want: a decision on which builtins own a key (planning).

## 12. Sections and schemas state intent indirectly

- sites: `src/tools/git/config/sections/gitSection.ts:50` (composing adds nothing over the plain object), `src/project/build/config/schemas/buildSchema.ts:50` (`resolveWithin` called only for its throw, also in `cache()`).
- want: the object written directly; an explicit containment assertion.

## 13. Tool definers load the engrenage config of `process.cwd()`, not of the project owning their config file

- why: ESLint and Prettier pick the config file nearest each linted file, so with the editor at the repository root, a file in `.claude/worktrees/<name>/` runs that checkout's `defineEslintConfig` against the root's `engrenage.config.ts` and fails validation when the schemas differ. Same in nested packages. Sites: `define{Eslint,Prettier,Vite,Tsdown}Config`; the git.1 gap also lets project-wide lint reach worktrees.
- want: each definer resolves its project from its config file's directory, e.g. `import.meta.dirname` passed by the generated config module (definer contract and `createConfigModule` change, needs a decision).
