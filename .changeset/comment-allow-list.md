---
"@auaust/engrenage": patch
---

- Allow only directive, `@debt`, project-defined documentation and user-requested comments in the implementation section, turning any other comment the code seems to need into a `@debt` marker
- Let debt markers be added within the task that notices them, files only read included, and scope the debugger's debt marking to what it notices while diagnosing
