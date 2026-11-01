---
"@auaust/engrenage": minor
---

`createTsdownConfig` sets tsdown's `target` from the resolved `src` runtime (the baseline browsers and Node minimum, or the Node major) instead of falling back to `engines.node`.
