---
"@auaust/engrenage": minor
---

- A file role's `subpath: true` exposes each of its files at a public domain's root as `<domain subpath>/<file name>`, without a `src.exports` line; it needs a public role with static `file` names or globs
- The `constants` preset sets `subpath: true`, newly exposing `./baseline/constants`, `./format/constants`, `./package/constants` and `./roles/constants`
- A domain's import surface lists its public file roles' modules
