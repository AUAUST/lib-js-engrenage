# extensions

The extension registry and extension declarations.

## 1. Extension registry erases declaration types

- sites: `src/foundation/extensions/utils/collectExtensions.ts:74`, `src/foundation/extensions/utils/createRegistry.ts:26`, `:153`
- why: `ExtensionShape` types `owns` and `contributes` as `object`, so reads cast them; the slot policy union is restated twice; per-kind and per-slot maps erase declaration and entry types. Related: #331.
- want: typed declarations and entries through the registry; one slot policy union.

## 2. Extension declarations repeat boilerplate

- sites: `src/tools/agents/extension.ts:7`, `:18`, `src/tools/typescript/tsc/constants.ts:1`
- why: no `declareExtension` helper for one or many definitions; section loading repeats one import pattern; the tsc constant is re-exported only so the extension can import it.
- want: a shared declaration helper and lazy section loader; the extension imports the constant from its owner.
