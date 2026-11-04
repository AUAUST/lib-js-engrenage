# coding-style

Local coding conventions and linting.

## 1. Type casts remain in source.

- why: `AGENTS.md` forbids casts and assertions without a supported invariant, and none of these carries a marker or a justification: `scripts/codegen/generateEditions.ts` (`esInterfaceAliases` and `esMemberCompatKeys` cast `as Record<string, string | undefined>`, lines 299 and 321), `src/project/config/utils/createAccessors.ts` (`as unknown as Accessors<Fields>`), `src/tools/eslint/conventions/imports/noExternalNamespace.ts` (`context as unknown as ImportContext`).
- want: each site typed without the cast (for example a lookup helper over a frozen table, a typed accessor factory) or marked with `@debt` stating the invariant it depends on.
- done: each site is cast-free or carries a `@debt` marker.
