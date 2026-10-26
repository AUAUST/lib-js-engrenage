---
"@auaust/engrenage": minor
---

Add `defineViteConfig` to `@auaust/engrenage/vite` and the `@auaust/engrenage/vitest` entry.

- `defineViteConfig(config | (env, engrenage) => config)` loads `engrenage.config.ts` and returns a Vite config function. It wraps Vite's own config: the native config is merged last with Vite's `mergeConfig` over the project defaults from `createViteConfig(config)`: `root`, `tsconfig` from `files.tsconfig`, and `build.outDir` from the tsconfig `outDir`.
- `defineVitestConfig(config | (env, engrenage) => config, options?)` does the same on top of the Vite defaults, so it works in `vitest.config.ts` and `vite.config.ts` alike. `--mode build` tests the build output with the dist tsconfig and no aliases. Any other mode tests sources: each tsconfig `paths` alias points to its source file, and a resolve guard fails when an import of the package itself resolves into `outDir` (disable it with `{ guardOutDir: false }`). Both modes pass the chosen tsconfig to Vite and to `test.typecheck`, exclude `files.fixtures` from the tests and default the coverage provider to `istanbul`, which consumers install only to run coverage. `createVitestConfig(config, env, options?)` and `createOutDirGuard` build the same pieces without loading the config; `buildMode` is in `@auaust/engrenage/vitest/constants`.
- The root config gains `files.distTsconfig`. Without it, `tsconfig.dist.json` is used when present, else the tsconfig; a configured file that does not exist fails. The resolved config exposes it as `distTsconfigPath`.

`vitest` is now an optional peer dependency.
