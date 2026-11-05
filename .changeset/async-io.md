---
"@auaust/engrenage": minor
---

- Make `Filesystem`, `resolvePathAliases` and `formatFile` asynchronous, along with every file read, write, glob and process the config loading, `init`, `sync` and the CLI commands run
- Make the `gitignore`, `prettierignore` and per-environment `tsconfig.path` config fields promise-valued
