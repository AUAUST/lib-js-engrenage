---
"@auaust/engrenage": minor
---

`define()` and `define.values` accept any JSON-serializable value (including objects with `toJSON`, such as `Date` and `URL`) and fail clearly on values that cannot be serialized. The `GlobalValue` and `Globals` types are removed. The `packageJson` passed to `define.values` exposes standard fields such as `version`, `description`, `license`, `author`, `engines` and `files`, each validated when read.
