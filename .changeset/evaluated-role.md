---
"@auaust/engrenage": minor
---

- Add the `evaluated` role preset for `*.config.ts` modules whose evaluation is their behavior, at the `effectful` level, in `src` and `tooling`
- Classify the tooling environment's root files, so root `*.config.ts` files take the `evaluated` role and lint checks them
- Add the `exports` field to `.domain.json` and config domains, mapping subpaths under a public domain's specifier to its files, and report `private-domain-exports` on a non-public domain declaring it
