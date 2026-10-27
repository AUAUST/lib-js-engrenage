---
"@auaust/engrenage": minor
---

- Accept an `info` severity in conventions, the built-in rule maps and the configs passed to `defineEslintConfig`; ESLint receives it as `warn`
- Show the rules declared `info` at info severity in VS Code, derived from the project's ESLint config by `engrenage sync`
- Declare the `naming` and `noUnusedVariables` conventions and the DOM unicorn rules as `info`
- Enable more unicorn rules for likely bugs, dead code, clearer APIs and early exits, leaving out those that conflict with the toolkit and primitive-kit helpers
- Add the `stylistic.numericSeparators` convention
- Make the `vscode` sync target and `syncVscodeFiles` asynchronous
