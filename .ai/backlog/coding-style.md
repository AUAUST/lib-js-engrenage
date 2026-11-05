# coding-style

Local coding conventions and linting.

## 1. Type casts remain in source.

- why: `AGENTS.md` forbids casts and assertions without a supported invariant, and none of these carries a marker or a justification: `scripts/codegen/generateEditions.ts` (`esInterfaceAliases` and `esMemberCompatKeys` cast `as Record<string, string | undefined>`, lines 299 and 321), `src/project/config/utils/createAccessors.ts` (`as unknown as Accessors<Fields>`), `src/tools/eslint/conventions/imports/noExternalNamespace.ts` (`context as unknown as ImportContext`).
- want: each site typed without the cast (for example a lookup helper over a frozen table, a typed accessor factory) or marked with `@debt` stating the invariant it depends on.
- done: each site is cast-free or carries a `@debt` marker.

## 2. Lazy CLI command loading runs under temporary antipatterns.

- why: `auaust/no-dynamic-import` blocks the `import()` calls that load each CLI subcommand on demand; the rule is disabled in the 7 registration files, beside the other workarounds listed in #221, each marked `@debt`. The registration process is ugly in itself. A proper pattern to handle dynamic imports only on the expensive path is needed, while allowing to eagerly load the entire CLI graph upfront.
- done: #221 settles the rule and its markers are resolved.
