---
"@auaust/engrenage": minor
---

The ESLint config now lints every `package.json` with eslint-plugin-package-json: top-level keys follow the sort-package-json order (`package-json/order-properties`), and `config`, `dependencies`, `devDependencies`, `optionalDependencies`, `overrides`, `peerDependencies`, `peerDependenciesMeta` and `scripts` are sorted (`package-json/sort-collections`). `exports` keeps its order, since tsdown generates it. Both rules are autofixable and typed in `Rules`. The `packageJson: false` option turns them off.
