---
"@auaust/engrenage": minor
---

- Add the role contract field `typeOnly` (on for the `types` and `ports` presets): the modules of such a role declare no runtime value and import, type-only, anything their domain may import, its own runtime modules included. The `typeOnlyRoles` convention replaces `typesDeclarations`.
- Add `typescript.verbatimModuleSyntax` (default `true`); `false` is written into the base tsconfig, makes every role resolve `typeOnly: false` and turns the type import convention off. A contradicting `typescript.tsconfig.compilerOptions.verbatimModuleSyntax` fails.
