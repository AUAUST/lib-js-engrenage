---
"@auaust/engrenage": minor
---

Add the `roles` option, at the top level and in the `src`, `tests`, `scripts` and `tooling` environments: it enables, disables, defines and aliases roles, the directories and files whose names carry a fixed meaning, and `roles: false` turns the role system off. Each environment resolves its effective roles, and Vitest loads the `setup.ts` file of the tests root by itself, overridable through the new `setupFiles` option.
