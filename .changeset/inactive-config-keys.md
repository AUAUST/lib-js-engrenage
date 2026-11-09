---
"@auaust/engrenage": minor
---

- Activate an extension declaring `when: { installed }` only while the project depends on that package; `config.resolve` refuses its keys while it is inactive, and its config input still validates
