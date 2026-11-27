---
"@auaust/engrenage": patch
---

- Add the `auaust/import-effect-hints` info rule, hinting at effects `auaust/import-effects` cannot prove: code a function created inside a tagged one runs above that tag, callable bindings passed without being invoked above the invocation ceiling, and writes to values a call result or a reassignment hides
