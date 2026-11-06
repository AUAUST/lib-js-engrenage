---
"@auaust/engrenage": patch
---

- Lint import boundaries several times faster: the boundaries rules reuse their options across files, and surfaces messages name the generic remedy instead of the target domain's index specifier
- Leave `import-x/namespace` to the TypeScript checker on TypeScript files
