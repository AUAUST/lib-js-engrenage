# configuration

Project configuration contract: environments, option shapes and list options.

## 1. Environments for a Shopify theme and non-TypeScript languages.

- Issues: #61 (environment model), plan #37.
- Matter: the next engrenage project is a Shopify theme: Liquid directories at the root (`sections/`, `snippets/`, `layout/`, `templates/`, `blocks/`), TypeScript and CSS in `src/` (CSS under `src/styles/`), output into `assets/` rather than a published `dist/`. Engrenage only knows TypeScript today.
- Settled in the plan so the model already fits: an environment is a runtime context (where code runs), not a file type, so environments never nest. A language is a file kind inside environments: each language owns its file globs (TypeScript: `typescript.files`), and an environment's files for a language are its `dirs` × that language's globs. CSS under `src/styles/` is `src` code in the CSS language, so no `styles` environment is needed.
- Open, when the theme project starts:
  1. A `theme` preset: Liquid and theme directories as a new known environment (Liquid runs on Shopify, not in the browser), `assets/` as the build output, no `exports` or package publishing.
  2. A CSS language domain (`css.files`, Stylelint or ESLint CSS through `@eslint/css`), owning its rules the way the ESLint entry owns TypeScript rules.
  3. Liquid tooling (Theme Check, Prettier's Liquid plugin) and how its directories reach the ignore files and formatters.
- Done when the theme project's requirements are written as issues, or obsolete if engrenage is not used for it.

## 2. Config types show the source valibot schema and no field documentation.

- Matter: config types are the inferred schema types, so going to a type definition opens the schema itself and shows no documentation comment per field.
- Expected: a config interface with a documentation comment on each field, generated from the valibot schemas. Prefer an existing valibot schema-to-interface tool, or documentation carried in the schema itself (or extracted from JSDoc next to each field), over writing our own generator.
- Done when hovering a config option in a consumer's editor shows its documentation.

## 3. Presets are applied by scattered checks instead of a declarative config state.

- Matter: many places check the presets by hand to guess dynamic defaults. It is hard to see what a preset changes.
- Expected: a config factory (or config state) that takes the presets and centralizes their effects, so that reading it shows what including a preset does to which option. The init script follows the same model: a config state starts from the base defaults, preset selection applies preset defaults, explicit user input edits it, and the handler consumes the final declarative result once. Related to `file-editing.1`.
- Done when no module outside the factory inspects presets to derive a default, and init builds its answers on the same state.

## 4. CI and test timeouts are not configurable, nor per environment.

- Context: recent commit `fix: tests timeout in CI` changed a timeout; the value is fixed rather than a configuration option.
- Expected: the CI/test timeout is a configuration option, overridable per environment (see the environment model in `configuration.1`), with the current value as default.
- Done when the timeout is set through the project configuration, per environment, and no generated config hardcodes it.
