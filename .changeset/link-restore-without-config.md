---
"@auaust/engrenage": patch
---

- Run `engrenage link --restore`, `--remove` and the link list without loading the project config, so a config needing the linked checkout no longer blocks restoring it after an install
