---
"@auaust/engrenage": minor
---

Replace the `tests.files` option by `tests.location`, `tests.suffix` and `tests.extension`, and test the built package of libraries through public specifiers: `x.test.ts` runs in source and dist mode, `x.test.src.ts` in source mode only and `x.test.dist.ts` in dist mode only. Dist mode fails on any resolution into the sources, and two lint conventions reject the forbidden imports of each variant.
