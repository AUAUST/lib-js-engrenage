---
"@auaust/engrenage": minor
---

- Add `roles` to the `src`, `tests`, `scripts` and `tooling` environments: the directories and files whose names carry a fixed meaning, as a list built from presets (`src: { roles: [index(), entry(), utils({ nesting: 1 })] }`); an environment has only the roles it lists
- Add the `@auaust/engrenage/roles` entry with `createRolePreset` and the presets `index`, `entry`, `constants`, `declarations`, `types`, `utils`, `errors`, `enums`, `ports`, `adapters`, `fixtures`, `setup`, `schemas`, `components`, `hooks`, `contexts`, `pages` and `styles`; a preset call overrides any property of its defaults, such as nested `roles` or the directory names in `aliases`
- Add `structure.effects`, the effect levels shared by every environment
- Write the roles of `src`, `tests`, `scripts` and `tooling` into the config file `engrenage init` creates, with `entry()` for a published project
- Switch off a structure rule only through the ESLint `structure` option
- Load the `setup.ts` file of the tests root in Vitest through the `setup` role, overridable through the new `setupFiles` option
