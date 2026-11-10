---
title: Project structure
description: Place code in the domains, layers and roles of the project structure.
category: coding-style
default: true
order: 42
---

## Project structure

```
environment          src, bin, scripts, tests, data, tooling: own directories and import rights
└─ namespace         groups domains in layers (layered architecture)
   └─ domain         one concern: `index` surface, plus an `entry` package entry when public
      ├─ role        directory or file with a fixed contract and effect level
      └─ sub-domain  same rules
```

- The generated project maps (`.claude/rules/project-map.md`, `project-map/<environment>.md`) carry the layout, visibility, aliases, roles and imports lint enforces: read the map of each environment you edit, and never restate it.
- Change the structure only in its description, the config and the `.namespace.json` and `.domain.json` files beside the directories they describe, then run `engrenage sync`. A new layer, namespace, role or public domain is an architectural contract under the decision protocol.
- Give each declared namespace, domain and role a one-line `purpose`; one that is hard to state or overlaps another reveals a design problem.
- Place code in the domain owning its concern, in the role whose contract fits it. A concern several domains share gets its own domain in the lowest layer holding everything it needs.
- Order sub-domains by inserting a namespace with layers; a domain never orders its children.
- Give a concern a contract domain only when it has two engines or a consumer needs its intent without the engine: its `ports/` state intents and conventions, never one engine's options; tool domains implement them in `adapters/`, and the composing layer injects them.
- Import through the generated `#…` aliases, never relative paths.
- Put generated modules where a handwritten one would go, with a header naming their generator.
- Keep `bin` commands thin: their logic lives in the domains owning it.
- Test public behavior through its public specifier; use `.src` only to reach internals.
