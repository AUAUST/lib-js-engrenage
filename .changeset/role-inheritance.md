---
"@auaust/engrenage": minor
---

- Add `inherit` to role contracts: the given fields are merged over the named role (a homonym inherits the previous layer), so changing one field no longer restates the contract. A role defined without `inherit` is still replaced whole.
- Rename the file role keys `constants.ts` to `constants` and `*.d.ts` to `declarations`; the `constants` file name is read from its contract, so `{ inherit: "constants", file: ["consts.ts"] }` renames it.
