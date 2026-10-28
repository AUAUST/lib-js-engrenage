---
"@auaust/engrenage": patch
---

Report literals widened by their primitive only when written in the union itself, such as `"a" | string`, no longer through a referenced type, such as `Operator | string`. The rule is now the `auaust/no-redundant-types` convention.
