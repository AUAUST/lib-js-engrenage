---
"@auaust/engrenage": minor
---

`createVitestConfig` sets `test.isolate: false`, so test files share workers instead of each starting its own, and `test.restoreMocks: true`, so spies and mocks are restored after each test instead of leaking into the next files.

**Breaking:**

- Tests that rely on a fresh module state per file, or on a mock surviving past the test that created it, must restore that state themselves or opt back in with `test.isolate: true` or `test.restoreMocks: false` through a native config passed to `defineVitestConfig`.
