---
"@auaust/engrenage": minor
---

- Fail `engrenage typecheck` and the gate's typecheck step when no environment is type-checked
- Name the environments `engrenage typecheck` and the gate skip, with `check: false` or a disabled tsconfig
- Name the environments holding TypeScript files without a tsconfig, which `engrenage typecheck` and the gate skip
- Check the project `engrenage typecheck -p` names instead of building the base tsconfig
