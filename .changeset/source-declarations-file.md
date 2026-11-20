---
"@auaust/engrenage": minor
---

- Write defined globals into src/env.d.ts and include it in the tsconfig of the tests and of every environment importing src
- Remove typescript.envFile and the defines option of environments: src/env.d.ts holds the defined globals
- Include a root global.d.ts in every generated tsconfig
