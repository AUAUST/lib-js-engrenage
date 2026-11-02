---
"@auaust/engrenage": patch
---

- Fix `engrenage sync` rewriting JSON objects that already hold the synced value, which reformatted them and made `sync --check` fail on formatted files such as `tsconfig.json` paths
