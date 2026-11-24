---
"@auaust/engrenage": patch
---

- Point a linked package's executables in `node_modules/.bin` at its checkout in `engrenage link` and `--restore`, and back at the installed package in `--remove`
- Fail the links sync check when an install points a linked package's executables away from its checkout
