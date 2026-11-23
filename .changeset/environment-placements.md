---
"@auaust/engrenage": patch
---

- Resolve each file's environment from its file placement, else its nearest directory placement, and add it to `Entity` as `environment`
- Report two environments placed on one directory or file as the `environment-placement-conflict` structure diagnostic, keeping the first registered
- Derive each top-level namespace's globs, lint scope and tsconfig `include` from environment placements
