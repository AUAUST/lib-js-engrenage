---
"@auaust/engrenage": minor
---

`createTsdownConfig` builds ES modules only: it sets `format: "esm"` and resolves bundled dependencies through their `module` field before `main`.

**Breaking:**

- A `package.json` without `"type": "module"` fails the build.
