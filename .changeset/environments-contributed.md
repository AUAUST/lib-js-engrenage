---
"@auaust/engrenage": minor
---

- Let extensions contribute environments (`environments`) with their level, structure, import grants, tsconfig and owned directories; the project maps, import boundaries and tsconfigs list every active environment in registration order
- Make `tooling` an import category that only `tests` imports, so `src`, `bin` and `scripts` now fail on importing tooling files
- Keep the directories an environment owns or lists in `dirs` out of every other environment's default `dirs`
- Mark the data environment inactive when none of its directories exists
- Add `input(key)` to the config resolver, reading a key's validated input without resolving it
