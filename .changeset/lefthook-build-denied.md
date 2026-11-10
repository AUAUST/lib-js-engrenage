---
"@auaust/engrenage": patch
---

Init no longer fails with `ERR_PNPM_IGNORED_BUILDS` after adding lefthook: the workspace settings now deny lefthook's build script, whose hook install the lefthook step runs itself.
