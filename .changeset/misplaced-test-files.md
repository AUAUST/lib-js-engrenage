---
"@auaust/engrenage": minor
---

Report `*.test.*` and `*.spec.*` TypeScript files outside the test directories in `createEslintConfig` and `createRestrictedSyntaxRules`, which now accepts `testDirectories` (default `["tests"]`). Export the `testFiles`, `testDirectories` and `misplacedTestRestriction` configuration values from `@auaust/engrenage/eslint`.
