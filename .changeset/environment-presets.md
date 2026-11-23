---
"@auaust/engrenage": patch
---

- Add the `environments` config record, registering environments by name, each naming a preset, tuning its languages and placing it on directories and root files
- Add the `environmentPresets` extension slot and the `createEnvironmentPreset` helper and `EnvironmentPreset` type to the extension surface
- Drop the `environmentKinds` extension slot and the `kind` field of `environments` slot entries
