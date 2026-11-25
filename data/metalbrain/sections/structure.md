---
title: Project structure
description: Place code in the domains, layers and roles of the project structure.
---

## Project structure

```
environment          own directories and import rights
└─ namespace         groups domains in layers (layered architecture)
   └─ domain         one concern: `index` surface, plus an `entry` package entry when public
      ├─ role        directory or file with a fixed contract and effect level
      └─ sub-domain  same rules
```

- The generated project maps (`.claude/rules/project-map.md`, `project-map/<environment>.md`) carry the layout, visibility, aliases, roles and imports lint enforces: read the map of each environment you edit or design for, and never restate it.

A namespace builds on the layers below it and the foundations, never on one above. Place code by these concepts too, which no code enforces and no directory name fixes:

- **Foundations.** Primitives every namespace builds on; they build on no namespace.
- **Support.** `utils`, `types` and constants: generic pure or confined logic deduplicating code, owning no business logic; usable at any level. A helper holding business logic belongs to the domain owning that logic.
- **Binding.** The effectful glue injecting one domain into another: `extension.ts`, ports typing what fills a slot. Never support, even when small.
- **Ambient declarations** (`*.d.ts`). Between support and the environment.

Place:

- **Code.** The domain owning its concern, in the role whose contract fits it.
- **A concern several domains share.** Its own domain, in the lowest layer holding everything it needs.
- **Order between sub-domains.** A namespace with layers inserted above them; a domain never orders its children.
- **A concern with two engines, or whose intent a consumer needs without one.** A contract domain. Its `ports/` state intents and conventions, never one engine's options; tool domains implement them in `adapters/`; the composing layer injects them.
- **A generated module.** Where a handwritten one would go, with a header naming its generator.
- **A `bin` command's logic.** The domain owning it; the command stays thin.
- **A structure change.** Its one-line `purpose`, the config, and the `.namespace.json` and `.domain.json` beside the directories. A new layer, namespace, role or public domain is an architectural contract under the decision protocol.
- **A test of public behavior.** Through its public specifier; `.src` only to reach internals.
