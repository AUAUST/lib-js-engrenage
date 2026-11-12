---
"@auaust/engrenage": minor
---

- Report inverted comparisons such as `!(a !== b)` with `sonarjs/no-inverted-boolean-check`, and autofix negated equalities to the opposite operator; negated relations stay unfixed since inverting them changes results with `NaN`
