---
"@auaust/engrenage": minor
---

- Remove the top-level `roles` option, `roles: false` included, and the role catalogue with its environment defaults: an environment has only the roles it lists
- Replace `<environment>.roles` (`enable`, `disable`, `define`, `aliases`, `effects`) with a list of roles built from presets: `src: { roles: [index(), entry(), utils({ nesting: 1 })] }`
- Remove the role field `inherit`: a preset call overrides any property of its defaults, and `createRolePreset({ name, … })` builds a project's own presets
- Move aliases into each role (`utils({ aliases: ["helpers"] })`) and effect levels to `structure.effects` (`levels`, `modules`, `fallback`), shared by every environment
- Add the `@auaust/engrenage/roles` entry with `createRolePreset` and the presets `index`, `entry`, `constants`, `declarations`, `types`, `utils`, `errors`, `enums`, `ports`, `adapters`, `fixtures`, `setup`, `schemas`, `components`, `hooks`, `contexts`, `pages` and `styles`
- Rename the tests setup role from `setup.ts` to `setup`
- Replace `rolesSection` with `structureOptionsSection` and drop `roles` from the ESLint convention config, so structure rules always apply unless switched off through the ESLint `structure` option
- Write the roles of `src`, `tests`, `scripts` and `tooling` into the config file `engrenage init` creates, with `entry()` for a published project
