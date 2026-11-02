---
"@auaust/engrenage": minor
---

- Warn during `engrenage sync` about a missing pnpm declaration, a pnpm major other than engrenage's, a legacy `packageManager` field and an obsolete `only-allow` preinstall script, without ever failing the check
- Add `engrenage pnpm upgrade`, which moves the project to the latest pnpm within engrenage's major, removes the obsolete fields and re-pins the lockfile
