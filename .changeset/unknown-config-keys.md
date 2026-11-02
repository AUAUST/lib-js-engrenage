---
"@auaust/engrenage": patch
---

- Report unknown config keys as `Unknown key "<key>"` instead of valibot's `Invalid key: Expected never`, so options removed or renamed since an earlier version (such as the `code` group, moved to the environments in 0.5.0) read as such
