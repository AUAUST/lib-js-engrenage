---
"@auaust/engrenage": minor
---

- Rank modules by what evaluating them does apart from what their exports do once invoked, in `auaust/import-effects`
- Charge invoking an imported binding to the position it runs in, including through local functions called at evaluation, and charge nothing for reading one or passing it along
- Charge each import, re-export and `import()` its module's evaluation, a barrel's own role ceiling included
- Accept an `evaluation` level and optional `symbols` in `structure.effects.modules` entries
- Set the `index` and `entry` role presets' evaluation ceiling to `confined`
- Set the `actions`, `adapters`, `operations`, `testutils` and `extension` role presets to a `confined` evaluation ceiling and an `effectful` invocation ceiling
