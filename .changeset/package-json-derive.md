---
"@auaust/engrenage": minor
---

- Write `devEngines.runtime`, and for the library preset `engines.node`, `bin` and `files`, on `engrenage sync` from the config (new `package` sync target). `devEngines.runtime` pins `runtime.node` with `onFail: "error"`, so CI runs the chosen Node major.
