---
"@auaust/engrenage": minor
---

- Add the `format` section (`indent`, `indentWidth`, `lineWidth`, `quotes`, `semicolons`, `trailingCommas`, `endOfLine`), defaulting to the former fixed conventions and read by `config.format`.
- Add `definePrettierConfig` to `@auaust/engrenage/prettier`, which maps `format` to Prettier options and takes the project's plugins and overrides, for projects with custom rules in a `prettier.config.ts` (`export default definePrettierConfig({ plugins })`). `createPrettierConfig` now takes a config context and options.
- `createTsdownConfig`, `createViteConfig`, `createVitestConfig` and `createDefine` take a config context (`createContext(config)` from `@auaust/engrenage/config`) and read their sections through `get`.
- A project without the `published` trait has no managed `tsconfig.tests.dist.json`.
- `@auaust/engrenage/prettier` keeps its default export, the defaults-only config, so `"prettier": "@auaust/engrenage/prettier"` in `package.json` stays the default; `engrenage init` writes `prettier.config.ts` only when the project needs custom rules.
