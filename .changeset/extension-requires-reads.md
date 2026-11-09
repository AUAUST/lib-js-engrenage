---
"@auaust/engrenage": patch
---

- Refuse a config key whose extension's `requires` are unmet, naming the unmet requirement
- Fail only the file resources of an extension with unmet `requires`, instead of every resource
- Pick up the file resources of a tool once a staged `package.json` adds its package
