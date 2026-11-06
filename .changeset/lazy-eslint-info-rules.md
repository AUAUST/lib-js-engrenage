---
"@auaust/engrenage": patch
---

- Load the ESLint engine only when the VS Code sync reads ESLint's info rules, halving the start-up of every command that loads the config
