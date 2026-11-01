# tests

Test suite isolation and reliability.

## 1. `vi.mock` in `syncTsconfigFiles.test.ts` leaks into other files, making the suite flaky.

- Where: `tests/typescript/syncTsconfigFiles.test.ts`, `isolate: false` in the default Vitest options.
- Problem: the file mocks `#typescript/setup/tsconfigProducers`. With isolation off, whichever test files share its worker see the mock or the real module depending on scheduling, so `produceTsconfig*.test.ts` or `syncTsconfigFiles.test.ts` fail in roughly half of the runs (4 to 9 failures, also without any other change).
- Expected: the mock no longer depends on module sharing, for example by passing the producers as a parameter or by isolating that file.
- Done when `pnpm test` passes repeatedly (10 runs in a row).
