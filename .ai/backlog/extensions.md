# extensions

The extension registry and extension declarations.

## 1. Extension registry erases declaration types

- sites: `src/foundation/extensions/utils/collectExtensions.ts:74`, `src/foundation/extensions/utils/createRegistry.ts:26`, `:153`
- why: `ExtensionShape` types `owns` and `contributes` as `object`, so reads cast them; the slot policy union is restated twice; per-kind and per-slot maps erase declaration and entry types. Related: #331.
- want: typed declarations and entries through the registry; one slot policy union.

## 2. The tsc constant is re-exported only for its extension

- sites: `src/tools/typescript/tsc/constants.ts:1`
- why: `roles/extension/extension-imports` keeps the extension from importing `typescript` from `#constants`, so the domain re-exports it.
- want: the extension imports the constant from its owner.
