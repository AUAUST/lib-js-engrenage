---
"@auaust/engrenage": minor
---

- **Breaking**: Ship effect levels for Node built-ins only; third-party imports such as `typescript`, `eslint` or `c12` are now unranked and never reported. Upgrade: rank the packages you rely on through `structure.effects.modules`
