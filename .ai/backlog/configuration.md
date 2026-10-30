# configuration

Project configuration contract: option shapes, list options and package entries.

## 1. Semantics of list options.

- Issues: #60, then #61 and every list field of the managed tsconfigs (plan #37).
- Decided: an array replaces the default, `{ prepend, append, exclude }` adjusts it, `true` is the default, `false` leaves the list unmanaged.
- Open:
  1. Can one object combine `prepend`, `append` and `exclude`, and in which order do they apply? Recommendation: combinable, `exclude` applied to the default first, so it never removes what the project adds.
  2. Is the result deduplicated? Recommendation: yes, keeping the first occurrence.
  3. Does `exclude` match items exactly, or as globs in glob lists? Recommendation: exactly, which stays predictable.
  4. What does `false` mean for a list engrenage only reads (`code.discoveredFiles`, `test.dirs`)? "Leave it alone" fits fields engrenage writes; for read lists it would mean an empty list. Recommendation: accept `false` only where engrenage writes or generates something, and reject it elsewhere in the schema.
  5. Is `true` worth keeping when omitting the option means the same? It can reset an override coming from a preset.
- Done when each point is answered and #60 states the rules.

## 2. Shape of the per-role tsconfig options.

- Issues: #62, #64, #42, #45.
- Decided: each role (set in `typescript.1`) has a configurable path, the base included; every managed field can be overridden or left alone; projects can set custom fields. The maintainer suggested a root `tsconfig` group (`tsconfig.base`, `tsconfig.dist`…) holding a roughly mirrored tsconfig structure.
- Open:
  1. Location: a root `tsconfig` group, or roles under the existing `typescript` group? A root `tsconfig` key shares its name with the resolved `config.tsconfig` (the parsed base tsconfig tsdown reads `paths` from), which would then need renaming.
  2. Fields of a role: `path`, `extends`, `include`, `checksWith` (`typescript.3`), runtime keys (baseline snapshot, Node major), and a `compilerOptions` mirror where a value overrides, `false` leaves the field alone and omission keeps engrenage's default. Are unmanaged fields accepted in the mirror as custom fields, written as given?
  3. Does `false` on a whole role mean engrenage neither creates nor updates that file?
  4. Migration of `typescript.tsconfig`, `typescript.distTsconfig` and `typescript.envFile`: removed in a breaking minor release (the package is pre-1.0), or kept as deprecated aliases for one release? Where does `envFile` live afterwards?
  5. Where the baseline option (#42) and the host declaration groups (#45) go.
- Done when #62 and #64 state the shape.

## 3. Package entries declared in `engrenage.config.ts`.

- Issues: #63, #67.
- Decided: declared entries are the source of truth and generate the base tsconfig `paths`; without them, `paths` stay the source; entries are written relative to the project root.
- Context: today only `bin.dirs` feed tsdown entries (one per `bin/` file), next to the `paths` aliases; `source.dirs` and `scripts.dirs` feed barrels and ESLint scopes, and scripts are never bundled.
- Open:
  1. Shape: keyed by export subpath like `package.json` `exports` (`".": "src/index.ts"`, `"./agents/*": "src/agents/*/index.ts"`), or by alias? Wildcards limited to one `*`, as `resolvePathAliases` requires?
  2. Kinds: are `bin/` entries declared there too, or still discovered from `bin.dirs`? Do scripts get aliases (they have no package name)? The maintainer mentioned dedicated entries per kind of file.
  3. Conditional aliases: which roles see which aliases? Dist turns them off; do tests and scripts see the source aliases?
  4. Do tsdown `customExports` (data files such as `./tsconfig/*.json`) move into the config entries?
  5. When entries exist, does `sync` own the whole `paths` field, or only the aliases under the package name?
- Done when #63 and #67 state the shape.
