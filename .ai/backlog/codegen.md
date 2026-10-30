# codegen

Adoption of @auaust/codegen.

## 1. Barrels and generated-file writers belong to codegen.

- Where: `src/typescript/utils/syncBarrels.ts`, `src/utils/syncBlocks.ts`, `scripts/support/codegen/`
- Problem: engrenage owns the `// @barrel` marker sync and the block writers it generates files with; AUAUST/lib-js-engrenage#9 lists why that is brittle. `@auaust/codegen` is not published yet (0.0.0).
- Fix: once codegen is published, move the barrel and writer implementations there and have engrenage consume them only.
- Done when engrenage#9 is resolved and engrenage no longer implements barrels or writers.
