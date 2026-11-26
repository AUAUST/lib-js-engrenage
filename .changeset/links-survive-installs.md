---
"@auaust/engrenage": patch
---

- Restore linked checkouts and their new executables whenever `engrenage` runs, and run the linked checkout's `engrenage` when an install replaced it
- Sync a `prepare` script running `pnpm engrenage link --restore`, after any command it already runs
- Restore linked checkouts after `engrenage pnpm upgrade` installs
- Restore every linked checkout that exists in `engrenage link --restore`, then report the missing ones
