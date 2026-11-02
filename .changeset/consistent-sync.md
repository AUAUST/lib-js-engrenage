---
"@auaust/engrenage": patch
---

- Make `engrenage sync --check` pass right after `engrenage init`: init now syncs once, and a single sync pass writes the build output directory (`/dist`) into the ignore files even when `tsconfig.json` does not exist yet
- Run the selected sync targets in their declared order, with the tsconfig target first, instead of the order they were typed
