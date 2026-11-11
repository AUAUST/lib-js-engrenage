---
"@auaust/engrenage": minor
---

- A role's `exports` takes `{ values, types }` to check value and type exports apart; a string still sets both
- The `utils` preset accepts named type exports beside its value, and the `types` preset exports no value
- A type-only role fails at config resolution when it exports values
- Project maps list each role's export axes
