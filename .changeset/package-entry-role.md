---
"@auaust/engrenage": minor
---

A public domain is the one holding an `entry.ts` (the `entry` role, whose file is renamable), which re-exports the public subset of its `index.ts`; `index.ts` is every domain's surface for the rest of the project. The `public` domain option is removed, and the root package entry is `src/entry.ts`.
