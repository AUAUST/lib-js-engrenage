---
"@auaust/engrenage": minor
---

Add `defineEslintConfig(options | (engrenage) => options, ...configs)` to `@auaust/engrenage/eslint`. It loads `engrenage.config.ts`, builds the AUAUST configuration from the global values (`directories.source`, `directories.test`, `files.code`, `files.test`, `files.fixtures`, `files.config`, `files.discovered`, `files.generated`, `files.gitignore`), appends the native ESLint configs, and resolves to the flat config array, so `eslint.config.ts` can export it directly. Options toggle categories by purpose:

- `ignore`: the gitignore file, `files.generated`, `coverage/**`, the tsconfig `outDir` and `files.fixtures` under each test directory (`tests/**/fixtures/**` by default);
- `recommended`: the ESLint and typescript-eslint presets with the AUAUST adjustments;
- `globals`, `comparisons`, `stylistic`, `imports`, `promises`, `structure`: `false` turns the whole category off, and an object turns off single conventions (`{ comparisons: { noRuntimeTypeof: false } }`). Unknown keys are rejected.

Each restriction is now its own rule under the `auaust/` namespace (`auaust/no-runtime-typeof`, `auaust/no-array-is-array`, `auaust/no-object-statics`, `auaust/no-is-null`, `auaust/no-is-undefined`, `auaust/no-loose-undefined`, `auaust/no-complex-concise-arrows`, `auaust/no-dynamic-import`, `auaust/no-misplaced-tests`), typed in `Rules`. Scoping one off is a native config (`{ files: ["src/utils/is*.ts"], rules: { "auaust/no-runtime-typeof": "off" } }`), and the project's own `no-restricted-syntax` and `no-restricted-properties` no longer replace engrenage's restrictions. `Array.isArray` is now also reported when destructured or accessed with brackets.

`ConfigInput` accepts callback arguments. Validation errors from a union now name the failing nested key.

**Breaking:**

- `createEslintConfig` now takes `(config: ResolvedConfig, options?: Options)` instead of `Conventions`; the `Conventions` type is removed.
- `createBaseRules`, `createImportRules`, `createStylisticRules`, `createRestrictedSyntaxRules` and `createPromiseRules` are removed: use `defineEslintConfig` options.
- `filesIn(directory, codeFiles)` takes the code files glob.
- Restriction reports and `eslint-disable` comments use the `auaust/…` rule IDs instead of `no-restricted-syntax` and `no-restricted-properties`.
- `syncBlocks(content, syntax, fillers)` takes a record of fillers keyed by directive instead of one fill function.
- `restrictImports`, `restrictProperties`, `restrictSyntax` and the `ImportPattern`, `RestrictedProperty` and `SyntaxRestriction` types are removed: each restriction is its own `auaust/*` rule, and `Rules` types the options of `no-restricted-imports`, `no-restricted-properties` and `no-restricted-syntax`.
