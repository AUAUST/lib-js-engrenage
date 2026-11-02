---
"@auaust/engrenage": minor
---

- Generate the `src.apis` declaration groups from the `lib.dom.d.ts` of TypeScript with `pnpm support codegen apis`, instead of shipping hand-written copies; `--check` runs in CI
- `timers` gains `setInterval` and `clearInterval`, `crypto` gains `randomUUID` and `subtle`, and `performance` gains the full `Performance` interface
- Add the `console`, `url`, `encoding`, `events`, `abort`, `exceptions`, `microtasks`, `streams`, `compression` and `blob` groups
- Declarations shared by several groups are emitted once in `apis/shared/common.d.ts`, which the group files reference, so any combination of groups type-checks without `skipLibCheck`
- Timer handles are now typed `number`, the DOM signature
