---
"@auaust/engrenage": minor
---

Declare every config option with a default in its declaration: the generated descriptions end with the `@default` computed from it, and the resolved config fills every gap. `src.apis` conflicts and `inherits` conflicts now fail when `src` or the environment is read, not when its runtime or tsconfig is.
