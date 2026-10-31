---
"@auaust/engrenage": minor
---

- Generate the `extends` of every managed tsconfig in `engrenage sync`: the base extends the engrenage `library.json` or `base.json`, environments extend the base and the `tests.dist` variant extends the tests tsconfig, each as a path relative to its own directory
