# source-structure

Organization of `src/`: role directories, module boundaries and entry layering.

## 1. `utils/` directories are flat dumps of unrelated roles.

- Where: `src/typescript/utils/` (26 files), `src/config/utils/` (18), `src/eslint/utils/` (16), `src/agents/utils/` (11), `src/tsdown/utils/` (8), `src/utils/`.
- Problem: one directory holds creators (`createTsconfig`), resolvers (`resolveTsconfigOwner`), readers (`readTsconfigValue`), predicates (`isPackageAlias`), sync routines (`syncEditions`, `syncBarrels`), date arithmetic (`addMonths`, `findCurrentMonth`), and parsers, with nothing to tell the categories apart or to find a feature's files. Related files (the `resolveTsconfig*`, `resolveBaseline*` and `*EsLibrar*` families in `typescript`) are only grouped by filename prefix.
- Expected: a documented classification of the module kinds living in `utils/`, then a structure (role directories, feature directories or another grouping) derived from it, informed by how established libraries organize comparable code, and stated in project-agnostic terms for the agent instructions.
- Open: the classification, the grouping criterion and how it fits the `config/`, `setup/`, `plugins/`, `utils/` entry layout in `AGENTS.md`. This needs investigation of reference libraries, then a decision. The investigation should also yield a reusable, project-agnostic approach for structuring complex code.
- Related: `source-structure.6` (role-directory and domain model), which may supply the grouping.
- Done when the classification and chosen structure are recorded in the instructions and `utils/` directories follow them.

## 2. Entries depend on each other in both directions.

- Where: `src/config/utils/*` imports from `#typescript/` (11 imports), `#agents/` (2), `#tsdown/`, `#prettier/`, `#pnpm/` and `#github/`, while `src/typescript/` imports from `#config/` 43 times (`eslint` 19, `agents` 14, `tsdown` 10 do the same).
- Problem: `config` and `typescript` import each other, and `config` knows every tool, so the layering is circular. For example `createResolvedConfig` calls `#typescript/utils/createTsconfig`, and `resolveTsconfig*` in `config` embeds tsconfig knowledge.
- Expected: a one-way layering where `config` is a base that tools depend on, with tool-specific resolution (tsconfig files, owners, presets) living in the tool's entry and contributed to the config rather than imported by it.
- Open: whether tsconfig handling is its own subsystem or belongs to `typescript`; how tools contribute resolved values to the config without `config` importing them. This needs design.
- Related: `source-structure.8` (contracts versus infrastructure), `configuration.5`.
- Done when no import cycle exists between entries, ideally enforced by a lint rule.

## 3. Confusingly similar module names.

- Where: `src/config/utils/resolveNodeRuntime.ts` (validates a Node major against `node-releases` and builds a `Runtime`) versus `resolveRuntimeNode.ts` (defaults a major from `engines.node`); `resolveSourceRuntime`, `resolveCodeEnvironment` versus `createCodeEnvironment`; private `readLibrary` in both `syncEditions` and `syncApiDeclarations`.
- Problem: the names are word permutations of one another and do not tell what each does, so callers import the wrong one easily.
- Expected: names that state the distinct result of each module, applied consistently with the verb conventions the classification in `source-structure.1` defines.
- Done when no two modules differ only by word order and each name states its result.

## 4. Agent instructions do not name the known patterns the project follows.

- Matter: the conventions and structures in the instructions may map to known, named design patterns or conventions. Naming them could let agents grasp the intended structure with little or no extra explanation.
- Expected: determine which of the project's patterns match a named one and name it in the instructions, in project-agnostic terms. Related to `source-structure.1`, whose classification may adopt such names.
- Open: which patterns match; needs investigation, then a decision.
- Done when the instructions name the matching patterns, or the investigation finds none worth naming.

## 5. The public API must be defined during the redesign.

- Matter: the refactor is the chance to clarify and solidify the public API so everything implemented is reusable by other tools, mainly `package.json` handling, baselines, etc.
- Concrete need: a simple way to format a given file by the project's established conventions, so a library (e.g. toolkit) can write syntactically correct output and delegate formatting entirely to the project's formatter.
- Related: `source-structure.2`, `configuration.5`, `file-editing.1`.
- Done when the public API surface is designed and recorded as part of the redesign, then exposed.

## 6. Role directories, domains and subdomains are not modeled.

- Matter: `utils` and `types` should be first-class role directories at the root and inside any domain (`src/foo/utils` beside `src/utils`).
- Expected model:
  - Preset roles (`config`, `plugins`, `contracts`, ...), extensible by consumers.
  - Any directory at any layer that is not a role is a domain or subdomain, following the same rules recursively.
  - Grouping directories (e.g. `support`) are domains that own no roles and only contain subdomains.
  - Explicit opt-out per directory or subdomain, so support domains named after a role (they support it) are not treated as role directories.
- Role constraints: `utils` imports only neighbours, higher-level utils or types (`src/foo/utils` may import `src/foo/utils`, `src/foo/types`, `src/utils`, `src/types`, not `src/bar/utils` or `src/foo/components`); `types` declares no runtime values.
- Related: `source-structure.1` (supersedes its open grouping question if adopted), `source-structure.2`, `source-structure.7`, `configuration.6`.
- Done when the model is decided, described in the project structure config and enforced by lint.

## 7. Per-role file constraints are not linted.

- Matter: the lint already has "no default export except discovered files", i.e. a discovered-files type with its own constraints. Generalize it.
- Candidate constraints per file type or role:
  - Single export only; export name matches file name; no local declarations.
  - `constants.ts` exports deeply readonly values (type-aware rule).
  - `index.ts` declares no local values, with possible exceptions such as a SCREAMING_CASE module-metadata constant.
- Open: which constraints to formalize and how roles declare them.
- Related: `source-structure.6`, `configuration.6`.
- Done when the constraints are decided, declared per role/file type and enforced.

## 8. Tool-agnostic contracts versus tool infrastructure.

- Matter: everything may depend on e.g. the build configuration without importing tsdown. Introduce a contract/infrastructure pattern: a `build` domain describes declarative build intent; tsdown and Vite are infrastructure implementing it.
- Benefits: tests describe build intent without spinning up a builder; the engine can be swapped without touching the config.
- Related: `source-structure.2` (layering), `source-structure.4` (named patterns), `source-structure.6` (`contracts` role), `configuration.6`.
- Done when the pattern is decided and applied at least to build, or rejected with a reason.
