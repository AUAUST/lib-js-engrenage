---
"@auaust/engrenage": minor
---

- Derive `.gitignore`, `.prettierignore`, ESLint's ignores and `files.generated` from file resources, so a custom `cache.dir` and an extension's uncommitted files are ignored
- Remove `createProjectIgnores` from `@auaust/engrenage/git`, and `lockfileIgnores`, `eslintIgnores` and `changelogIgnores` from `@auaust/engrenage/prettier/constants`
- Fail `defineEslintConfig` on an unreadable tsconfig instead of leaving the build output unignored
