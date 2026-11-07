---
"@auaust/engrenage": minor
---

- Add the `publishing` sync target, which fails `engrenage sync` and `sync --check` on a configuration that could publish a private package publicly: `"private": true` on a published root, a `publishConfig.access` or changesets `access` off the visibility, an unscoped or provenance-enabled private package, or credentials in a project `.npmrc`
- Upgrade: a published project with neither `visibility` nor `publishConfig.access` now resolves `private`; set `visibility: "public"` to keep publishing publicly, and rename unscoped private packages under a scope
