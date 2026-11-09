---
"@auaust/engrenage": minor
---

- Replace `auaust/no-dynamic-import` with `auaust/no-pointless-dynamic-import`: `import()` may target a `lazy` role or an optional peer, computes its specifier only in a discovered role, and appears once per function
- Add the `lazy` role contract option, set on the `actions` preset
- Check `import()` in `auaust/import-effects`
