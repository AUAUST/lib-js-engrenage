---
"@auaust/engrenage": minor
---

- Expose every convention rule as `auaust/<rule>`, named after the upstream rule it delegates to, with our options as defaults that projects override key by key; the upstream rule is turned off where the convention applies
- Rename the convention rules accordingly (`curly` becomes `auaust/curly`, `import-x/no-duplicates` becomes `auaust/no-duplicates`, `@stylistic/padded-blocks` becomes `auaust/unpadded-switches`, …) and replace the `rules` field of conventions with `delegates` and `severity`
- Replace the `bracedCases` convention with `switches` (`unicorn/switch-case-braces`, `no-fallthrough` reporting unused fallthrough comments) and `noReturnUndefined` with `noUselessUndefined` (`unicorn/no-useless-undefined`)
- Add the `assignments`, `conditionals`, `exhaustiveSwitches`, `functionDeclarations`, `nameReplacements`, `naming`, `objects`, `typeChecks`, `typeStyle`, `voidPlacement` and `voidReturns` stylistic conventions, `comparisons.noTypeofUndefined`, `imports.noCommonjs` and `promises.returnAwait`
- Report `naming-convention` as a warning, shown as info in VS Code
- Replace the `recommendedRules` constant with one constant per plugin: `coreRules`, `typescriptRules`, `typescriptTypeAwareRules`, `importRules`, `stylisticRules` and `unicornRules`
- Add `eslint-plugin-unicorn` and enable `unicorn/prefer-node-protocol`
- Enable more correctness rules from ESLint, typescript-eslint (type-aware ones on published and private code) and import-x
- Enable the recommended `eslint-plugin-package-json` validators
- Add the `typeAware` ESLint option to turn off every rule that needs type information
