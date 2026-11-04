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

- why: projects where engrenage is the JavaScript part of a host (a Shopify theme, a Shopify extensions app, Laravel) need presets resolving to the traits of #153 (owned directories, published), so environment defaults never land in host directories. Related: `configuration.1`. A `shopify-extensions` preset would hold: the `extensions/*` workspace globs and their environments (Preact JSX, Polaris types, no Node built-ins, bundled `src`), the discovered `pages/` role, the host's files (`shopify.*.toml`, locales, GraphQL codegen output) as foreign or generated, one build entry per extension, not published.
- done: each adopting project has its preset, added when that project adopts engrenage; obsolete if the project never does.

## 4. `listDiscoveredGlobs` widens `files.discovered` with role-discovered globs, without a changeset.

- why: #141 added it, so `files.discovered` now includes role globs (for this repository `tests/**/setup.ts`). No changeset was added; consumers may see new discovered files.
- want: check whether consumers are affected and add a changeset if so.
