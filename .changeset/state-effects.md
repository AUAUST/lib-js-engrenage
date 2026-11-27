---
"@auaust/engrenage": minor
---

- Charge writes in `auaust/import-effects` by who owns the state they change: nothing for the running function's own, `confined` for received, enclosing-function and unexported module state, `effectful` for exported module state, imported bindings and globals
- Charge `observing` for reading a `let` or `var` another function declares in `auaust/import-effects`
- Charge reading a ranked member path of an external binding, such as `env.HOME` from `node:process`, its member rank in `auaust/import-effects`
