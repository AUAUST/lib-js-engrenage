---
"@auaust/engrenage": patch
---

- List every other command on `--help` when a command loader or a command's loaded options, choices or help fail to load, warning with each error
- Report an unknown command's usage error with its suggestions when a command loader fails, followed by the loader's error
- Fail a command a later loader provides with the error of an earlier loader that failed, running nothing
