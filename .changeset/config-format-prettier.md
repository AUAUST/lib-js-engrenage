---
"@auaust/engrenage": minor
---

- Add the `format` section (`indent`, `indentWidth`, `lineWidth`, `quotes`, `semicolons`, `trailingCommas`, `endOfLine`), defaulting to the former fixed conventions and read by `config.format`.
- Add `definePrettierConfig` to `@auaust/engrenage/prettier`, which maps `format` to Prettier options and takes the project's plugins and overrides. Put it in `prettier.config.ts` (`export default definePrettierConfig({ plugins })`) and remove `"prettier": "@auaust/engrenage/prettier"` from `package.json`; the default export of `@auaust/engrenage/prettier` and `defaultOptions` of its constants are removed, and `createPrettierConfig` now takes a config context and options. `engrenage init` creates `prettier.config.ts`.
- `createTsdownConfig`, `createViteConfig`, `createVitestConfig` and `createDefine` take a config context (`createContext(config)` from `@auaust/engrenage/config`) and read their sections through `get`.
- A project without the `published` trait has no managed `tsconfig.tests.dist.json`.
