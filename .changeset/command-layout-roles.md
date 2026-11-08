---
"@auaust/engrenage": minor
---

- Give every `commands` environment, `bin` included, the `index`, `executable`, `commands` and `actions` roles; a listed role of the same name replaces the layout's
- Accept `roles` on `bin`
- Fail `structure --check` on a module beside the command group of its name
- Check command modules against the `commands` role's default export
