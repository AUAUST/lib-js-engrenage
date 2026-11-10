---
"@auaust/engrenage": minor
---

- Declare each environment's structure as one nested tree under `<environment>.structure`, replacing the flat `namespaces` and `domains` records keyed by path: the root namespace takes `layers`, `relation`, `purpose` and `roles`, and every namespace and domain nests its children under `namespaces` and `domains`, keyed by directory name or, for domains, a one-segment glob

  ```ts
  // Before
  src: {
    namespaces: { ".": { layers: ["core", "*"] }, core: { purpose: "Core." } },
    domains: { "core/model": { purpose: "The model." } },
  }

  // After
  src: {
    structure: {
      layers: ["core", "*"],
      namespaces: {
        core: { purpose: "Core.", domains: { model: { purpose: "The model." } } },
      },
    },
  }
  ```
