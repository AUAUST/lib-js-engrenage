---
"@auaust/engrenage": minor
---

- Report functions above a cognitive complexity of 15 (`sonarjs/cognitive-complexity`) or longer than 100 lines, blank lines and comments excluded (`max-lines-per-function`, outside test files), as the `stylistic` conventions `cognitiveComplexity` and `functionLines`. Upgrade: refactor the reported functions, raise the limits, or disable the conventions.
- Add the `format.maxCognitiveComplexity` and `format.maxFunctionLines` options.
