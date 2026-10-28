---
"@auaust/engrenage": patch
---

Allow type parameters used only in a function's declared return type, such as `cast<Value>(target: unknown): Value | null`, which callers use to type the result. Type parameters that are never used, or used only once elsewhere, are still reported. The rule is now the `auaust/no-unnecessary-type-parameters` convention.
