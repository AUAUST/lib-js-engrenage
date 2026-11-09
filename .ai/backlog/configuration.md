# configuration

Project configuration contract: environments, option shapes and list options.

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

## 5. Option declarers and helpers sit in the wrong modules

- sites: `src/foundation/options/config/declareLocation.ts:9` (declarers split by imports, not concern), `src/foundation/options/index.ts:52` (`globsSchema.ts` also default-exports `globSchema`, which no barrel exposes), `src/foundation/options/utils/createAccessors.ts:7` (generic factory used by the tsconfig and package.json models), `src/project/structure/config/schemas/structureOptions.ts:12` (spreadable record of declarations in `schemas`). Related: role contracts in #227.
- want: each declarer and schema in the module its concern names; `globSchema` in its own module.
