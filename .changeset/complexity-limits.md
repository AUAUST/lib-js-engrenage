---
"@auaust/engrenage": minor
---

- Report functions above a cognitive complexity of 20 (`sonarjs/cognitive-complexity`) or longer than 125 lines (`max-lines-per-function`), and modules longer than 300 lines (`max-lines`), blank lines and comments excluded and test files exempt from the line limits, as the `stylistic` conventions `cognitiveComplexity`, `functionLines` and `fileLines`. Upgrade: refactor the reported code, raise the limits, or disable the conventions.
- Report functions with identical implementations (`sonarjs/no-identical-functions`) as the `stylistic` convention `noIdenticalFunctions`.
- Add the `format.maxCognitiveComplexity`, `format.maxFunctionLines` and `format.maxFileLines` options.
