---
"@auaust/engrenage": minor
---

`directories.coverage` (default `coverage`) sets the coverage directory: Vitest writes its reports there, ESLint ignores it, and the `project` ignore preset lists it in `.gitignore` and `.prettierignore`. File names shared across tools, package names and the `package.json` types (`PackageType`) live in the root constants.

**Breaking:**

- `@auaust/engrenage/config/constants` drops `coverageDirectory` (now `defaultCoverageDirectory`), `configFileName`, `packageFile` and the `default…File` names of `tsconfig.json`, `tsconfig.dist.json`, `.gitignore` and `.prettierignore`, which move to the root constants as `engrenageConfigFile`, `packageFile`, `tsconfigFile`, `distTsconfigFile`, `gitignoreFile` and `prettierignoreFile`.
- The root constant `changesets` is renamed `changesetsCli`.
- `@auaust/engrenage/git/constants` drops `coverageIgnores`, and the `defaults` ignore preset no longer lists the coverage directory.
