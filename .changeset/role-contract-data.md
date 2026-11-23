---
"@auaust/engrenage": patch
---

- Take a role's `file` and `companions` as globs with `<domain>`, `<Domain>`, `<name>` and `<Name>` placeholders instead of described resolver functions
- Take `structure.effects.modules` as a record only, no longer a function
- Take only rule entries in a role's `rules`, and role rules through the `roleRules` option of `defineEslintConfig`, by role name
- Remove the `RoleFileResolver`, `RoleCompanionResolver`, `RoleModule`, `EffectModuleResolver` and `RoleRuleModule` types, and the `tool` field of role rules
- Export `RoleRuleLoader` from `@auaust/engrenage/eslint` instead of `@auaust/engrenage/extensions`
