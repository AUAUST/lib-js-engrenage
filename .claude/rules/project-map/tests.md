---
paths:
  - tests/**
---

# Project map: tests

```
tests/  (global roles: fixtures utils)
├─ bin/  mirrors bin
├─ scripts/  mirrors scripts
└─ src/  mirrors src
```

Effect levels, purest first: `pure` < `confined` < `effectful`. A role with a level imports at runtime only roles of its level or a purer one. Global roles import only each other.

| Role           | Purpose                                                               | Imports where they differ |
| -------------- | --------------------------------------------------------------------- | ------------------------- |
| `index`        | The domain's public surface.                                          |                           |
| `constants`    | Deeply read-only constants of the domain.                             | level pure                |
| `declarations` | Ambient type declarations.                                            |                           |
| `types`        | Types only, one per module.                                           | type-only                 |
| `testutils`    | Reusable test utilities.                                              | level effectful           |
| `errors`       | Error classes, importable module by module.                           | level pure                |
| `enums`        | Enumerations, one per module.                                         | level pure                |
| `ports`        | Interfaces other domains implement, importable module by module.      | type-only, level pure     |
| `adapters`     | Implementations of other domains' ports, importable module by module. | level effectful           |
| `fixtures`     | Static test inputs.                                                   | level pure                |
| `testsetup`    | Test runner setup file.                                               |                           |
| `config`       | The domain's config section: its declaration and resolver.            | level confined            |
| `declarers`    | Functions creating option declarations.                               | level confined            |
| `definers`     | The tool's `define…Config` definers.                                  | level effectful           |
| `plugins`      | The tool's own plugins, one per module.                               | level effectful           |
| `operations`   | Impure logic and definers of the domain.                              | level effectful           |
| `conventions`  | Formatting conventions, discovered by category.                       | level confined            |
