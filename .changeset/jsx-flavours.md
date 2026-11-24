---
"@auaust/engrenage": minor
---

- Remove the `tsx` language: `.tsx` files belong to an environment only when it selects `typescript({ tsx: "solid" })` or `typescript({ tsx: "preact" })`, which also sets the tsconfig `jsx` and `jsxImportSource`
- Add the `typescript()` language selection and its `TypescriptOptions` type to `@auaust/engrenage/typescript`
- Drop `.tsx` from the `src` and `tests` environments by default
- Select Preact TSX in the `shopify-app` preset's extensions environment through its language instead of tsconfig keys
- Default `tests.extension` to the extensions of the tests environment's languages instead of `.{ts,tsx}`
