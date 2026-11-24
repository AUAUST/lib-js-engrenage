---
"@auaust/engrenage": patch
---

- Add a `kind` option to every built-in environment's options, naming the namespace kind its top-level namespace takes; unset, the kind named like the environment
- Accept `kind` in a top-level namespace's `.namespace.json`, overriding the config's and reporting `config-metafile-conflict` when both set different kinds
- Report a namespace kind no `namespaceKinds` entry names as `unknown-namespace-kind`, replacing `unknown-environment-kind`
- Drop `kind` and the namespace fields from `.environment.json`, and let it sit beside a `.namespace.json`
