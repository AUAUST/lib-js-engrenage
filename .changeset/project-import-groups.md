---
"@auaust/engrenage": minor
---

- Add the `imports.noExternalNamespace` convention, reserving namespace imports and `export * as` re-exports for project modules
- Sort project namespace imports, then project default imports, into their own groups after the named project imports
- Group wildcard re-exports after the named ones
- Let comments partition import sorting, as they already do for exports
- Report `import-x/no-named-as-default` as an error
- Remove `performance.noValibotNamespace`, which `imports.noExternalNamespace` covers, and drop namespace imports from `performance.noZodNamespace`
- Resolve imports against the project's own tsconfig instead of the one in the working directory
