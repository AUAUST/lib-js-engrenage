---
"@auaust/engrenage": minor
---

- Make library entries import each other through the package's own name, so namespaces, module state and classes keep one identity across entries (`entry-self-references` tsdown plugin, switched off with `plugins: { "entry-self-references": false }`)
