---
"@auaust/engrenage": minor
---

- Move the global maps extensions augment into the type-only `Engrenage` namespace: `EngrenageConfigInput`, `EngrenageSections`, `EngrenageSlots`, `EngrenageFormatters`, `EngrenagePresets`, `EngrenageEnvironments`, `EngrenageBuildTools` and `EngrenageAgentRuntimes` become `Engrenage.ConfigInput`, `Engrenage.Sections`, `Engrenage.Slots`, `Engrenage.Formatters`, `Engrenage.Presets`, `Engrenage.Environments`, `Engrenage.BuildTools` and `Engrenage.AgentRuntimes`
- Rename the exported `EngrenageSlots` type to `ConfigSlots`
- Allow declaration-only namespaces in the shared ESLint preset's `@typescript-eslint/no-namespace`
