---
"@auaust/engrenage": minor
---

- Replace `presets: ["library"]` by `preset: "library"` (at most one) and add `traits: { enable, disable }`. The `library` preset bundles the `published` trait, which now drives the published `package.json` fields, the library tsconfig, the dist mode of tests and the tests dist tsconfig, the library GitHub workflows and the library lint conventions. A project without it gets no tests dist tsconfig unless it configures one.
- Replace `presets` on the resolved config by `preset`, `traits` and `traitAdjustments`, `getPresets`/`setPresets` of step contexts by `getPreset`, `getTraits` and `setPreset`, and the `presets` option of lint conventions by `traits`.
- `engrenage init` writes `preset` and no longer writes it for the `other` project type.
