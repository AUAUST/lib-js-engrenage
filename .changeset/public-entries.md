---
"@auaust/engrenage": minor
---

- **Breaking**: Remove `loadConfig`, `loadValidatedConfig`, `LoadedConfig`, `PackageType` and `PublishAccess` from the root entry, which exports the config section values and shared path and sync types. Upgrade: import the loaders from `@auaust/engrenage/config` and `PackageType` and `PublishAccess` from `@auaust/engrenage/package`.
- **Breaking**: Move `syncBlocks`, `syncFiles` and `syncIgnoreFile` to `@auaust/engrenage/blocks/internals`, `filesIn` to `@auaust/engrenage/filesystem/internals` and `validate` to `@auaust/engrenage/options/internals`, with no stability guarantee. Upgrade: import them from there, or stop depending on them.
- Derive package entries from the public domains, adding `format`, `package`, `baseline` and `roles`; tools format through the `Formatter` port
- Add `structure.internals` and `<environment>.domains.<path>.internals`, exposing a domain's `index.ts` under `<subpath>/internals` with no stability guarantee
- Add `definePrettierConfig` to `@auaust/engrenage/prettier`, mapping the `format` section with the project's plugins and overrides; the default export stays the defaults-only config, and `engrenage init` writes `prettier.config.ts` only for custom rules
- Build entries to `dist/<specifier>.mjs`, public specifiers unchanged
