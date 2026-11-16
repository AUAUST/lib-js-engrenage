---
"@auaust/engrenage": patch
---

- Add the `static` environment for files served as-is, `public` by default and disabled in `published` projects
- Set Vite's `publicDir` from the `static` environment
- Add the `linted` file resource flag, ignoring unlinted resources in ESLint
