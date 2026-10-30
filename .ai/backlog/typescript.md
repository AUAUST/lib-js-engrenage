# typescript

TypeScript configurations and declarations engrenage manages for projects.

## 1. Role set of the managed tsconfigs.

- Issues: #62, #65, #66, #43.
- Decided: `tsconfig.src.json`, `tsconfig.tests.json` and `tsconfig.dist.json`, next to the base `tsconfig.json`.
- Open:
  1. One Node tooling role (`tsconfig.node.json`, as first proposed in #37) for `bin/`, `scripts/` and root configs, or separate `bin` and `scripts` roles? `bin/` is published (bundled by tsdown) while scripts stay private, a split the ESLint scopes already make (`published` and `private` in `src/eslint/utils/resolveScope.ts`).
  2. Which role includes root tool configs (`code.configFiles`: `*.config.ts`, `.*.ts`), and which globs cover tool configs outside the root?
  3. Can a project declare extra roles (an app with client, server and worker source), or is the set fixed?
  4. File names: short (`src`, `tests`) as decided, while config groups say `source` and `test`. Keep the mismatch, or align one side?
- Done when #62 lists the roles and #66 the include mapping.

## 2. Static presets or composed fields.

- Issues: #65, #42, #43.
- Matter: presets are static JSON files extended by projects (`node/24.json` sets `target`, `lib` and `types` together; `baseline/2026-10.json` sets `target` and `lib`). The maintainer asks whether a modular builder (libs as one config, targets taken from TypeScript or similar, fields built from the config or its defaults) would serve better than an explicit list of extensions.
- Constraints: `extends` replaces arrays (`lib`, `types`, `include`) instead of merging them, so list fields cannot be composed through `extends`. TypeScript ships no runtime presets (only `target` and `lib` names), and the baseline minimums come from `baseline-browser-mapping`.
- Options:
  - Static presets only, split so each sets one concern. Readable and usable without engrenage, but list fields still cannot combine.
  - Every field built by engrenage. Fully flexible, but the managed files lose the readable link to versioned snapshots.
  - Hybrid: `extends` for scalar concerns and immutable snapshots (base, project type, target), generated fields for list fields (`lib`, `types`, `include`) through list options.
- Recommendation: hybrid.
- Done when the composition model is chosen and #65 states which presets exist.

## 3. Semantics of `checksWith`.

- Issues: #68, #69.
- Matter: each role declares which checks include it (maintainer's sketch: `checksWith: ["base", "dist"]`). Source and tests join the default `typecheck`; dist maybe not.
- Open:
  1. Do check names refer to roles (`base`, `dist`) or to commands (`typecheck`, `typecheck:dist`)?
  2. Default per role: source, tests and tooling with the base; dist with `dist` only?
  3. Does `typecheck:dist` check a generated solution (`references`), or run one `tsc -p` per role?
  4. Must every role belong to at least one check, failing otherwise?
- Done when #68 and #69 state the rules.

## 4. Base tsconfig not named `tsconfig.json`.

- Issues: #62, #41.
- Matter: the base is the configured file, so custom setups may give it another name. Every engrenage builder reads the configured path (verified on 2026-10-30), but editors (tsserver) and typescript-eslint's project service discover only `tsconfig.json`; the project service's `defaultProject` only covers files outside every project. Under another name, editors and typed lint fall back to inferred projects without the role options.
- Options: require the solution base to be `tsconfig.json` and allow custom names for roles only; allow any name and warn; allow any name and maintain a minimal `tsconfig.json` solution pointing at it.
- Recommendation: require `tsconfig.json` for the solution base, keep role paths configurable.
- Done when #62 and #41 state the rule.

## 5. Delivery of host API declarations.

- Issue: #45.
- Matter: #45 first generated an `env.host.d.ts` included only by the source role. The maintainer asks whether engrenage could ship the declarations as an entry that a tsconfig lists in `types`, with a config option ensuring they are available.
- Findings: likely feasible. With `moduleResolution: "Bundler"` (`base.json`), type reference directives resolve through package `exports` with the `types` condition, so `types: ["@auaust/engrenage/host/timers"]` can reach a global `.d.ts` exported through tsdown `customExports` (like `./tsconfig/*.json`). Not yet verified with TypeScript 6.0.3.
- Trade-offs: a `types` entry needs no generated file, versions the declarations with engrenage, fits the source role's managed `types` list, and avoids TS2403 because no other role lists it; it cannot be adapted per project. A generated file needs no resolution subtleties and is visible in the repository, but adds a generated file and its sync.
- Recommendation: `types` entries, after a short verification with TypeScript 6.0.3.
- Done when #45 states the mechanism.

## 6. `outDir` inherited through `extends`.

- Issue: #44.
- Matter: `library.json` sets `outDir: "${configDir}/dist"`. When `build.outDir` is set, sync writes it into the source role; when it is unset, sync leaves `outDir` alone (decided). Open: write it even when the inherited value already matches (explicit and stable), or only when it differs (minimal diff)?
- Recommendation: write only when the effective value differs.
- Done when #44 states the rule.
