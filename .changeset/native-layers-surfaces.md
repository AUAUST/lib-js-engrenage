---
"@auaust/engrenage": minor
---

- Breaking: remove `eslint.boundaries.layers` and `eslint.boundaries.surfaces`; toggle the rules with `structure: { importLayers: false }` or `structure: { importSurfaces: false }`
- Name the broken relation and its fix in `auaust/import-layers` and `auaust/import-surfaces` messages
- Report a runtime import from a global type-only role in `auaust/import-surfaces` and `auaust/import-layers`
