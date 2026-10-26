---
"@auaust/engrenage": minor
---

Add the `@auaust/engrenage/tsdown` entry. `defineTsdownConfig(options | (inlineConfig, context, engrenage) => options, ...configs)` loads `engrenage.config.ts` and returns a tsdown config function, so `tsdown.config.ts` can export it directly. It builds the shared AUAUST library build from the resolved config: one entry per tsconfig `paths` alias (`createTsdownEntries`), `outDir` and `tsconfig` from `files.tsconfig`, declarations and source maps, generated `exports`, publint, attw (`node16` profile, `attwOptions` in `@auaust/engrenage/tsdown/constants`), and `failOnWarn` and `minify` in CI. In CI, the build fails when it changes `package.json`, so stale exports cannot be published. Native configs are merged last with tsdown's `mergeConfig` (objects merge, arrays concatenate). Options:

- `bins`: extra entries (`{ "bin/engrenage": "bin/engrenage/index.ts" }`), excluded from `exports`; a bin that shadows a package entry fails;
- `customExports`: file exports added to the generated `exports` (`{ "./tsconfig/*.json": "./data/tsconfig/*.json" }`);
- `bundle`: the only dependencies allowed in the bundle, none by default.

`createTsdownConfig(config, { ci }, options?)` builds the same config without loading it. The `InlineConfig` and `ConfigContext` types name tsdown's config function arguments. `tsdown` is now an optional peer dependency.
