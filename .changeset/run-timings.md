---
"@auaust/engrenage": patch
---

- Add the `--timings` run option, printing how long each phase of a run took, with the measures commands record, at any verbosity but `--silent`; `--debug` prints them too
- List the stages and steps of `engrenage gate --timings` in the run's timings, nested under the gate
