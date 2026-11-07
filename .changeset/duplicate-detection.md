---
"@auaust/engrenage": patch
---

- Add `engrenage jscpd`, detecting duplicated code in the project's code files outside tests, fixtures and generated files
- Warn in `engrenage gate` about clones the changed files add, when the project depends on jscpd
- Add the jscpd init step, installing jscpd as a dev dependency
- Group the gate's budget warnings under a `budgets` heading
