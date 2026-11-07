---
"@auaust/engrenage": minor
---

- **Breaking**: Remove `eslint.boundaries` and the `eslint-plugin-boundaries` dependency; `auaust/import-environments`, `auaust/import-tests`, `auaust/import-data`, `auaust/import-workspaces`, `auaust/import-layers` and `auaust/import-surfaces` decide from the structure. Upgrade: drop `eslint.boundaries`, and switch a structure rule off through the ESLint `structure` option (`structure: { importLayers: false }`).
- **Breaking**: Add `auaust/import-specifiers`, reporting relative specifiers an alias covers, self-imports and paths missing from the structure map, in place of `import-x/no-self-import` and `import-x/no-useless-path-segments`. Upgrade: import through the `#…` aliases.
- **Breaking**: Forbid tests importing an environment's root file, and check each test variant's imports: `x.test.ts` and `x.test.dist.ts` import public specifiers, `x.test.src.ts` internals. Upgrade: import the public entry, or rename the test `.src`.
- **Breaking**: Replace `no-default-export`, `no-internal-imports-in-public-tests` and `no-package-imports-in-source-tests` with the structure rules, and `typesDeclarations` with `typeOnlyRoles`. Upgrade: rename those rules in your overrides.
- **Breaking**: Make a `Convention` declare the `sections` it reads, its `rule` and `delegates` receiving them with the config context, and rename its `presets` option `traits`. Upgrade: declare `sections` and read them instead of the flat config.
- **Breaking**: Make `Delegate` describe the upstream rule and its options instead of holding the resolved rule. Upgrade: pass the rule's name and options.
- **Breaking**: Remove `StructureLocation` from `@auaust/engrenage/eslint`. Upgrade: use `Entity`.
- Add `defineRoleRule`, role rule modules (`roles/<role>/<key>`) receiving the file's `Entity` and its environment's file names
- Add the `importEffects` convention, following each runtime binding through re-exports to check it against the effect levels
- Report runtime imports from global type-only roles in `auaust/import-surfaces` and `auaust/import-layers`, whose messages name the broken relation and its fix
- Lint import boundaries several times faster, leaving `import-x/namespace` to the TypeScript checker on TypeScript files
