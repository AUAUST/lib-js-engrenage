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
