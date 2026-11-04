---
"@auaust/engrenage": patch
---

- Move the sources into the `foundation`, `project`, `tools` and `workflows` namespaces; public specifiers are unchanged, the built entries are now `dist/<specifier>.mjs`
- Take the formatter as a parameter of `createFilesystem` instead of loading Prettier
