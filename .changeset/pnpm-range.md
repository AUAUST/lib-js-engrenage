---
"@auaust/engrenage": minor
---

- Compare the pnpm of a project with engrenage's declared pnpm range instead of its major, warning below and above it
- Make `engrenage pnpm upgrade` write the highest pnpm within engrenage's range, warn instead of failing for a newer pnpm, and ask before moving it back into the range (`--yes` accepts)
- Make `engrenage init` declare the highest pnpm within engrenage's range when the project declares none
