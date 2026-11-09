---
"@auaust/engrenage": minor
---

- Give contributed environments aliases, located entities, generated and discovered files, published or private code (`code`), project-map root files and ESLint scopes (`files.<name>`, `dir.<name>`)
- Rename the resolved `tooling.files` to `tooling.rootFiles`
- Keep the directories an environment's `dirs` adjustment prepends or appends out of every other environment's default `dirs`
- Detect a workspace entry with any extension of a `modules` language, and target the `typescript` language's extensions in ESLint's TypeScript-only import rules
