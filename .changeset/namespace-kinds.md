---
"@auaust/engrenage": patch
---

- Add the `namespaceKinds` slot, holding the boundary facts (`level`, `structure`, `layout`, `code`, `imports`, `inward`) each top-level namespace takes from the kind named like it
- Keep only `name`, `languages` and `tsconfig` on `environmentKinds` entries
- Export `createNamespaceKindPreset` and the `NamespaceKind`, `NamespaceKindPreset`, `NamespaceRelation` and `InwardPolicy` types from `@auaust/engrenage/extensions`
