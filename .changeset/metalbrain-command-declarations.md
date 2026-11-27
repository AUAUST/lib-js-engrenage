---
"@auaust/engrenage": patch
---

- Add `separator` to `argument` and `option` in `future/nexus/cli`, splitting each value given into items that `choices` check and `parse` maps one by one, and that help states
- Add `chain` to `command` in `future/nexus/cli`, chaining invocations separated by `--next`
