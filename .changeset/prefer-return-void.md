---
"@auaust/engrenage": minor
---

- Add the `auaust/prefer-return-void` stylistic convention: a non-function block holding only an expression statement and a bare `return` becomes `return void expression;`
- Add the `auaust/no-return-undefined` stylistic convention, fixing `return undefined;` into `return;`
- Enable `no-useless-return` in the recommended rules
