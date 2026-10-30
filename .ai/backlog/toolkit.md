# toolkit

Upstream @auaust/toolkit entry points and migration.

## 1. Lint rules and imports assume per-helper toolkit subpaths.

- Where: `src/eslint/conventions/performance/noToolkitRoot.ts`, `src/eslint/conventions/globals/`, `data/agents/rules/prefer-toolkit.md`, every `@auaust/toolkit/<helper>` import
- Problem: AUAUST/lib-js-toolkit#104 replaces per-helper subpaths with one entry per module plus the root. `auaust/no-toolkit-root` and the `Math.*`, `Object.*` and `Array.isArray` messages still point to per-helper subpaths. The latest published toolkit (0.5.1) has no module entries yet.
- Fix: once toolkit publishes the module entries, align the rules, messages and rule fragment with them (deciding whether the root becomes allowed) and migrate engrenage's imports.
- Done when engrenage's rules and source match toolkit's published entry points.

## 2. Engrenage still depends on primitive-kit.

- Problem: AUAUST/lib-js-toolkit#112 freezes `@auaust/primitive-kit` once its helpers merge into toolkit; engrenage imports its `arrays` and `numbers` helpers. Blocked until toolkit publishes the `array` and `number` modules.
- Fix: switch to toolkit's module entries, file the gaps in `primitive-kit.1` to `.3` as toolkit helpers (AUAUST/lib-js-toolkit#117), and drop the dependency and the `prefer-primitive-kit` rule.
- Done when engrenage no longer depends on primitive-kit.

## 3. Toolkit 0.5.1 declarations fail `exactOptionalPropertyTypes`.

- Where: `tsconfig.dist.json`
- Problem: `library.json` enables `exactOptionalPropertyTypes`, and the dist check (`skipLibCheck: false`) fails on `@auaust/toolkit/composer` declarations from toolkit 0.5.1 (TS2344 on `PropertyDescriptor`). Engrenage's dist check disables the flag locally.
- Fix: remove the local override once toolkit publishes declarations checked with the flag (AUAUST/lib-js-toolkit#150).
- Done when `tsconfig.dist.json` no longer overrides the flag and `pnpm build` passes.
