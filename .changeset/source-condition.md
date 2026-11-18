---
"@auaust/engrenage": patch
---

- Add a `build.sourceExports` option adding a `source` export condition that resolves each built entry to its source file, dropped from the published manifest
- Run the `engrenage` command from its sources when Node runs with `--conditions=source`
