# @auaust/engrenage

## 0.11.2

### Patch Changes

- [`28de7f3`](https://github.com/AUAUST/lib-js-engrenage/commit/28de7f3fbd89b802b405a2aedc6d124ecf49c26b) Thanks [@apademide](https://github.com/apademide)! - - Enforce multiline JSDoc, a blank line before tags, and description tags before other tags.

## 0.11.1

### Patch Changes

- [`d0fcbca`](https://github.com/AUAUST/lib-js-engrenage/commit/d0fcbca512a77b819530c4369dc721b9c5419629) Thanks [@apademide](https://github.com/apademide)! - Claude sessions and subagents record their runs (turns, tools, tokens, context, stops) under the gitignored `.ai/stats` on each stop, and `engrenage agents stats` reports a session's runs by role and agent in weighted units.

- [`a50441c`](https://github.com/AUAUST/lib-js-engrenage/commit/a50441c8403e583a073fa16741e2bff4f598b148) Thanks [@apademide](https://github.com/apademide)! - Claude agents declare a `tools` allowlist, so they no longer inherit the client's whole tool surface.

- [`aeb204e`](https://github.com/AUAUST/lib-js-engrenage/commit/aeb204ebecf07b8fe63fb75720561f2c94a9cd9d) Thanks [@apademide](https://github.com/apademide)! - Built-in extensions register in the order of their names, so their contributions, such as `.prettierignore` groups, come out in the same order from source and from the built package.

- [`87862a2`](https://github.com/AUAUST/lib-js-engrenage/commit/87862a220120e3d6582977b1bd4e86e4d507d05e) Thanks [@apademide](https://github.com/apademide)! - Concurrent walks integrate leaves through one resumed, light merger per segment and run a full review merger at each segment's close, as sequential walks do.

## 0.11.0

### Minor Changes

- [`141bf58`](https://github.com/AUAUST/lib-js-engrenage/commit/141bf58525bccca232cda22741823a9cd32614fb) Thanks [@apademide](https://github.com/apademide)! - - Report inverted comparisons such as `!(a !== b)` with `sonarjs/no-inverted-boolean-check`, and autofix negated equalities to the opposite operator; negated relations stay unfixed since inverting them changes results with `NaN`

- [`24ab536`](https://github.com/AUAUST/lib-js-engrenage/commit/24ab536d07ad9490c31e9de8e097b8104bdf6720) Thanks [@apademide](https://github.com/apademide)! - - Rename the `issue-planning` and `issue-walking` skills to `planning` and `walking`; `sync agents` moves the former skill directories and rewrites references to their former fragments, from a skill's new `formerly` frontmatter list

- [`58bd25b`](https://github.com/AUAUST/lib-js-engrenage/commit/58bd25ba734cb75ebfc31c3982cc0673c2bd867e) Thanks [@apademide](https://github.com/apademide)! - - `planning walk check` prints the tree parent first and reports the ready set, every issue actionable in turn (all of a segment's open leaves, the first open item of a sequence), before the next issue

### Patch Changes

- [`c637c49`](https://github.com/AUAUST/lib-js-engrenage/commit/c637c49eb429af6446f98e24b895d3a5e2fdab78) Thanks [@apademide](https://github.com/apademide)! - Ignore `.claude/worktrees` by default, so agent worktrees inside a checkout stay out of git, lint, format and test runs.

- [`731f745`](https://github.com/AUAUST/lib-js-engrenage/commit/731f7457897636e452f03db140f93ff00d152cdc) Thanks [@apademide](https://github.com/apademide)! - - Claim a registered repository's issue as `<repo>.<n>` with `planning issue claim`, without the `drafting` lock, and write every reference in its draft as `#{<repo>.<n>}`
  - Fail `planning issue check` on a bare `#<n>` in a draft of another repository
  - Report issues of other repositories that a publish set re-parents without claiming them

- [`c1ff71e`](https://github.com/AUAUST/lib-js-engrenage/commit/c1ff71ee8f953b7c29c5afd7c03e9bf098f14686) Thanks [@apademide](https://github.com/apademide)! - - Walk up to four independent leaves at once, each worker or debugger in its own worktree, integrating finished leaves one at a time; "pool <n>", "no pool" or "sequential" in the walk request sets the pool size

- [`eaf38f0`](https://github.com/AUAUST/lib-js-engrenage/commit/eaf38f0444a040b049140f827567ecd60b6dab7c) Thanks [@apademide](https://github.com/apademide)! - - Report a stale `Open questions` Blockers value once at dispatch, and describe registered-repository refs in `planning issue claim`

- [`064dee8`](https://github.com/AUAUST/lib-js-engrenage/commit/064dee86924e0d8da3e2decd6083c4052b7a722c) Thanks [@apademide](https://github.com/apademide)! - - Dispatch the worker, debugger, analyser, backlogger, banker and scratcher agents only when a skill or the user asks for them, and do requested work in the session otherwise

- [`1e09ca9`](https://github.com/AUAUST/lib-js-engrenage/commit/1e09ca90847cf6356e1fddcb3fa28e5b27117549) Thanks [@apademide](https://github.com/apademide)! - - Apply the published check's Blockers rule in the draft check and publish

- [`1fbe866`](https://github.com/AUAUST/lib-js-engrenage/commit/1fbe866d0bfd11246c77a15bdc4b396b2594eb8f) Thanks [@apademide](https://github.com/apademide)! - - `planning issue publish` no longer reports a `body` conflict when a claimed draft or its merge base differs from GitHub only by formatting; `planning issue claim` writes both files already formatted

- [`e27f946`](https://github.com/AUAUST/lib-js-engrenage/commit/e27f94689e5a34e8b07e1b4cbd716fc6a0e337b2) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage jscpd:new <ref>` to list by name the clones added since a git ref
  - Report in the gate only the new clones of the gate's files

- [`18b72c5`](https://github.com/AUAUST/lib-js-engrenage/commit/18b72c537900b6e024686b85d5eeb42ac20009e1) Thanks [@apademide](https://github.com/apademide)! - - Explain how to quote a manifest reference that YAML reads as a comment

- [`8eeff8a`](https://github.com/AUAUST/lib-js-engrenage/commit/8eeff8a4a942e6d537bd578788aaa3a8d33b95b2) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage planning issue release` to clear a stale `Drafting` claim

- [`d011e00`](https://github.com/AUAUST/lib-js-engrenage/commit/d011e0003e724437ec78e70ef037e0c16def3d42) Thanks [@apademide](https://github.com/apademide)! - - Record a created issue on disk before its Blockers write in `planning issue publish`, so a failed publish never creates it twice

- [`2d81de9`](https://github.com/AUAUST/lib-js-engrenage/commit/2d81de9dfab0e878761c5d7c244ec1c0df1f6843) Thanks [@apademide](https://github.com/apademide)! - - Fix `planning issue publish` failing half-way when a draft's `subIssues` takes an issue from a parent outside the set
  - Fail `planning issue publish` before any write when that parent is a Plan, naming the `planning issue claim` command

- [`d8cdf68`](https://github.com/AUAUST/lib-js-engrenage/commit/d8cdf682e09d8828aff944f8c21976665830f2a2) Thanks [@apademide](https://github.com/apademide)! - - End `planning issue publish` output with one `<stem>: published as <reference>` line per draft, after all body diffs

- [`af6aa73`](https://github.com/AUAUST/lib-js-engrenage/commit/af6aa73f06496b69168e978c65136b3dcf76c081) Thanks [@apademide](https://github.com/apademide)! - - Add the `merging` skill and its `merger` agent: walks review each concurrent leaf before integration, rebasing it when siblings landed first, and each closed segment of a sequential walk

## 0.10.0

### Minor Changes

- [`3680d89`](https://github.com/AUAUST/lib-js-engrenage/commit/3680d89599e9660e8f23cc3a8cd22b71f8faeda7) Thanks [@apademide](https://github.com/apademide)! - - Fill directives inside agent fragments from the `agents.fillers` slot before `@reference` blocks are synced, and generate whole rule files from the `agents.rules` slot; the project map now comes from these slots
  - Block directive names may contain hyphens

- [`1238a32`](https://github.com/AUAUST/lib-js-engrenage/commit/1238a32ebd15c19e26bcceaae351d9845bfc538e) Thanks [@apademide](https://github.com/apademide)! - - Add the `barrel-blocks` sync target, which fills each `// @barrel <role>` block in the `index.ts` and `entry.ts` files of every environment, keeping the hand-written lines around it, and which `sync --check` checks. A block lists the role's modules per its export contract: those of the barrel's own domain or, for a `collected` role, its public modules across the environment, where default exports sharing a file name take the camelCase of their domain path. `// @barrel domains` in an environment's root entry re-exports what the generated root entry would. An unknown role fails sync
  - Stop filling `// @barrel <glob> <mode>` blocks: name the role instead
  - Remove `syncBarrels` and the `BarrelMode` type from `@auaust/engrenage/typescript`
  - Let `syncBlocks` fillers and `FileSync.update` return a promise; `syncBlocks` now returns one

- [`4ec1db1`](https://github.com/AUAUST/lib-js-engrenage/commit/4ec1db1a0c9ceeeee76853f47ea3af523d51acc4) Thanks [@apademide](https://github.com/apademide)! - - Workers run at `low` effort by default and `medium` for `involved` or `complex` leaves; debuggers keep `medium`, `low` for `trivial` and `high` for `complex`
  - Skill agents declare their effort per `complexity` in `agent.efforts`; Codex gets one `<agent>_<effort>` profile per effort it names besides the default, replacing the fixed `_low` and `_high` profiles of gated agents

- [`9f97dd4`](https://github.com/AUAUST/lib-js-engrenage/commit/9f97dd4d5b3a317a81bb4fc3f9535dea38730bed) Thanks [@apademide](https://github.com/apademide)! - - Issue relations, Roadmap lines and header chains carry their repository: `planning issue claim` keeps the gist and sections of a Roadmap line naming `<owner>/<repo>#<n>`, header chains follow parents into other repositories, and `planning walk check` fetches each sub-issue and blocker from its own repository and names another repository's issue as `<owner>/<repo>#<n>`

- [`95787de`](https://github.com/AUAUST/lib-js-engrenage/commit/95787de8ec9f228870ac4ef6fa96c64951ed1072) Thanks [@apademide](https://github.com/apademide)! - - Replace a role's `file` callback and `fileDescription` with `file: { resolve, description }`. Upgrade: move the callback into `resolve` and its `fileDescription` into `description`

- [`02cd314`](https://github.com/AUAUST/lib-js-engrenage/commit/02cd314d96273e2f2b5437e7cf182ef816790c16) Thanks [@apademide](https://github.com/apademide)! - - Add the collects domain field: an entry re-exporting a role from every domain

- [`1261a89`](https://github.com/AUAUST/lib-js-engrenage/commit/1261a89310f80e374c2a03192118813e3eaf20c6) Thanks [@apademide](https://github.com/apademide)! - - Move the global maps extensions augment into the type-only `Engrenage` namespace: `EngrenageConfigInput`, `EngrenageSections`, `EngrenageSlots`, `EngrenageFormatters`, `EngrenagePresets`, `EngrenageEnvironments`, `EngrenageBuildTools` and `EngrenageAgentRuntimes` become `Engrenage.ConfigInput`, `Engrenage.Sections`, `Engrenage.Slots`, `Engrenage.Formatters`, `Engrenage.Presets`, `Engrenage.Environments`, `Engrenage.BuildTools` and `Engrenage.AgentRuntimes`
  - Rename the exported `EngrenageSlots` type to `ConfigSlots`
  - Allow declaration-only namespaces in the shared ESLint preset's `@typescript-eslint/no-namespace`

- [`f2a8355`](https://github.com/AUAUST/lib-js-engrenage/commit/f2a8355712211c50ae6553c165200ea8fb178efa) Thanks [@apademide](https://github.com/apademide)! - - Add the `@auaust/engrenage/extensions` entry for extension authors: `defineExtension`, the option declarers, and the extension, section, file, sync, gate and init contracts, each marked stable or experimental; experimental contracts may break in a minor release before 1.0
  - Move `loadConfig`, `loadValidatedConfig` and `LoadedConfig` from `@auaust/engrenage/config` to `@auaust/engrenage/extensions`
  - Accept nested lists in `extensions`, flattened in listed order
  - Add `root` to extensions: `engrenage sync agents` reads the agent fragments an active extension's package exports under `./agents/<kind>/*.md`
  - Add `compatibility.engrenage` to extensions: a semver range the running engrenage must satisfy

- [`9a1db32`](https://github.com/AUAUST/lib-js-engrenage/commit/9a1db32e19ae905624100a0a7a33950b17269584) Thanks [@apademide](https://github.com/apademide)! - - Export the resolved structure types from `@auaust/engrenage/extensions`, marked experimental: `ResolvedStructure`, `EnvironmentStructure`, `ResolvedRoleContract` and the types they reference, so an extension reads `await config.resolve("structure")` instead of re-deriving domains and roles
  - Deep-freeze the resolved structure: its nodes, role files, file names and roles are read-only at runtime

- [`cc50547`](https://github.com/AUAUST/lib-js-engrenage/commit/cc5054720cfe8a604149b3ec984fa2c3269ca326) Thanks [@apademide](https://github.com/apademide)! - - Add the `barrels` sync target, which writes from the project structure, with a generated header: the `entry.ts` of each public domain without `index.ts`, re-exporting its `collected` public roles; one `index.ts` per directory of each `index: true` role; and the environment's root entry unless it exists without that header, re-exporting each public domain's entry, as a namespace named after its package subpath by default, and each global `index: true` role's barrel declaring `reexport`. It deletes the barrels it generated once their domain or role disappears, and `sync --check` checks them
  - Add the domain options `reexport` (`namespace`, `flat` or both as a list: how the root entry re-exports the domain) and `public` (whether the domain is a package entry before its `entry.ts` exists; `false` fails beside an existing `entry.ts`), on `domains` entries and `.domain.json`
  - Add the role contract entry `reexport`, taken only by a global role with `index: true`: how the root entry re-exports the role's barrel; unset, it does not
  - Add the `barrels.exports` slot, through which an extension adds or renames the exports of each generated barrel (aliases, derived names); its `BarrelExport`, `BarrelExportsEntry` and `BarrelExportsResolver` contracts and `ReexportMode` are exported from `@auaust/engrenage/extensions`, marked experimental

- [`8c89769`](https://github.com/AUAUST/lib-js-engrenage/commit/8c89769226604c8c1bbb3945a0f4fca7977de832) Thanks [@apademide](https://github.com/apademide)! - - `engrenage github fetch` writes `.engrenage/github.json`: labels of every registered repository and issue types, fields and pinned fields of their organizations, with GitHub's ids; it fails first on a token missing the `repo` or `read:org` scope

- [`5314172`](https://github.com/AUAUST/lib-js-engrenage/commit/53141722f7338e06f17211987b5a26207cf8117d) Thanks [@apademide](https://github.com/apademide)! - - Let global roles import other domains' public roles with import type

- [`06593fe`](https://github.com/AUAUST/lib-js-engrenage/commit/06593fee960cd556bab856f9d37b2dcd7fea6f26) Thanks [@apademide](https://github.com/apademide)! - - Report a concise arrow on a line wider than `format.lineWidth` under `auaust/no-complex-concise-arrows`, fixed into a block body so Prettier can break the line; on nested arrows, only the outermost of the line

- [`15d1363`](https://github.com/AUAUST/lib-js-engrenage/commit/15d13636d56be8561f027e2b4173f537239430e5) Thanks [@apademide](https://github.com/apademide)! - - Add the namespace option `children: "domains"`, which classifies every child directory of the namespace as a domain without an `index.ts` or a `domains` entry; project maps mark such namespaces `[domains]`

- [`5cf1434`](https://github.com/AUAUST/lib-js-engrenage/commit/5cf1434f91fb0de87d498cdd4196339c80664e33) Thanks [@apademide](https://github.com/apademide)! - Planning drafts reference and create issues in registered repositories: `#{<repo>.<n>}` and `#{<repo>.new-<slug>}` resolve through the registry, `planning issue create --repo <repo>` drafts an issue there, `check` checks issues of registered repositories, and `publish` renders every reference relative to the issue's repository. `claim` refuses issues of other repositories.

- [`01c8443`](https://github.com/AUAUST/lib-js-engrenage/commit/01c844377ad98ded9da1606951ce38a521a02045) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage planning issue create <type>`, writing `.ai/issues/new-<slug>.draft.md` with the type's manifest (title, type, labels, pinned fields with their options as comments, `subIssues`, `blockedBy`) and its contract's body skeleton; `--parent` lists it in the parent draft's `subIssues`
  - Add `engrenage planning issue check <refs>`: a draft is checked locally for its manifest against the GitHub snapshot, its body against its type's contract, generated sections, references outside the checked drafts and cycles; an issue number is checked on GitHub as before
  - Remove `engrenage issues`: `engrenage issues check <n>` is now `engrenage planning issue check <n>`
  - Issue bodies are checked only against their declared type's contract, never a type guessed from their sections: the `gh` hook no longer checks the body of `gh issue create`

- [`afc4a15`](https://github.com/AUAUST/lib-js-engrenage/commit/afc4a158962620a63803cceaafb2a53e6a3aa885) Thanks [@apademide](https://github.com/apademide)! - - Render issue header chains at `engrenage planning issue publish` from the tree: a draft's header holds only `<sections>: <gist>`, and `claim` strips the chain
  - Fail `engrenage planning issue check` on a draft header starting with a reference, and on a listed child draft without a header line or with the placeholder left as written
  - Fail `engrenage planning issue publish` on an issue whose header line does not match its ancestors, and on a set that changes the ancestors of issues outside it
  - Write the `<sections>: <gist>` header placeholder in `engrenage planning issue create --parent` drafts of types with a header

- [`ea0055e`](https://github.com/AUAUST/lib-js-engrenage/commit/ea0055ea5a3d9c6eb625bcf7b0a3add366d982ba) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage planning issue claim <refs>`: writes `.ai/issues/<n>.md` with the manifest and body as fetched and `<n>.draft.md` with the issue's manifest and body, a Plan's **Roadmap** turned into `subIssues`, then adds `Drafting` to its Blockers
  - Add `engrenage planning issue publish <refs>`: validates the set, merges each claimed issue three-way, per manifest key and for the body, with its GitHub changes since the claim, creates new issues, sets title, body, type, labels, fields, state, sub-issues and blocked-by, renders Plan roadmaps, clears `Drafting`, prints each issue's diff and deletes its files; an interrupted publish resumes from the created issues' drafts

- [`d3fb9e0`](https://github.com/AUAUST/lib-js-engrenage/commit/d3fb9e00df573398af2f401223c7d6ac3c7ac7d3) Thanks [@apademide](https://github.com/apademide)! - - `github.protocol` maps each meaning of the issue protocol (types, fields, options, close reasons) to its GitHub name; issue checks and the walk check read names through it
  - `engrenage sync agents` generates `.claude/rules/planning-sheet.md` from `.engrenage/github.json`: registered repositories, their labels, and every type, field and option with its meaning and description; it fails on a mapped name the snapshot lacks, and without a snapshot it warns and describes each meaning's intent
  - Shared skills name protocol meanings instead of GitHub names

- [`bd92762`](https://github.com/AUAUST/lib-js-engrenage/commit/bd92762a38f8e2e3bc74287fb6ad8e67dfdc7f3f) Thanks [@apademide](https://github.com/apademide)! - The planning, debugging and analysis skills draft issues through `planning issue create`, `claim`, `check` and `publish`, with no GitHub API mechanics; the planner in consultant mode claims and publishes each update at once. `planning issue check` fails on an empty draft section. The `gh` hook checks a `.draft.md` body file like any other body file and no longer reads bodies piped from drafts.

- [`f12d1e2`](https://github.com/AUAUST/lib-js-engrenage/commit/f12d1e2f040d335e89aa1cf756410579f0886a13) Thanks [@apademide](https://github.com/apademide)! - - Rename the `openQuestions` blocker meaning to `questions`: set its GitHub option under `questions` in the issue protocol options; its default GitHub name stays `Open questions`

- [`599ad25`](https://github.com/AUAUST/lib-js-engrenage/commit/599ad2553d74de9fbd19896a5a81512eecf9faf4) Thanks [@apademide](https://github.com/apademide)! - - `--repo` and `gh` issue writes accept a repository short name: the current package and its installed same-scope dependencies register under their unscoped names, and `github.repositories` adds, replaces or drops entries

- [`27215be`](https://github.com/AUAUST/lib-js-engrenage/commit/27215bed56bd94428a65a1fb7aa119b0ead95e81) Thanks [@apademide](https://github.com/apademide)! - `subpath: true` also exposes the barrel of a public `index: true` role, as `./<role directory>` from the environment root or `<domain subpath>/<role directory>` from a public domain.

- [`bc5c7b9`](https://github.com/AUAUST/lib-js-engrenage/commit/bc5c7b986e5fc85b3c339ecb3ecb6dc24b19d523) Thanks [@apademide](https://github.com/apademide)! - - Add the companions role option: files each module of a role requires, declared as `{ resolve, description }`, reported by lint and described in the project map

- [`f80c183`](https://github.com/AUAUST/lib-js-engrenage/commit/f80c1837fd9371af28204929fceab09044e949d3) Thanks [@apademide](https://github.com/apademide)! - - A role's `exports` takes `{ values, types }` to check value and type exports apart; a string still sets both
  - The `utils` preset accepts named type exports beside its value, and the `types` preset exports no value
  - A type-only role fails at config resolution when it exports values
  - Project maps list each role's export axes

- [`615c4df`](https://github.com/AUAUST/lib-js-engrenage/commit/615c4dfa8a1675e4e416e1201fa8b804e9f0fcf2) Thanks [@apademide](https://github.com/apademide)! - - Show companions and barrel options in the project map

- [`c83eda5`](https://github.com/AUAUST/lib-js-engrenage/commit/c83eda517a2202ec4d945c0e9b8781b52ba281a2) Thanks [@apademide](https://github.com/apademide)! - - A file role's `subpath: true` exposes each of its files at a public domain's root as `<domain subpath>/<file name>`, without a `src.exports` line; it needs a public role with static `file` names or globs
  - The `constants` preset sets `subpath: true`, newly exposing `./baseline/constants`, `./format/constants`, `./package/constants` and `./roles/constants`
  - A domain's import surface lists its public file roles' modules

- [`d08a4d1`](https://github.com/AUAUST/lib-js-engrenage/commit/d08a4d1d42c82d7a0fcf4255d1a5b1a8acaa602c) Thanks [@apademide](https://github.com/apademide)! - - Expose the environment root's entry as the package root without a src.exports line

- [`303aeed`](https://github.com/AUAUST/lib-js-engrenage/commit/303aeede91ff5e55dffe550519948046c68ecec7) Thanks [@apademide](https://github.com/apademide)! - - Add index "root", generating a role's barrels at the environment root only

- [`a3eb66e`](https://github.com/AUAUST/lib-js-engrenage/commit/a3eb66e4425dd43f0d2ce4605c042b5967754376) Thanks [@apademide](https://github.com/apademide)! - - Add subpath "root", exposing a role at the environment root only, and expose root file roles with subpath

- [`9632100`](https://github.com/AUAUST/lib-js-engrenage/commit/963210054cb86edd98cdd247746bb83690cd71fa) Thanks [@apademide](https://github.com/apademide)! - - Fix the `claude` and `codex` agent runtimes and the `shopify-theme` preset typed as unknown against the published declarations
  - Export each built-in extension on its own from `@auaust/engrenage/builtins`, sub-domain extensions included
  - Add the `collected` role option, letting other domains import a role's modules inside sub-domains without going through their parent domains' surfaces; the `extension` role sets it
  - Reject an extension importing its sub-domains' extensions in the `extension-imports` rule

- [`3597574`](https://github.com/AUAUST/lib-js-engrenage/commit/359757459d70cdf783f73c7f4819ed041a1dbec6) Thanks [@apademide](https://github.com/apademide)! - - Add the `generate` sync stage, run before `write` and `check`: targets after it read the structure, aliases and source exports afresh, so one `sync` settles the files derived from generated sources
  - Resolve the structure from the staged files, so it sees files written or removed earlier in the same run
  - Add `forget` to loaded configs, dropping their resolved keys

- [`821cf2a`](https://github.com/AUAUST/lib-js-engrenage/commit/821cf2a87c508d217051ca6a862bade51165789a) Thanks [@apademide](https://github.com/apademide)! - - Test files match `.test` alone by default; a project using `.spec` files must set `tests.suffix` (`.spec` or `.{spec,test}`)

### Patch Changes

- [`e63f161`](https://github.com/AUAUST/lib-js-engrenage/commit/e63f1611dc14b4e1e79d996bac3ea79971fc83bc) Thanks [@apademide](https://github.com/apademide)! - - The analysis skill and analyser agent record each finding as the issue type it calls for: `problem` for a defect, `task` for accepted work, `idea` for work not accepted yet, `resource` for reports, specifications and references

- [`b1af76f`](https://github.com/AUAUST/lib-js-engrenage/commit/b1af76fb4a1e14cdcc980da956f0c91f140a1ce1) Thanks [@apademide](https://github.com/apademide)! - - Fix generated barrels' export order to match the export order lint

- [`9632100`](https://github.com/AUAUST/lib-js-engrenage/commit/963210054cb86edd98cdd247746bb83690cd71fa) Thanks [@apademide](https://github.com/apademide)! - - Fix barrel globs matching file names case-insensitively on case-insensitive filesystems

- [`ac5085b`](https://github.com/AUAUST/lib-js-engrenage/commit/ac5085b1639150c68b6d6086b717d78390e93644) Thanks [@apademide](https://github.com/apademide)! - - Add the `brain` commit type for agentic programming: instructions, settings and agents' records no longer go under `imp`, `docs` or `config`

- [`51d5604`](https://github.com/AUAUST/lib-js-engrenage/commit/51d56042f9e545a657450d6cdefa954e8725066d) Thanks [@apademide](https://github.com/apademide)! - - Fix collecting entries failing the import-surfaces lint, and collected roles enabled in another namespace

- [`74499d7`](https://github.com/AUAUST/lib-js-engrenage/commit/74499d7b7c7ce938b2ce786b0d70b7197bbab8a0) Thanks [@apademide](https://github.com/apademide)! - Agent skills title issues without prefix, in sentence case without trailing punctuation, and label them with the repository's labels whose description fits the issue.

- [`287e16c`](https://github.com/AUAUST/lib-js-engrenage/commit/287e16cc62f8ca5d278bacd591e77ca59ac7846b) Thanks [@apademide](https://github.com/apademide)! - - Loading the config no longer loads the GitHub issue and Git engines

- [`b78f05f`](https://github.com/AUAUST/lib-js-engrenage/commit/b78f05fc8eb305c7ce30e71f85b6e904c8ec2ca6) Thanks [@apademide](https://github.com/apademide)! - - Format every commit's staged files: `engrenage gate --everyone` runs the gate steps contributed for everyone, Prettier among them, restages their fixes and refuses partially staged files; Lefthook always installs the human command

- [`964c3d9`](https://github.com/AUAUST/lib-js-engrenage/commit/964c3d95f0e770481ebe13b586860298ab00d6a7) Thanks [@apademide](https://github.com/apademide)! - Vitest no longer collects tests from paths Git ignores, including those ignored only through `.git/info/exclude` or the global excludes file, such as agent worktrees

- [`fd4cd21`](https://github.com/AUAUST/lib-js-engrenage/commit/fd4cd21945c2c63c20647bdffc038333b32136ec) Thanks [@apademide](https://github.com/apademide)! - `engrenage planning issue claim`, `check` and `publish` accept refs space-separated as well as comma-separated.

- [`7bf3141`](https://github.com/AUAUST/lib-js-engrenage/commit/7bf3141771e27dfa7b0aa175067f3e7a043ef87f) Thanks [@apademide](https://github.com/apademide)! - - `planning issue create` takes a type's meaning or its GitHub name, in any case

- [`a87edd9`](https://github.com/AUAUST/lib-js-engrenage/commit/a87edd91d1a27c2747a15831ad0b4a8c30c78e0d) Thanks [@apademide](https://github.com/apademide)! - Init no longer fails with `ERR_PNPM_IGNORED_BUILDS` after adding lefthook: the workspace settings now deny lefthook's build script, whose hook install the lefthook step runs itself.

- [`49b063b`](https://github.com/AUAUST/lib-js-engrenage/commit/49b063b6d2edde85eff901f33327e81ca1bfacc4) Thanks [@apademide](https://github.com/apademide)! - - Fix generated `lefthook.yml` leaving a dangling YAML anchor when a condition is shared between commands

- [`750792b`](https://github.com/AUAUST/lib-js-engrenage/commit/750792b52979090f26335ec2a9d34bfa7767914f) Thanks [@apademide](https://github.com/apademide)! - The generated `.gitignore` no longer lists `.eslintcache`

- [`554d7b7`](https://github.com/AUAUST/lib-js-engrenage/commit/554d7b7317338a131bd8f74f1643034f90f636f7) Thanks [@apademide](https://github.com/apademide)! - - Reach GitHub through Octokit in `engrenage issues check` and the agent hooks, bundled into `dist`, so installs are unchanged. A failed request now names its method and URL along with GitHub's message

- [`10f5700`](https://github.com/AUAUST/lib-js-engrenage/commit/10f57005b64d55fae9c380647e3297c8a0ed140a) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage planning walk check <n>`, reporting a whole issue tree in walk order and its next actionable issue in one run

- [`f047f44`](https://github.com/AUAUST/lib-js-engrenage/commit/f047f44adb94d694e0cf9e21af48da213c2ccece) Thanks [@apademide](https://github.com/apademide)! - - Sharded test jobs of the generated workflows run to completion, so one CI run reports every failing shard

- [`a0356ba`](https://github.com/AUAUST/lib-js-engrenage/commit/a0356ba1dd828a9b68a3bd23ce9e160ebc766de5) Thanks [@apademide](https://github.com/apademide)! - - Fix a role barrel deleted by sync still listed in its domain's entry until the next sync

- [`2ea0c36`](https://github.com/AUAUST/lib-js-engrenage/commit/2ea0c36debecfb696eeda551ccaf21ef01926c93) Thanks [@apademide](https://github.com/apademide)! - - Add the `state` file resource, locating the `.engrenage/` directory that holds engrenage's project state

- [`0309554`](https://github.com/AUAUST/lib-js-engrenage/commit/0309554e72eeb0b7ed1107d61c3289dc10c0dda9) Thanks [@apademide](https://github.com/apademide)! - `engrenage structure` draws each environment as the project map's box-drawing tree, adding each node's kind, role, effects and classification source.

- [`d9b1ecb`](https://github.com/AUAUST/lib-js-engrenage/commit/d9b1ecbb2863c4bf4d88c9ac8007ea31046a1393) Thanks [@apademide](https://github.com/apademide)! - A failing sync check, such as `publishing`, no longer discards the files `engrenage sync` writes: sync writes them, reports every failed check and exits with code 1.

- [`688762b`](https://github.com/AUAUST/lib-js-engrenage/commit/688762b76e347630e37ccd28c06c269ee673874c) Thanks [@apademide](https://github.com/apademide)! - Tool commands print their status and success messages on stderr, so machine-readable output like `engrenage eslint --format json` stays parseable

- [`2654f21`](https://github.com/AUAUST/lib-js-engrenage/commit/2654f21c6579b80d2a28e17487a65b0781184c69) Thanks [@apademide](https://github.com/apademide)! - - Bundle the manifest's `inlinedDependencies` by default in `defineTsdownConfig`

## 0.9.0

### Minor Changes

- [`1b41ec7`](https://github.com/AUAUST/lib-js-engrenage/commit/1b41ec79e25d34b49fefaf703ffc168c06586a32) Thanks [@apademide](https://github.com/apademide)! - - Run the library workflows' check, test and build as parallel jobs; the publish workflow releases in a final job that waits for all three and reuses the build job's output. Upgrade: run `engrenage sync` to regenerate the workflows, and update any required status checks to the new job names.
  - Add the `github.testShards` option, splitting the tests into that many parallel CI jobs through Vitest's `--shard`
  - Fix the publish step looking up a private package anonymously, which made changesets retry the published version on every push to the base branch: the release step now receives `NPM_READ_TOKEN`
  - Serialize the publish workflow runs of a branch

### Patch Changes

- [`f1078f9`](https://github.com/AUAUST/lib-js-engrenage/commit/f1078f997bba248d6617f1019504ea0f974279b8) Thanks [@apademide](https://github.com/apademide)! - - Speed up every `engrenage` run, the gate's checks included, by caching compiled modules through Node's compile cache

- [`96241d0`](https://github.com/AUAUST/lib-js-engrenage/commit/96241d0e8e359b5f78add8edc5f8eeaf7ed29a9c) Thanks [@apademide](https://github.com/apademide)! - - Speed up the gate: `typecheck`, `structure --check` and `sync --check` run in the gate's process instead of a new `engrenage` process each, so only `tsc` is spawned; `sync --check` runs on its own copy of the config, so its staged files never reach the other checks

## 0.8.0

### Minor Changes

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Replace the `agents.budgets` keys `plan`, `block` and `task` with `goal`, `context`, `doneWhen`, `comment`, `backlogEntry` and `debtEntry`, beside a `warn | deny` mode. Upgrade: rename the keys you set.
  - **Breaking**: Remove the `edit` hooks and commands; `engrenage sync` drops them from `.claude/settings.json` and `.codex/hooks.json` and removes stale engrenage hooks, leaving the project's own. Upgrade: run `engrenage sync`.
  - Add `engrenage gate [--staged | --worktree]`, fixing and checking the changed files (ESLint, Prettier, types, structure, sync, related tests, `agents.gate.commands`) and warning on over-budget backlog or debt entries; the `agents.gate` option; and the lefthook init step with `engrenage sync lefthook`, running the gate before agent commits
  - Add `engrenage issues check <number>`, checking an issue against the issue contract; untyped bodies with neither **Goal** nor **Steps** get no structure check
  - Add `engrenage agents claude|codex hook github`, checking every `gh issue create|edit|comment` of a shell command, bodies piped from `.draft.md` files included, against the issue contract and the **Goal**, **Context** and **Done when** budgets
  - Add `engrenage agents claude hook dispatch`, denying `worker` or `debugger` dispatches whose issue is not ready
  - Add `engrenage agents claude hook git` and matching settings rules, denying `--no-verify`, `LEFTHOOK=0` and `core.hooksPath` bypasses of the commit gate
  - Add `gate: true` to skill `agent:` blocks, syncing a `Stop` hook that sends a subagent back once with the gate's failures
  - Exit hook commands with code 2 and a message when they cannot load the CLI
  - Add `effort` to skill `agent:` blocks and the `agents.subagentCacheTtl` option (`1h`, synced into `subagentPromptCacheTtl`), and fit each shipped agent's model and effort to its role
  - Generate a project map overview in `.claude/rules/project-map.md` and one map per environment, loaded only for its files, pointed to by the default `structure` AGENTS.md section
  - Add the `writing` AGENTS.md section, on by default, with density, structure and length rules for everything agents write
  - Add the `issue-walking` skill, walking a planned issue tree and dispatching each task to a worker before reviewing and committing it
  - Write plans as indexes and tasks as deltas naming their ancestors, with nested plans bounding what workers read
  - Draft planner and debugger issue edits in `.ai/issues/` and publish them in one flush, weigh user requests in the decision protocol, and dispatch Complexity `Trivial` issues at low effort
  - Remove links to engrenage repository documents from the shared skills

- [`86bd0b3`](https://github.com/AUAUST/lib-js-engrenage/commit/86bd0b30b1621dd1e45ff6d8600de82ec64681dc) Thanks [@apademide](https://github.com/apademide)! - - Name `default` barrel exports after their directories below the glob's static base when every matched module shares one file name

- [`690f393`](https://github.com/AUAUST/lib-js-engrenage/commit/690f393ab79fc09397aa1156c22fdcdf73bea2a1) Thanks [@apademide](https://github.com/apademide)! - - Select the build tool (`build.tool`), the formatter (`format.formatter`) and the preset (`preset`) among the engines extensions contribute; `false` selects none, and an unset `build.tool` or `format.formatter` selects the only active engine
  - Let a preset contribute option values by input path, replacing the defaults of those options; the config's own input wins
  - Check `agents.preferred` against the agent runtimes extensions contribute
  - Pass the loaded config to a `Formatter`, and to `formatContent` and `formatFile`, instead of the project root
  - Resolve `preset` to the selected preset entry, or `false`

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Write the GitHub workflows at the repository root, with the project directory as `working-directory`. Upgrade: run `engrenage sync`, then delete workflows left in a nested project's `.github/`.
  - Write `preset` from `engrenage init`, except for the `other` project type
  - Start commands without loading the config modules, and load the ESLint engine only when the VS Code sync reads its info rules: hooks that never read the config start in about 0.1s instead of 1.1s
  - Stop shipping `.d.mts` declarations for bin entries

- [`07a0471`](https://github.com/AUAUST/lib-js-engrenage/commit/07a0471c1d914ad19f26ab37e57f25bae7f49606) Thanks [@apademide](https://github.com/apademide)! - - Give every `commands` environment, `bin` included, the `index`, `executable`, `commands` and `actions` roles; a listed role of the same name replaces the layout's
  - Accept `roles` on `bin`
  - Fail `structure --check` on a module beside the command group of its name
  - Check command modules against the `commands` role's default export

- [`738d5e1`](https://github.com/AUAUST/lib-js-engrenage/commit/738d5e1f4becc50af6371119fd4bcd6b78308511) Thanks [@apademide](https://github.com/apademide)! - - Report functions above a cognitive complexity of 20 (`sonarjs/cognitive-complexity`) or longer than 125 lines (`max-lines-per-function`), and modules longer than 300 lines (`max-lines`), blank lines and comments excluded and test files exempt from the line limits, as the `stylistic` conventions `cognitiveComplexity`, `functionLines` and `fileLines`. Upgrade: refactor the reported code, raise the limits, or disable the conventions.
  - Report functions with identical implementations (`sonarjs/no-identical-functions`) as the `stylistic` convention `noIdenticalFunctions`.
  - Add the `format.maxCognitiveComplexity`, `format.maxFunctionLines` and `format.maxFileLines` options.

- [`49c8d22`](https://github.com/AUAUST/lib-js-engrenage/commit/49c8d224c03a163a9eb953682be9c48d491b1d61) Thanks [@apademide](https://github.com/apademide)! - `config.resolve` reads a section by its key (`config.resolve("git")`), typed by the global `EngrenageSections`; extensions declare their keys in `owns.keys`.

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Pass `loadConfig` and the callbacks of `defineEslintConfig`, `defineViteConfig`, `defineTsdownConfig`, `defineVitestConfig` and `definePrettierConfig` a `LoadedConfig` read section by section, instead of the flat config. Upgrade: replace each `config.<key>` with `await config.resolve(<key>Section)`, imported from `@auaust/engrenage` (`sourceSection`, `buildSection`, `gitSection`…); read `src.exports` through `sourceExportsSection`, `typescript.tsconfig.path` through `tsconfigPathSection` and `build.outDir` through `buildOutDirSection`.
  - **Breaking**: Stop validating in `loadConfig` and replace `validateConfig` with `loadValidatedConfig(cwd?, options?)`, which validates once and reports every failing section and unknown top-level key. Upgrade: call `loadValidatedConfig` where the config must be valid.
  - **Breaking**: Limit `@auaust/engrenage/config` to `defineConfig`, `define`, `loadConfig`, `loadValidatedConfig`, `ConfigInput`, `LoadedConfig` and `Resolvable`. Upgrade: rename the `Config` type to `ConfigInput` and the value-or-function helper to `Resolvable`; import `ResolvedAgents`, `ResolvedGit`, `ResolvedGithub`, `ResolvedPrettier` and `ResolvedVscode` from their tool entries and `PackageJson` from `@auaust/engrenage/package`; drop `createContext`, `ResolvedConfig`, `InlineRole`, `sourceTestsVariant` and `distTestsVariant`.
  - **Breaking**: Move `root`, `filesystem` and `configFile` to `config.context` and remove `raw` from `LoadedConfig` and the ESLint convention config. Upgrade: `resolve(...paths)` becomes `config.context.path(...paths)`, `cacheFor(name)` becomes `(await config.resolve(cacheSection)).for(name)`.
  - **Breaking**: Make `createEslintConfig`, `createPrettierConfig`, `createTsdownConfig`, `createViteConfig` and `createVitestConfig` async, taking the `LoadedConfig` first. Upgrade: `await createViteConfig(config, …)`.
  - **Breaking**: Make `formatFile` and every file read, write, glob and process of config loading, `init`, `sync` and the CLI async, and the `gitignore`, `prettierignore` and per-environment `tsconfig.path` fields promise-valued. Upgrade: `await` them.
  - **Breaking**: Reject a config file whose default export is neither an object nor a function returning one. Upgrade: export the config object or its function.
  - Load the config once per project root, shared by the CLI and the definers; `loadConfig.refresh(root)` reloads `engrenage.config.ts`
  - Declare every option's default, shown as `@default` in the generated JSDoc and filled in the loaded config; fail `src.apis` and `inherits` conflicts when their section is read
  - Add the `format` section (`indent`, `indentWidth`, `lineWidth`, `quotes`, `semicolons`, `trailingCommas`, `endOfLine`), defaulting to the former fixed conventions
  - Resolve the `github.workflows` and `tests.dist.tsconfig` defaults in the config, with `ResolvedGithub.workflowsConfigured` and `ResolvedBuild.configuredOutDir` exposing what was set

- [`44efb48`](https://github.com/AUAUST/lib-js-engrenage/commit/44efb4851a0dc5b9f282f8b36915c0c9ce5c9218) Thanks [@apademide](https://github.com/apademide)! - - Breaking: `config.resolve` takes config keys only, and `@auaust/engrenage` no longer exports sections; a section no longer carries a `name`

- [`c4ac9d9`](https://github.com/AUAUST/lib-js-engrenage/commit/c4ac9d91773b7174cc1cb2e6e23b8483773a987b) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Ship effect levels for Node built-ins only; third-party imports such as `typescript`, `eslint` or `c12` are now unranked and never reported. Upgrade: rank the packages you rely on through `structure.effects.modules`

- [`cf67edc`](https://github.com/AUAUST/lib-js-engrenage/commit/cf67edc98a61b7da648af5699aeb149281c2c157) Thanks [@apademide](https://github.com/apademide)! - - Give contributed environments aliases, located entities, generated and discovered files, published or private code (`code`), project-map root files and ESLint scopes (`files.<name>`, `dir.<name>`)
  - Rename the resolved `tooling.files` to `tooling.rootFiles`
  - Keep the directories an environment's `dirs` adjustment prepends or appends out of every other environment's default `dirs`
  - Detect a workspace entry with any extension of a `modules` language, and target the `typescript` language's extensions in ESLint's TypeScript-only import rules

- [`3c87fe1`](https://github.com/AUAUST/lib-js-engrenage/commit/3c87fe1572c5de39eca0fc745d62424c8cf14742) Thanks [@apademide](https://github.com/apademide)! - - Let extensions contribute environments (`environments`) with their level, structure, import grants, tsconfig and owned directories; the project maps, import boundaries and tsconfigs list every active environment in registration order
  - Make `tooling` an import category that only `tests` imports, so `src`, `bin` and `scripts` now fail on importing tooling files
  - Keep the directories an environment owns or lists in `dirs` out of every other environment's default `dirs`
  - Mark the data environment inactive when none of its directories exists
  - Add `input(key)` to the config resolver, reading a key's validated input without resolving it

- [`0c0cee9`](https://github.com/AUAUST/lib-js-engrenage/commit/0c0cee96d18525b400562a37b7387c3ef89a2a43) Thanks [@apademide](https://github.com/apademide)! - - Run `engrenage eslint`, `eslint:fix` and `eslint:suppress` without a cache, which kept type-aware rules passing after imported types changed; pass `--cache` to opt back in
  - Drop the redundant `--no-cache` from the generated `ci:check` script

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Remove `eslint.boundaries` and the `eslint-plugin-boundaries` dependency; `auaust/import-environments`, `auaust/import-tests`, `auaust/import-data`, `auaust/import-workspaces`, `auaust/import-layers` and `auaust/import-surfaces` decide from the structure. Upgrade: drop `eslint.boundaries`, and switch a structure rule off through the ESLint `structure` option (`structure: { importLayers: false }`).
  - **Breaking**: Add `auaust/import-specifiers`, reporting relative specifiers an alias covers, self-imports and paths missing from the structure map, in place of `import-x/no-self-import` and `import-x/no-useless-path-segments`. Upgrade: import through the `#…` aliases.
  - **Breaking**: Forbid tests importing an environment's root file, and check each test variant's imports: `x.test.ts` and `x.test.dist.ts` import public specifiers, `x.test.src.ts` internals. Upgrade: import the public entry, or rename the test `.src`.
  - **Breaking**: Replace `no-default-export`, `no-internal-imports-in-public-tests` and `no-package-imports-in-source-tests` with the structure rules, and `typesDeclarations` with `typeOnlyRoles`. Upgrade: rename those rules in your overrides.
  - **Breaking**: Make a `Convention` declare the `sections` it reads, its `rule` and `delegates` receiving them with the config context, and rename its `presets` option `traits`. Upgrade: declare `sections` and read them instead of the flat config.
  - **Breaking**: Make `Delegate` describe the upstream rule and its options instead of holding the resolved rule. Upgrade: pass the rule's name and options.
  - **Breaking**: Remove `StructureLocation` from `@auaust/engrenage/eslint`. Upgrade: use `Entity`.
  - Add `defineRoleRule`, role rule modules (`roles/<role>/<key>`) receiving the file's `Entity` and its environment's file names
  - Add the `importEffects` convention, following each runtime binding through re-exports to check it against the effect levels
  - Report runtime imports from global type-only roles in `auaust/import-surfaces` and `auaust/import-layers`, whose messages name the broken relation and its fix
  - Lint import boundaries several times faster, leaving `import-x/namespace` to the TypeScript checker on TypeScript files

- [`efd54fe`](https://github.com/AUAUST/lib-js-engrenage/commit/efd54fef79361de1644108895f700449e6b26d41) Thanks [@apademide](https://github.com/apademide)! - - Remove the `@stylistic` ESLint plugin, its dependency and the `StylisticRules` type: Prettier owns layout, so configure or disable `@stylistic/*` rules by registering `@stylistic/eslint-plugin` yourself

- [`6444116`](https://github.com/AUAUST/lib-js-engrenage/commit/6444116275fa53ac89b442c49cdd017dcbc14460) Thanks [@apademide](https://github.com/apademide)! - Add the `extensions` config key, listing extensions to register beside the built-ins, and the `@auaust/engrenage/builtins` entry, listing every built-in extension.

- [`74f0a74`](https://github.com/AUAUST/lib-js-engrenage/commit/74f0a745bf86dc0ef12caa32897d152ae400b3b3) Thanks [@apademide](https://github.com/apademide)! - - Let extensions contribute gate steps (`gate.steps`) to the `fixes`, `checks`, `commands` and `warnings` stages; the built-in steps run only while their extension is active, so the gate runs no ESLint, Prettier, Vitest or jscpd step and no `typecheck` when that tool is not installed
  - Activate the Prettier extension only when Prettier is installed: without it, no formatter is selected, sync leaves `.prettierignore` alone and the `prettier` key is refused

- [`39f0521`](https://github.com/AUAUST/lib-js-engrenage/commit/39f0521f3b5471f0ae28f94cf5f2b6c07a19b215) Thanks [@apademide](https://github.com/apademide)! - - Activate an extension declaring `when: { installed }` only while the project depends on that package; `config.resolve` refuses its keys while it is inactive, and its config input still validates

- [`eb26798`](https://github.com/AUAUST/lib-js-engrenage/commit/eb2679824b65ae07a074f259fb38a6d1861140a2) Thanks [@apademide](https://github.com/apademide)! - - Let extensions contribute languages (`languages`) with their file extensions; import cycles follow every language marked `modules`, and aliases target the `typescript` language's first extension

- [`edeee8c`](https://github.com/AUAUST/lib-js-engrenage/commit/edeee8c3af9e10f51ec128332e694309de05e0ee) Thanks [@apademide](https://github.com/apademide)! - - Add the observing effect level between confined and effectful.
  - Rank external imports by export name using shipped Node and dependency levels and configurable symbol overrides.

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Replace `presets: ["library"]` with `preset: "library"` (at most one) and `traits: { enable, disable }`; the `library` preset bundles the `published` trait, which drives the published `package.json` fields, the library tsconfig, dist-mode tests, the library workflows and the library lint conventions. Upgrade: `presets: ["library"]` becomes `preset: "library"`.
  - **Breaking**: Replace `tests.files` with `tests.location`, `tests.suffix` and `tests.extension`. Upgrade: split the glob into those three options.
  - **Breaking**: Replace `tests.layout` with the boolean `tests.mirror` (default `false`). Upgrade: `layout: "mirror"` becomes `mirror: true`.
  - **Breaking**: Rename `bin.layout` and `scripts.layout` to `tree` (default `commands`: the environment root and every non-role directory are command groups, their modules subcommands named after their file), and `bin.commands` to `bin.entries`. Upgrade: rename the keys.
  - **Breaking**: Replace `build.emptyOutDir` with `build.clean`: `"all"`, `"emitted"` (only the files the previous build emitted) or `false`. Upgrade: `emptyOutDir: true` becomes `clean: "all"`.
  - **Breaking**: Remove the `public` domain option. Upgrade: give each public domain an `entry.ts`.
  - Reject each removed key with a message naming its replacement
  - Add `typescript.verbatimModuleSyntax` (default `true`); `false` is written into the base tsconfig, resolves every role `typeOnly: false` and turns the type import convention off, and a contradicting `compilerOptions.verbatimModuleSyntax` fails
  - Add `setupFiles` to the tests environment, defaulting to the `setup.ts` of the tests root

- [`d16d662`](https://github.com/AUAUST/lib-js-engrenage/commit/d16d662176fb5656fb2ba72a01ca73690f230895) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Replace `parseMajorVersion` with `parseVersion` in `@auaust/engrenage/package`, yielding a `Version` with major, minor and patch. Upgrade: read `parseVersion(specifier)?.major`.
  - Fail `engrenage sync` on a pnpm specifier without a version instead of accepting it as within engrenage's range

- [`6744dd3`](https://github.com/AUAUST/lib-js-engrenage/commit/6744dd305f8db5e27acbe46e6aa6023fe292dfeb) Thanks [@apademide](https://github.com/apademide)! - - Replace `auaust/no-dynamic-import` with `auaust/no-pointless-dynamic-import`, which reports `import()` of a module the file already imports statically
  - Check `import()` in `auaust/import-effects`

- [`1ec3f9a`](https://github.com/AUAUST/lib-js-engrenage/commit/1ec3f9ab069b46914dd0e0a84c5ad0b171112106) Thanks [@apademide](https://github.com/apademide)! - - Keep assigned values beside `=` and `:` in Prettier output: break a destructuring pattern or type annotation first, keep a conditional's test beside the operator, wrap a logical or arithmetic value in parentheses, give a union leading pipes, and let a single value overflow
  - **Breaking:** raise the `prettier` peer range to `^3.9.0`

- [`14e318a`](https://github.com/AUAUST/lib-js-engrenage/commit/14e318a680c00d40c255e21fb0bdbff4c7b40da4) Thanks [@apademide](https://github.com/apademide)! - - Prettier now owns multiline declaration and expression padding, case padding and object brace newlines, through a layout plugin `createPrettierConfig` appends after every other plugin; padding now also follows lines Prettier wraps
  - **Breaking:** removed the `stylistic.paddedMultilineDeclarations`, `stylistic.paddedMultilineExpressions`, `stylistic.paddedCases` and `stylistic.objectCurlyNewline` ESLint toggles

- [`bce74dc`](https://github.com/AUAUST/lib-js-engrenage/commit/bce74dcf651189be5043ec66a39dcfd1735125df) Thanks [@apademide](https://github.com/apademide)! - - **Breaking:** removed the `stylistic.unpaddedSwitches` ESLint toggle; Prettier already strips blank lines at a switch's edges
  - Prettier's `quoteProps` is now `"consistent"`, replacing the `@stylistic/quote-props` ESLint convention; `@stylistic/arrow-parens` is dropped too

- [`52e4dd0`](https://github.com/AUAUST/lib-js-engrenage/commit/52e4dd08b4ced5962511888469afb49fee0156ab) Thanks [@apademide](https://github.com/apademide)! - - Wrap a breaking logical or arithmetic expression in parentheses in Prettier output as a conditional branch, and as an assigned value whose operand breaks, instead of breaking it bare

- [`3c3e5d4`](https://github.com/AUAUST/lib-js-engrenage/commit/3c3e5d403070399aa13ec0b938291a717c31b1f3) Thanks [@apademide](https://github.com/apademide)! - - Prettier now owns statement padding around returns, throws, awaits, yields, breaks, continues, blocks, variable declarations, imports and exports, and the grouping of function overloads, through its layout plugin
  - **Breaking:** removed the `stylistic.paddedReturns`, `stylistic.paddedThrows`, `stylistic.paddedAwaits`, `stylistic.paddedYields`, `stylistic.paddedBreaks`, `stylistic.paddedContinues`, `stylistic.paddedBlocks`, `stylistic.paddedVariableDeclarations`, `stylistic.groupedOverloads`, `imports.paddedImports` and `imports.paddedExports` ESLint toggles

- [`2ebdfc9`](https://github.com/AUAUST/lib-js-engrenage/commit/2ebdfc9b875e15fd220c57aee5426e310a756f4c) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Remove `importRulesSection` from the root entry.
  - State the boundary checks' import grants in project maps.

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Remove `loadConfig`, `loadValidatedConfig`, `LoadedConfig`, `PackageType` and `PublishAccess` from the root entry, which exports the config section values and shared path and sync types. Upgrade: import the loaders from `@auaust/engrenage/config` and `PackageType` and `PublishAccess` from `@auaust/engrenage/package`.
  - **Breaking**: Move `syncBlocks`, `syncFiles` and `syncIgnoreFile` to `@auaust/engrenage/blocks/internals`, `filesIn` to `@auaust/engrenage/filesystem/internals` and `validate` to `@auaust/engrenage/options/internals`, with no stability guarantee. Upgrade: import them from there, or stop depending on them.
  - Derive package entries from the public domains, adding `format`, `package`, `baseline` and `roles`; tools format through the `Formatter` port
  - Add `structure.internals` and `<environment>.domains.<path>.internals`, exposing a domain's `index.ts` under `<subpath>/internals` with no stability guarantee
  - Add `definePrettierConfig` to `@auaust/engrenage/prettier`, mapping the `format` section with the project's plugins and overrides; the default export stays the defaults-only config, and `engrenage init` writes `prettier.config.ts` only for custom rules
  - Build entries to `dist/<specifier>.mjs`, public specifiers unchanged

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Make `@auaust/engrenage` private and `UNLICENSED`, so every install needs an npm account of the `@auaust` organization. Upgrade: complete steps 2–5 of [#199 §Manual steps](https://github.com/AUAUST/lib-js-engrenage/issues/199#manual-steps-outside-the-repository) (read token, GitHub secrets, hand-written workflows, other install environments) before upgrading.
  - **Breaking**: Install with the `NPM_READ_TOKEN` secret in the synced library workflows (`registry-url` on `actions/setup-node`, `NODE_AUTH_TOKEN` on the install step only), publishing staying tokenless OIDC. Upgrade: give every consumer repository `NPM_READ_TOKEN` before its CI runs the upgraded workflows.
  - **Breaking**: Resolve a published project with neither `visibility` nor `publishConfig.access` as `private`. Upgrade: set `visibility: "public"` to keep publishing publicly, and rename unscoped private packages under a scope.
  - **Breaking**: Add the `publishing` sync target, failing `engrenage sync` and `sync --check` on a configuration that could publish a private package publicly: `"private": true` on a published root, a `publishConfig.access` or changesets `access` off the visibility, an unscoped or provenance-enabled private package, or credentials in a project `.npmrc`. Upgrade: fix what it lists.
  - Add the top-level `visibility` option (`public` or `private`), falling back to `publishConfig.access`, then `private`; `engrenage init` asks it and derives the license from it
  - Sync `publishConfig.access` from the visibility at the root and in every workspace of a published project, `"private": true` at the root of an unpublished one, and the changesets `access`
  - Add the `workspaces` option (globs, a package name pattern such as `@scope/app-{dir}`, tsconfig options), syncing `pnpm-workspace.yaml#packages` and each workspace's managed `package.json` keys and `tsconfig.json`, included by tsdown, Vitest, ESLint and the base tsconfig, a workspace importing another only as a declared dependency
  - Test libraries' built package through public specifiers in dist mode, failing on any resolution into the sources; skip the managed `tsconfig.tests.dist.json` without the `published` trait

- [`9ccc700`](https://github.com/AUAUST/lib-js-engrenage/commit/9ccc70059afab12c9ece28216f5e59eea8d98fb2) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Stop generating `#src/*` beside source namespace aliases and root index or entry file aliases such as `#entry`; import through namespace aliases.

- [`fcb7767`](https://github.com/AUAUST/lib-js-engrenage/commit/fcb7767b930a79ed5ff8a4c8e616d2625ca919e7) Thanks [@apademide](https://github.com/apademide)! - - Derive `.gitignore`, `.prettierignore`, ESLint's ignores and `files.generated` from file resources, so a custom `cache.dir` and an extension's uncommitted files are ignored
  - Remove `createProjectIgnores` from `@auaust/engrenage/git`, and `lockfileIgnores`, `eslintIgnores` and `changelogIgnores` from `@auaust/engrenage/prettier/constants`
  - Fail `defineEslintConfig` on an unreadable tsconfig instead of leaving the build output unignored

- [`802855e`](https://github.com/AUAUST/lib-js-engrenage/commit/802855eefe8d54f4715b1e300b286535fa6adb2b) Thanks [@apademide](https://github.com/apademide)! - - Let extensions contribute role presets (`roles`) with the subpath exporting them, their environments and needed traits; `engrenage init` renders the generated config's role imports and lists from them
  - Make role rule modules tool-agnostic `{ tool, rule }` modules, so ESLint applies only `tool: "eslint"` ones; a raw rule module (`{ create }`) is now rejected: wrap it with `defineRoleRule` from `@auaust/engrenage/eslint`
  - Ship the `extension` role preset, carrying its `extension-imports` rule, from `@auaust/engrenage/eslint/roles`, which loads without ESLint

- [`bc36ac8`](https://github.com/AUAUST/lib-js-engrenage/commit/bc36ac8fa0a7791fcce6ac338e3cd673f9b2a33d) Thanks [@apademide](https://github.com/apademide)! - - Build a bin directory's entry from its `executable.ts` instead of its `index.ts`
  - Show every option of a root command in `engrenage help <name>`
  - Stop claiming an ESLint cache in the `eslint` command's description

- [`42f3b8a`](https://github.com/AUAUST/lib-js-engrenage/commit/42f3b8a0c537b79ddcf6d1811b253abb1ba72183) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Remove the `EntryValidator`, `ValidationResult` and `ValidationIssue` types; slot `entry` validators are typed by `StandardSchemaV1` from `@standard-schema/spec`. Upgrade: import `StandardSchemaV1` from `@standard-schema/spec` instead.

- [`9ec9d89`](https://github.com/AUAUST/lib-js-engrenage/commit/9ec9d897097178cbf7a5d7b9226d6aba1476599c) Thanks [@apademide](https://github.com/apademide)! - - Read `.namespace.json` and `.domain.json` beside structure directories as namespace and domain declarations, merged with the config's `structure`; nodes they alone declare resolve with source `metadata`
  - Let a domain's own declaration override only the fields it sets of a matching domain glob

- [`cfb7090`](https://github.com/AUAUST/lib-js-engrenage/commit/cfb70908de0e019feba5716e37bf4ad170390c10) Thanks [@apademide](https://github.com/apademide)! - - Ship JSON Schemas for `.namespace.json` and `.domain.json` under `@auaust/engrenage/schemas/*.json`
  - Map both metadata files to their schemas in `.vscode/settings.json` `json.schemas`

- [`7173743`](https://github.com/AUAUST/lib-js-engrenage/commit/7173743daba8a268ecf0573279822db925829916) Thanks [@apademide](https://github.com/apademide)! - - **Breaking**: Give each environment only the roles it lists in `roles`, built from presets (`src: { roles: [index(), entry(), utils({ nesting: 1 })] }`). Upgrade: add the `roles` of `src`, `tests`, `scripts` and `tooling` to `engrenage.config.ts`, with `entry()` when published; `engrenage init` writes them for new projects.
  - **Breaking**: Make a domain public by its `entry.ts` (the renamable `entry` role), which re-exports the public subset of its `index.ts`; the root package entry is `src/entry.ts`. Upgrade: move each public domain's exports into an `entry.ts`.
  - **Breaking**: Scope ESLint, `prettier:all` and the `tooling` environment to the declared environments instead of `**`, `tooling` defaulting to the root config files and `tooling/`. Upgrade: declare any other directory to keep it checked.
  - Describe the structure per environment (`namespaces`, `domains`, `optOut`, `strictness`), exposed as `structureSection` with its import rules as `importRulesSection`
  - Add the `@auaust/engrenage/roles` entry with `createRolePreset` and the presets `index`, `entry`, `constants`, `declarations`, `types`, `utils`, `errors`, `enums`, `ports`, `adapters`, `fixtures`, `setup`, `schemas`, `components`, `hooks`, `contexts`, `pages` and `styles`, each call overriding any default (nested `roles`, `aliases`, the `constants` and `index` file names)
  - Add the role field `effects` and `structure.effects` (`levels`, `modules`, `fallback`): a ranked module imports at runtime only from roles and modules of its level or purer (`pure`, `confined`, `effectful`); `utils/` is confined and may import other domains' `utils/` through their `index.ts`
  - Add the role field `typeOnly` (on for `types` and `ports`): such modules declare no runtime value and import anything their domain may, type-only
  - Add the role property `rules`: ESLint rule entries applied to the role's own files
  - Add the role options `strict`, `required` and `unique`: only the files nested roles name at the role's root, at least one, at most one file per owning location
  - Classify files at a role's root that a nested role's `file` globs match with that nested role, `file` accepting a callback over the owning location and `fileDescription` for maps
  - Treat a file named like the index file as an ordinary module in a role with `index` off
  - Make `constants` a public role peers and lower layers may import
  - Let `tooling` import `src` like `scripts` does, never `bin`, `scripts`, `data/` or `tests`
  - Add `aliases`, `src.aliases` and `src.bundled`; `engrenage sync aliases` generates `package.json#imports` and the bundled tsconfig `paths`, and `src.bundled` sets the src tsconfig `module` and `moduleResolution`
  - Add `engrenage structure`, printing each directory's classification, each role's effect level and runtime import cycles; `--check` fails on unclassified directories of strict environments, cycles and broken `required` or `unique` roles, type-only imports never counting toward a cycle
  - Fix tests mirror directories read as the role their name matches

- [`001dbcf`](https://github.com/AUAUST/lib-js-engrenage/commit/001dbcf98e4979132d37f9265f84501fb070e5f4) Thanks [@apademide](https://github.com/apademide)! - - Declare each environment's structure as one nested tree under `<environment>.structure`, replacing the flat `namespaces` and `domains` records keyed by path: the root namespace takes `layers`, `relation`, `purpose` and `roles`, and every namespace and domain nests its children under `namespaces` and `domains`, keyed by directory name or, for domains, a one-segment glob
  
    ```ts
    // Before
    src: {
      namespaces: { ".": { layers: ["core", "*"] }, core: { purpose: "Core." } },
      domains: { "core/model": { purpose: "The model." } },
    }
  
    // After
    src: {
      structure: {
        layers: ["core", "*"],
        namespaces: {
          core: { purpose: "Core.", domains: { model: { purpose: "The model." } } },
        },
      },
    }
    ```

- [`aa29d40`](https://github.com/AUAUST/lib-js-engrenage/commit/aa29d4015d6f153b01e208351b1e735cea3d0414) Thanks [@apademide](https://github.com/apademide)! - - Let extensions, built-in or listed, contribute sync targets, run in order of the files they read and produce
  - List the active sync targets in run order, with their flags, in `engrenage sync --help`
  - Reject `changesets` as an `engrenage sync` target when `@changesets/cli` is not installed

- [`98f0c84`](https://github.com/AUAUST/lib-js-engrenage/commit/98f0c84ea4516929b3592033a1114f3752193022) Thanks [@apademide](https://github.com/apademide)! - - Fail tsdown builds on warnings locally too, as CI already did

### Patch Changes

- [`a304cef`](https://github.com/AUAUST/lib-js-engrenage/commit/a304cef5cb530255204291ee8c2fa7a3130deddf) Thanks [@apademide](https://github.com/apademide)! - - Complete walked leaves on the agent's final report
  - Keep walkers inactive between agent events and limit workers, debuggers and consultants to their final report
  - Report from workers and debuggers only once the worktree gate passes

- [`bf131d6`](https://github.com/AUAUST/lib-js-engrenage/commit/bf131d60c3191c3dd8c241b079d781a4c2f37952) Thanks [@apademide](https://github.com/apademide)! - - Isolate Codex task contexts and bound agent coordination, verification and tool output
  - Allow scoped corrections required by project rules without consultant escalation

- [`1c5dfe6`](https://github.com/AUAUST/lib-js-engrenage/commit/1c5dfe675087317b2c76399d514f967635d39dd3) Thanks [@apademide](https://github.com/apademide)! - - Make the analyser record its findings, without being asked, in Resource issues (Material `Report`, `Specification` or `Reference`) and Idea issues, drafted in `.ai/issues/` and published in one flush
  - Fix the planner's field mechanics, which posted single-select values as arrays

- [`68fb234`](https://github.com/AUAUST/lib-js-engrenage/commit/68fb2348b0d5d46905f48c6a998f5d16a2bb9d2d) Thanks [@apademide](https://github.com/apademide)! - - Add the `analysis` AGENTS.md section, on by default: agents read each request as a hypothesis, work out its ideal solution, map it onto the codebase and adopt only the reach their role allows, and weigh dependencies by size, use and maturity instead of avoiding them
  - Add the `discarded-solutions` rule, on by default: agents log each solution they set aside in `.ai/discarded.md`, so recurring ones surface as candidates
  - Add the `analysis` skill and its `analyser` agent, analysing a request or part of the project in depth and reporting its ideal, reach and a recommendation
  - Make planners pause on every costly reach of a request, however it is worded

- [`ace5160`](https://github.com/AUAUST/lib-js-engrenage/commit/ace51600ed1d25527fea18f8cede52792afe49db) Thanks [@apademide](https://github.com/apademide)! - - Add the `agent-friction` rule, on by default: agents log in `.ai/friction.md` each retry, workaround or lookup their tools and workflow cost them, so recurring stumbles surface as fix candidates
  - Make the analyser read the agent-friction log alongside the discarded-solutions log

- [`3b57e13`](https://github.com/AUAUST/lib-js-engrenage/commit/3b57e135e94f6b16fbe9873a75247237d7c0b3ac) Thanks [@apademide](https://github.com/apademide)! - Agents lint by hand only named files, with `--fix`

- [`39f0716`](https://github.com/AUAUST/lib-js-engrenage/commit/39f071673141ff24700690d3f7388c4e36e04440) Thanks [@apademide](https://github.com/apademide)! - - Make agents correct architectural violations only in the code their change rewrites, recording the others as debt markers, discarded solutions or backlog entries

- [`1c5a1e0`](https://github.com/AUAUST/lib-js-engrenage/commit/1c5a1e091d97b825a1e826ce521d55eae7c4f96d) Thanks [@apademide](https://github.com/apademide)! - - Show every option of the `agents` and `pnpm` subcommands in `engrenage help`

- [`27cf1c8`](https://github.com/AUAUST/lib-js-engrenage/commit/27cf1c83c7d559926861c21ef9da97f520419659) Thanks [@apademide](https://github.com/apademide)! - - Treat a `#…` alias import of another domain's public entry as a public entry in the structure lint rules
  - Rank a namespace import of an entry in `auaust/import-effects` by the roles declaring its exports

- [`df7de28`](https://github.com/AUAUST/lib-js-engrenage/commit/df7de2821a64bdd5bcca513ab7748ff1f8d2f1a9) Thanks [@apademide](https://github.com/apademide)! - - Add a `types` barrel mode re-exporting matched modules with `export type * from`
  - Fill `@barrel` blocks of `entry.ts` files as well as `index.ts` ones

- [`9b95888`](https://github.com/AUAUST/lib-js-engrenage/commit/9b958889cd87fa9fd4629a7c03caa2abc0cc5c9d) Thanks [@apademide](https://github.com/apademide)! - - Check every Claude worker and debugger dispatch: the generated hook now runs on all `Agent` calls, since Claude Code never applied its `Agent(worker)` and `Agent(debugger)` filters

- [`2e15974`](https://github.com/AUAUST/lib-js-engrenage/commit/2e1597456adb1530b835ba0f91548741efbe9ad8) Thanks [@apademide](https://github.com/apademide)! - - Kill tool commands' child processes when their run is interrupted

- [`1df13fa`](https://github.com/AUAUST/lib-js-engrenage/commit/1df13fab51251fbd2665aafa7bd2f292de784268) Thanks [@apademide](https://github.com/apademide)! - - Generate Codex workflow roles with inherited models and Complexity effort profiles
  - Sync installed skill invocation policies and workflow dispatch instructions

- [`af06ef9`](https://github.com/AUAUST/lib-js-engrenage/commit/af06ef983fcb80c9adc9885a7ef8e1a5e050bbe1) Thanks [@apademide](https://github.com/apademide)! - - Let `defineCommand` and `defineLazyCommand` take an `extend` loader adding project-dependent arguments and options to a command before it parses or shows its help

- [`fae6fae`](https://github.com/AUAUST/lib-js-engrenage/commit/fae6fae35501e61b4330461f56e22f4d6e3c5f81) Thanks [@apademide](https://github.com/apademide)! - - Reject agent commits whose `Closes` and `Towards` lines are separated by blank lines, through a new `commit-msg` hook

- [`f642b7e`](https://github.com/AUAUST/lib-js-engrenage/commit/f642b7e302eeaf4908bc573a365f589e99e6027e) Thanks [@apademide](https://github.com/apademide)! - - Autofix complex concise arrow bodies into blocks with an explicit `return`

- [`2147ce3`](https://github.com/AUAUST/lib-js-engrenage/commit/2147ce35857846517338123c171229bc9637a387) Thanks [@apademide](https://github.com/apademide)! - - Type `ConfigInput` as the global `EngrenageConfigInput`, generated from the built-in extensions' keys and augmentable by other extensions

- [`40c8579`](https://github.com/AUAUST/lib-js-engrenage/commit/40c8579386334f6c761ded6451f28060f3255050) Thanks [@apademide](https://github.com/apademide)! - - Validate the config input of every registered extension's key in `loadValidatedConfig`
  - List the registered extensions in the error for an unknown config key

- [`92109fa`](https://github.com/AUAUST/lib-js-engrenage/commit/92109faf8081b3630cf66150cdbfa3dd855b48d0) Thanks [@apademide](https://github.com/apademide)! - - Type-check only the plain and `.dist` tests, the setup file and the declarations in the `tests.dist` tsconfig, so `.src` tests no longer bring source into `typecheck:dist`

- [`60f00e2`](https://github.com/AUAUST/lib-js-engrenage/commit/60f00e25f09908ffef562a397d126b14969e0da5) Thanks [@apademide](https://github.com/apademide)! - Drop `import-x/export` and `import-x/default`, which TypeScript already checks

- [`d86a389`](https://github.com/AUAUST/lib-js-engrenage/commit/d86a3897cc684e0f1b68063ef2e838de5f801f52) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage jscpd`, detecting duplicated code in the project's code files outside fixtures and generated files
  - Warn in `engrenage gate` about clones the changed files add, when the project depends on jscpd
  - Add the jscpd init step, installing jscpd as a dev dependency
  - Group the gate's budget warnings under a `budgets` heading

- [`6298d44`](https://github.com/AUAUST/lib-js-engrenage/commit/6298d448d26a771a4bd8b62de9aefb994cb8737b) Thanks [@apademide](https://github.com/apademide)! - - Read ESLint conventions' sections by config key: `Convention.sections` lists `ConfigKey`s, and `defineEslintConfig` no longer loads the Git tool

- [`c5cf3d6`](https://github.com/AUAUST/lib-js-engrenage/commit/c5cf3d6d53e95d5ed447f2bd4790c8a47d1d3dac) Thanks [@apademide](https://github.com/apademide)! - - Apply nested `.gitignore` files to `engrenage eslint`, each scoped to its own directory as Git does

- [`7dd8c3a`](https://github.com/AUAUST/lib-js-engrenage/commit/7dd8c3a340b9f2cad71ee06939240fbdf1a5063b) Thanks [@apademide](https://github.com/apademide)! - - Stop `auaust/no-unnecessary-type-parameters` from reporting type parameters that reach an inferred return type through `NoInfer`

- [`7b9b600`](https://github.com/AUAUST/lib-js-engrenage/commit/7b9b600846d236af9fbd449d8398a274386cc29b) Thanks [@apademide](https://github.com/apademide)! - - Report `return undefined;` once in functions typed `void` or `undefined`, through `auaust/no-useless-undefined` only

- [`73762b4`](https://github.com/AUAUST/lib-js-engrenage/commit/73762b46d4d89d9abbd74ea47f53c1ba74db0588) Thanks [@apademide](https://github.com/apademide)! - - Refuse a config key whose extension's `requires` are unmet, naming the unmet requirement
  - Fail only the file resources of an extension with unmet `requires`, instead of every resource
  - Pick up the file resources of a tool once a staged `package.json` adds its package

- [`aade1dd`](https://github.com/AUAUST/lib-js-engrenage/commit/aade1dddf3146de92535fbf02dfaf0962c98b732) Thanks [@apademide](https://github.com/apademide)! - - Reject a malformed listed extension or slot entry when the config loads, naming its path, instead of failing later on first read

- [`e0a19cb`](https://github.com/AUAUST/lib-js-engrenage/commit/e0a19cb9a523195178a02b329cbfd183cc7d555c) Thanks [@apademide](https://github.com/apademide)! - - Add file resources: extensions declare the files they own under `owns.files`, located through the `resources` config key, and open them to other extensions' `owns.parts`

- [`5845ba7`](https://github.com/AUAUST/lib-js-engrenage/commit/5845ba79cfb9b6927fdb62103ac07fe942568fb4) Thanks [@apademide](https://github.com/apademide)! - Gate commands run alongside the built-in checks.

- [`24b8c69`](https://github.com/AUAUST/lib-js-engrenage/commit/24b8c69dbeed49a6c850520cf9aa1088c672504c) Thanks [@apademide](https://github.com/apademide)! - - Run the changed domains' tests in the agent gate instead of every related test, when the tests mirror the source

- [`36e43b4`](https://github.com/AUAUST/lib-js-engrenage/commit/36e43b4e6a5d34ab5e4d113ba790d870e89e56fb) Thanks [@apademide](https://github.com/apademide)! - - Make gates in one worktree wait for each other
  - Reuse an unchanged stop pass at commit
  - Fail a gate whose files change while it verifies them

- [`8ae0bb8`](https://github.com/AUAUST/lib-js-engrenage/commit/8ae0bb817947bac8b62c1ee3f75d1f2c6294c6aa) Thanks [@apademide](https://github.com/apademide)! - - Count issues closed by a local `Closes` commit as closed in `engrenage issues check` and the dispatch hook
  - Report sub-issues and blocking issues as open, closed by a local commit or closed on GitHub, and list the local commits `Towards` the checked issue
  - Brief walked workers with the commits `Towards` their issue, and read local closes from `engrenage issues check`

- [`3ca8560`](https://github.com/AUAUST/lib-js-engrenage/commit/3ca85605deb79036a3c75536c3dbac7106d2537a) Thanks [@apademide](https://github.com/apademide)! - - List an issue's open sub-issues to walk first in `engrenage issues check`, apart from the issue's own findings
  - Let walkers walk open sub-issues while handling their parent's own findings
  - Remove repeated rules from the walking, implementation, debugging and planning skills

- [`917510c`](https://github.com/AUAUST/lib-js-engrenage/commit/917510cea0e40f0bb84bdd86aa12eb7a50e577bc) Thanks [@apademide](https://github.com/apademide)! - - Protect local files from commit additions and modifications while allowing deletions.
  - Run the local-file safeguard for human commits through Lefthook.

- [`28b0779`](https://github.com/AUAUST/lib-js-engrenage/commit/28b0779fef525cd53a4fe327db8805f3c8ce3584) Thanks [@apademide](https://github.com/apademide)! - - Expand inline object values of `auaust/object-curly-newline` when a sibling property value needs newlines

- [`a4f6c92`](https://github.com/AUAUST/lib-js-engrenage/commit/a4f6c92392ac8521a66f9437d19a58b074c06fdd) Thanks [@apademide](https://github.com/apademide)! - - Surround standalone and assigned awaits with blank lines.
  - Surround break, continue and yield statements with blank lines.

- [`344847d`](https://github.com/AUAUST/lib-js-engrenage/commit/344847de07cca5054dd961a1c2f0c149a995f975) Thanks [@apademide](https://github.com/apademide)! - - Match statements by attribute instead of subtree search in the concise-arrow convention, cutting its selector cost

- [`6bc2f57`](https://github.com/AUAUST/lib-js-engrenage/commit/6bc2f579fc42f44a4b991333d5308fc2a3d95078) Thanks [@apademide](https://github.com/apademide)! - Planners place checkpoints only between groups of Steps

- [`c9defe1`](https://github.com/AUAUST/lib-js-engrenage/commit/c9defe1194068a6c912a2cc4f799a502a3f1cb88) Thanks [@apademide](https://github.com/apademide)! - - Add missing shared pnpm workspace settings on `engrenage sync`, keeping project entries and explicit denials

- [`d2b3503`](https://github.com/AUAUST/lib-js-engrenage/commit/d2b35037d410bfe24e14175c97d476b44770f059) Thanks [@apademide](https://github.com/apademide)! - - Format the workspaces and the files engrenage owns with `prettier:all`, beside the declared environments

- [`2075058`](https://github.com/AUAUST/lib-js-engrenage/commit/2075058eaa36c30e8449bf76a7df76ba91f37c22) Thanks [@apademide](https://github.com/apademide)! - - Add the `prettier.plugins` slot: extensions contribute Prettier plugins, loaded into every Prettier configuration engrenage builds, with options for the files each plugin covers

- [`36e7227`](https://github.com/AUAUST/lib-js-engrenage/commit/36e72278ff12330fdd1c32fc58502793cfa76578) Thanks [@apademide](https://github.com/apademide)! - - Consolidate role contracts and effect levels in the project map overview.
  - Include root tooling files in map selectors and omit empty environment maps.

- [`8dc1dd9`](https://github.com/AUAUST/lib-js-engrenage/commit/8dc1dd92111b811eaf0fbe762415a1558580269c) Thanks [@apademide](https://github.com/apademide)! - - Check worker and debugger dispatch readiness in Claude and Codex
  - Return verification failures through both runtimes and clean passing stop state
  - Diagnose local agent configuration and unresolved runtime trust

- [`73e0257`](https://github.com/AUAUST/lib-js-engrenage/commit/73e0257739206c18afc0910a89e891267153ddad) Thanks [@apademide](https://github.com/apademide)! - `shopify-app` preset: `extensions/*` workspaces with Preact and Polaris types, Shopify host files left unformatted

- [`dadb727`](https://github.com/AUAUST/lib-js-engrenage/commit/dadb727442ccd013aaf611c9fbe1bf3f8d1f7c89) Thanks [@apademide](https://github.com/apademide)! - `shopify-theme` preset: Liquid formatted through `@shopify/prettier-plugin-liquid`, Vite's output in `assets/` ignored

- [`56349e8`](https://github.com/AUAUST/lib-js-engrenage/commit/56349e80db785107583f936cd42c56c938200d1b) Thanks [@apademide](https://github.com/apademide)! - - Warn on each domain without a purpose in `engrenage structure`.

- [`7407541`](https://github.com/AUAUST/lib-js-engrenage/commit/7407541e2121f2ce223da1a259a5c04e5140080a) Thanks [@apademide](https://github.com/apademide)! - - Enable `incremental` in the synced environment tsconfigs, so `engrenage typecheck` reuses its previous build

- [`0d6666e`](https://github.com/AUAUST/lib-js-engrenage/commit/0d6666e6833fb7f6448b80f44140be0de199ada6) Thanks [@apademide](https://github.com/apademide)! - - Pass `engrenage typecheck` when every environment sets `check: false`, instead of failing

- [`950972f`](https://github.com/AUAUST/lib-js-engrenage/commit/950972fc651df85efadce09b07d03e2b556d904d) Thanks [@apademide](https://github.com/apademide)! - - Keep a project's own entries in VS Code setting arrays sync writes, such as `eslint.rules.customizations`

- [`7cf641e`](https://github.com/AUAUST/lib-js-engrenage/commit/7cf641e4ca83e5d79b294db172191b109e95f7c7) Thanks [@apademide](https://github.com/apademide)! - - Make VS Code propose non-relative import paths, such as the `#…` aliases, instead of relative ones

- [`99d75cf`](https://github.com/AUAUST/lib-js-engrenage/commit/99d75cfb32e138a8d07d1fcddc3a76e01251a724) Thanks [@apademide](https://github.com/apademide)! - - Report and fix concise arrow bodies that do not stay on the line of their `=>` in `auaust/no-complex-concise-arrows`

## 0.7.0

### Minor Changes

- [`8a466b4`](https://github.com/AUAUST/lib-js-engrenage/commit/8a466b48d7728f055a8d847ce54cab5ac55ace29) Thanks [@apademide](https://github.com/apademide)! - - **Breaking:** baseline environments type built-ins from TypeScript ES libs selected from the snapshot, written to `lib`, instead of `noLib` and `typescript-baseline-lib`
  - **Breaking:** `<env>.tsconfig.lib` is accepted for a baseline environment and replaces or adjusts the selected libs (`esnext.*` libs are added through `append`)
  - **Breaking:** `typescript-baseline-lib` is no longer a peer dependency nor added by `engrenage init`; projects can remove it from their `devDependencies`
  - **Breaking:** a `src.apis` library group whose lib is already selected is left out of `types` with a warning

- [`eb175e0`](https://github.com/AUAUST/lib-js-engrenage/commit/eb175e05d49173989cc8e8ea4d7a0624260d1c1a) Thanks [@apademide](https://github.com/apademide)! - - Add the `disposable` and `float16` groups to `src.apis`: they type `Symbol.dispose`, `Disposable`, `Float16Array` and `Math.f16round` in a library's own source, which are not Baseline widely available, while a consumer still resolves them from its own lib only

- [`441d7f6`](https://github.com/AUAUST/lib-js-engrenage/commit/441d7f604cb9b9c8adc87dbaaccf47df1ab728f7) Thanks [@apademide](https://github.com/apademide)! - - Document every option of the `Config` interface with where its value is used, its default and what unsetting it does, generated from the config schema by `pnpm support codegen config`

- [`e6af4b7`](https://github.com/AUAUST/lib-js-engrenage/commit/e6af4b7ae9de41b6ef9020d4bdc0d223afc3e9f0) Thanks [@apademide](https://github.com/apademide)! - - Make library entries import each other through the package's own name, so namespaces, module state and classes keep one identity across entries (`entry-self-references` tsdown plugin, switched off with `plugins: { "entry-self-references": false }`)

- [`b38f39a`](https://github.com/AUAUST/lib-js-engrenage/commit/b38f39a1007589747d749de86498726661f3fb88) Thanks [@apademide](https://github.com/apademide)! - - Type and validate `src.apis` against the known API groups, with completion in editors and an expected-values error for an unknown group

- [`1c77c50`](https://github.com/AUAUST/lib-js-engrenage/commit/1c77c5021c6d5c1f00395db4f212dd8600d66958) Thanks [@apademide](https://github.com/apademide)! - - Report `return undefined;` in functions with a return type annotation, with a fix to `return;`, through the new `auaust/no-return-undefined` rule

- [`edaac3c`](https://github.com/AUAUST/lib-js-engrenage/commit/edaac3ca7abbd9352546be4cf8ff61746c734277) Thanks [@apademide](https://github.com/apademide)! - - Move engrenage's pnpm range to pnpm 12: `engrenage sync` warns about projects on pnpm 11, and `engrenage pnpm upgrade` moves them to pnpm 12

- [`1061635`](https://github.com/AUAUST/lib-js-engrenage/commit/1061635ff7fd94012da4f61a96afa1d19878c626) Thanks [@apademide](https://github.com/apademide)! - - Compare the pnpm of a project with engrenage's declared pnpm range instead of its major, warning below and above it
  - Make `engrenage pnpm upgrade` write the highest pnpm within engrenage's range, warn instead of failing for a newer pnpm, and ask before moving it back into the range (`--yes` accepts)
  - Make `engrenage init` declare the highest pnpm within engrenage's range when the project declares none

- [`0a62dd4`](https://github.com/AUAUST/lib-js-engrenage/commit/0a62dd434ddbb7655a47b7ade69c1a8535e05b36) Thanks [@apademide](https://github.com/apademide)! - - Warn during `engrenage sync` about a missing pnpm declaration, a pnpm major other than engrenage's, a legacy `packageManager` field and an obsolete `only-allow` preinstall script, without ever failing the check
  - Add `engrenage pnpm upgrade`, which moves the project to the latest pnpm within engrenage's major, removes the obsolete fields and re-pins the lockfile

- [`8e04855`](https://github.com/AUAUST/lib-js-engrenage/commit/8e04855ce55dfac196539a8eeb5104f6bc94f79e) Thanks [@apademide](https://github.com/apademide)! - - Warn about an empty `undefined` guard followed by a single valued return, with a fix wrapping the return in the negated check, through the new type-aware `auaust/prefer-valued-return` rule, skipped under `noImplicitReturns`

- [`0180ad9`](https://github.com/AUAUST/lib-js-engrenage/commit/0180ad96e534f4ba42e59e91cf413dfb6e824da6) Thanks [@apademide](https://github.com/apademide)! - - Print command failures as a message with its causes, and the stack trace only in debug mode
  - Add the `debug` option, the `--debug` flag and the `ENGRENAGE_DEBUG` environment variable to enable debug mode

- [`8aacb42`](https://github.com/AUAUST/lib-js-engrenage/commit/8aacb42465133d81d419bfefef8d9eb6184eb850) Thanks [@apademide](https://github.com/apademide)! - - Add the `plugins` option to `defineTsdownConfig` to turn built-in tsdown plugins off by name
  - Rename the empty-namespace plugins to `engrenage:empty-namespaces:find` and `engrenage:empty-namespaces:declare`

- [`e9e7a07`](https://github.com/AUAUST/lib-js-engrenage/commit/e9e7a07e72bf96f012e94dd15080b43d100c8042) Thanks [@apademide](https://github.com/apademide)! - - `createOutDirGuard` takes the plugin name as its first argument: `createOutDirGuard(name, { packageName, outDir })`
  - Add `outDirGuard` and `pluginPrefix` to `@auaust/engrenage/vitest/constants`

### Patch Changes

- [`5b12588`](https://github.com/AUAUST/lib-js-engrenage/commit/5b1258882dae3eabe74bb70ff0d470e9893d9c04) Thanks [@apademide](https://github.com/apademide)! - - Remove `noLib`, a `null` `lib` and the baseline and API `types` from a tsconfig whose environment has no baseline runtime

- [`17b7bb8`](https://github.com/AUAUST/lib-js-engrenage/commit/17b7bb84f810c201292e9f6d23e3dbb34a3a9e09) Thanks [@apademide](https://github.com/apademide)! - - Replace a stale `lib: null` of a baseline tsconfig with the selected libs

- [`63e39a6`](https://github.com/AUAUST/lib-js-engrenage/commit/63e39a69761b10e3ab00500b2d08d4a185282894) Thanks [@apademide](https://github.com/apademide)! - - Allow computed member access on namespace imports in `import-x/namespace`

- [`6b3cf5f`](https://github.com/AUAUST/lib-js-engrenage/commit/6b3cf5f7a6756ebe24556ca49c385fec8df35eb3) Thanks [@apademide](https://github.com/apademide)! - - Make `src.baseline` optional: without it, sync warns and leaves the baseline libraries, types and build target out
  - Reject `src.apis` without `src.baseline`

- [`811b633`](https://github.com/AUAUST/lib-js-engrenage/commit/811b633841136921cb762333b4483f5b52acef2e) Thanks [@apademide](https://github.com/apademide)! - - Warn about an unresolvable agent `@reference` and leave its block untouched instead of failing init and sync
  - Let a `syncBlocks` filler return `undefined` to keep its block as it is

## 0.6.0

### Minor Changes

- [`6b9d0a9`](https://github.com/AUAUST/lib-js-engrenage/commit/6b9d0a9226f018ce135168342d8f3421d06020dd) Thanks [@apademide](https://github.com/apademide)! - - Add the `agents.attribution` option: `false` hides Claude Code's commit and pull request attribution in `.claude/settings.json` and syncs a `no-attribution` rule, `true` drops engrenage's hiding value and syncs an `attribution` rule, and leaving it unset touches neither
  - Write `attribution: false` into the config `engrenage init` generates

### Patch Changes

- [`1c327b8`](https://github.com/AUAUST/lib-js-engrenage/commit/1c327b8400a5e192f21e80edeb28d26221b24f85) Thanks [@apademide](https://github.com/apademide)! - - Allow only directive, `@debt`, project-defined documentation and user-requested comments in the implementation section, turning any other comment the code seems to need into a `@debt` marker
  - Let debt markers be added within the task that notices them, files only read included, and scope the debugger's debt marking to what it notices while diagnosing

- [`ae9e0ca`](https://github.com/AUAUST/lib-js-engrenage/commit/ae9e0ca326629221b53b8a14f174eed8daacb016) Thanks [@apademide](https://github.com/apademide)! - - Add a default `git` agent rule: no push by default, commit only to separate several tasks and otherwise suggest the message, `<type>: <summary>` subjects from a table of commit types whose summary is the label recalling the main change, a body of only one `Closes` or `Towards` line per issue, GitHub writes only in AUAUST repositories
  - Drop the repeated "leave changes uncommitted" lines from the skills and the GitHub line from the implementation section, now carried by the `git` rule

- [`b4dd1cc`](https://github.com/AUAUST/lib-js-engrenage/commit/b4dd1ccab4232a6c265e192eccf517db93da713d) Thanks [@apademide](https://github.com/apademide)! - - Give the instruction-maintenance section a "Writing instructions" group: rules in the writer's own words, correct by precise application rather than by listed cases, one imperative rule per sentence, the lightest structure that fits, merged with overlapping rules, applied wherever agent instructions are drafted, issues and backlog entries included

- [`9b47329`](https://github.com/AUAUST/lib-js-engrenage/commit/9b473290dc212d6e830efa8832eef0e7bb1ffe22) Thanks [@apademide](https://github.com/apademide)! - - Make the planner and backlogger investigate every question and keep under **Questions** only what investigation cannot settle, with findings and candidate answers
  - Remove or reduce a backlog or debt backlog entry in the same run once an issue tracks its work, with one rule in the planning, backlog and debugging skills
  - List issue prerequisites as issue numbers only, and plan future instruction changes as intent, constraints and target file

- [`5a08b6a`](https://github.com/AUAUST/lib-js-engrenage/commit/5a08b6a47ac76f0ee3038aaad72a41d5dfaf1ea7) Thanks [@apademide](https://github.com/apademide)! - - Turn the decision-protocol section into a table of situations and actions, with one complete definition of a real choice
  - Stop on requests only when they contradict the rules or add architectural debt, and mark any other debt instead
  - Move the generated-files rule from the TypeScript section to the implementation section, and drop the repository-specific test location from the verification section
  - List the code-style rules ESLint does not fix one per item, and state the sibling-statement spacing rule without examples
  - Point the planner to the worker skill instead of restating how workers resolve questions

- [`d047120`](https://github.com/AUAUST/lib-js-engrenage/commit/d047120d0a568def3c1614a962eb5ec71a88d723) Thanks [@apademide](https://github.com/apademide)! - - Report unknown config keys as `Unknown key "<key>"` instead of valibot's `Invalid key: Expected never`, so options removed or renamed since an earlier version (such as the `code` group, moved to the environments in 0.5.0) read as such

## 0.5.0

### Minor Changes

- [`b28cdce`](https://github.com/AUAUST/lib-js-engrenage/commit/b28cdce2ad47beb63bf8f5e759dbd30062c9be86) Thanks [@apademide](https://github.com/apademide)! - - Make `engrenage sync agents` maintain the frontmatter keys engrenage generates in skills, agents and rules (`name`, `description`, `model`, `disable-model-invocation`, `disallowedTools`, `paths`): it overwrites them, adds missing ones and removes those the source no longer produces, and `sync --check` reports the drift. Keys engrenage does not generate are never touched
  - Add the `# @preserve <key>,<key>` YAML comment in a generated file's frontmatter to keep the listed keys as they are

- [`ed7fedf`](https://github.com/AUAUST/lib-js-engrenage/commit/ed7fedfd712a9e9e2e29287953499cbd4cfba901) Thanks [@apademide](https://github.com/apademide)! - - Generate the `src.apis` declaration groups from the `lib.dom.d.ts` of TypeScript with `pnpm support codegen apis`, instead of shipping hand-written copies; `--check` runs in CI
  - `timers` gains `setInterval` and `clearInterval`, `crypto` gains `randomUUID` and `subtle`, and `performance` gains the full `Performance` interface
  - Add the `console`, `url`, `encoding`, `events`, `abort`, `exceptions`, `microtasks`, `streams`, `compression` and `blob` groups
  - Declarations shared by several groups are emitted once in `apis/shared/common.d.ts`, which the group files reference, so any combination of groups type-checks without `skipLibCheck`
  - Timer handles are now typed `number`, the DOM signature

- [`c1d7c27`](https://github.com/AUAUST/lib-js-engrenage/commit/c1d7c27798873d9ec3d2993218ffaba1efc77687) Thanks [@apademide](https://github.com/apademide)! - - Add the `backlog-handling` skill and its Claude Code `backlogger` agent, which bring backlog entries up to date and file the ones ready for action as issues in AUAUST repositories; backlog setup installs it, and existing projects run `engrenage agents skills add backlog-handling`
  - Remove backlog entries once a GitHub issue tracks their work, in the backlog template

- [`2d44c59`](https://github.com/AUAUST/lib-js-engrenage/commit/2d44c59938de5637fbd2e16d7eddc417e0f9dc35) Thanks [@apademide](https://github.com/apademide)! - Add the `debt-harvesting` skill and `banker` agent, which harvest `@debt` markers into `.ai/debt.md`; the backlogger takes entries from it.

- [`e62fdc4`](https://github.com/AUAUST/lib-js-engrenage/commit/e62fdc4bdb517845f6f65b40103ba42317d41b0d) Thanks [@apademide](https://github.com/apademide)! - - **Breaking:** derive the JavaScript built-in types of a baseline `src` from the consumer-installed `typescript-baseline-lib`: `noLib: true`, no `lib`, `typescript-baseline-lib/year/<Y>` first in `types` and `target: "ESNext"`, with `Y` the last Baseline year entirely widely available at the `src.baseline` snapshot
  - **Breaking:** remove the `tsconfig/baseline/*.json` and `tsconfig/node/*.json` presets; Node environments get `lib` and `target` `ESNext`, with the Node surface from the installed `@types/node`
  - **Breaking:** require `src.baseline` (or `src.node`) when the `src` environment is active and reject `<env>.tsconfig.lib` on baseline runtimes; `engrenage init` writes the current month
  - **Breaking:** make `typescript-baseline-lib`, `baseline-browser-mapping` and `node-releases` peer dependencies, installed by `engrenage init`
  - Validate Node majors against `node-releases` instead of the removed preset files

- [`09e6a47`](https://github.com/AUAUST/lib-js-engrenage/commit/09e6a4711d3622164c76f5f41dc05515ba2567f4) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage debt [--json]`, which lists the `@debt` markers of the project through the `debt-markers` lint rule, whose new `list` option reports well-formed markers instead of malformed ones

- [`f33d5e8`](https://github.com/AUAUST/lib-js-engrenage/commit/f33d5e8ebc4d385dbbf1a4f6aa82a7bb1d58b2a1) Thanks [@apademide](https://github.com/apademide)! - - Add the default `debt-markers` agent rule, which tells coding agents to mark technical debt with `@debt` comments in the code they change; existing projects run `engrenage agents rules add debt-markers`

- [`065374a`](https://github.com/AUAUST/lib-js-engrenage/commit/065374a776d1e87bea8f59158c485678c23df0b3) Thanks [@apademide](https://github.com/apademide)! - - Add the `debugging` skill and its Claude Code `debugger` agent, on Opus, which investigates problems, fixes them at their root when the fix is contained and otherwise writes the fix into a GitHub issue for a worker; run `engrenage agents skills add debugging` in existing projects
  - The `worker` agent is routed only to issues whose fix or steps are already written, and stops on an issue with no Steps

- [`9a73416`](https://github.com/AUAUST/lib-js-engrenage/commit/9a7341654da9bc3fe166971412da94901c55081a) Thanks [@apademide](https://github.com/apademide)! - - Add `runtime.node`, `bin.node`, `src.baseline` and `src.node` options, resolved into a `runtime` per environment with the browser and Node minimums derived from the baseline snapshot
  - Write the newest baseline snapshot as `src.baseline` in the `engrenage.config.ts` created by `engrenage init`

- [`6663774`](https://github.com/AUAUST/lib-js-engrenage/commit/66637746e031065269e8b324cd9253cda5798ce5) Thanks [@apademide](https://github.com/apademide)! - - Add `src.exports`, `bin.commands` and the `data` environment with its `data.exports` to declare what each environment exposes, resolved into `config.src.exports`, `config.bin.commands` and `config.data`; without `src.exports` and `bin.commands`, entries still come from the tsconfig `paths` and the `bin.dirs` files
  - Fail the tsdown build when `src` and `data.exports` expose the same subpath
  - Move the tsdown `customExports` option to `data.exports` in the engrenage config

- [`6d0c519`](https://github.com/AUAUST/lib-js-engrenage/commit/6d0c519704a0e0b292906800a9d2b922d41bc600) Thanks [@apademide](https://github.com/apademide)! - - Create the base `tsconfig.json` in `engrenage sync` when it is missing
  - Stop `engrenage init` from writing tsconfig files; it creates `src/index.ts` for a new library and leaves the tsconfigs to sync

- [`1704d15`](https://github.com/AUAUST/lib-js-engrenage/commit/1704d157d7ee6825c38e0c1a6585b719afaaae16) Thanks [@apademide](https://github.com/apademide)! - - Replace the `source`, `test`, `bin`, `scripts` and `code` config groups with the `src`, `tests`, `bin`, `scripts` and `tooling` environments, each resolved into `config.src`, `config.tests`, `config.bin`, `config.scripts` and `config.tooling` with its `active` state, and add `config.files` aggregating their `generated`, `discovered`, `fixtures`, `published` and `private` globs
  - Move `source` to `src`, `test` to `tests`, `test.fixtureFiles` to `tests.fixtures`, `code.files` to `typescript.files`, `code.configFiles` to `tooling.files`, and `code.generatedFiles` and `code.discoveredFiles` to the `generated` and `discovered` lists of each environment, relative to its `dirs`
  - Add `defines` to the `src`, `tests`, `bin` and `scripts` environments, and accept `false` to disable any environment
  - Accept list options for the dirs and globs of every environment and for `typescript.files`
  - Rename the ESLint scope references `files.source` and `dir.source` to `files.src` and `dir.src`, and `files.config` to `files.tooling`

- [`4a9d962`](https://github.com/AUAUST/lib-js-engrenage/commit/4a9d962e0ebbf9c44a895fd945b47273908d104c) Thanks [@apademide](https://github.com/apademide)! - - Add the `ListOption`, `ListAdjustment` and `ManagedListOption` config types: a list replaces its default, adjusts it with `prepend`, `append` and `exclude`, resets it with `true`, or leaves it unmanaged with `false` where that differs from an empty list

- [`a0ace29`](https://github.com/AUAUST/lib-js-engrenage/commit/a0ace29175a228eed4d020ee1be1518df64ca832) Thanks [@apademide](https://github.com/apademide)! - - Add the `tsconfig` target to `engrenage sync`: it writes only the fields engrenage manages into the base and each owned environment tsconfig, leaves `false` lists and `unmanaged` scalars alone, applies `compilerOptions` as given and creates the tsconfig of every active environment

- [`8755756`](https://github.com/AUAUST/lib-js-engrenage/commit/87557566dff10a3b34b0a9cf39adadbed614abc8) Thanks [@apademide](https://github.com/apademide)! - - Write `devEngines.runtime`, and for the library preset `engines.node`, `bin` and `files`, on `engrenage sync` from the config (new `package` sync target). `devEngines.runtime` pins `runtime.node` with `onFail: "error"`, so CI runs the chosen Node major.

- [`53ca499`](https://github.com/AUAUST/lib-js-engrenage/commit/53ca49957f417842618aaac5bb7def85976ad6cf) Thanks [@apademide](https://github.com/apademide)! - - Replace the `scratchpad` agent rule with the `scratchpad` skill and its Claude Code `scratcher` agent, which triage scratchpad notes into the backlog strictly locally; delete `.claude/rules/scratchpad.md` and run `engrenage agents skills add scratchpad` in existing projects
  - Drop the scratchpad routing line from the `backlog` section
  - Restrict GitHub writes to AUAUST repositories in the `implementation` section

- [`237bf0d`](https://github.com/AUAUST/lib-js-engrenage/commit/237bf0ddcd2a8c49986397f96a238a7a15c72529) Thanks [@apademide](https://github.com/apademide)! - - Add the `tests.json`, `node/24.json` and `baseline/2026-10.json` tsconfig presets, and extend `tests.json` from `library.dist.json`
  - Remove `target` from `base.json`, and set `types: []` and `exactOptionalPropertyTypes` in `library.json`
  - Extend the newest baseline snapshot in the tsconfig of new libraries
  - Pin `typescript` to an exact version in new projects
  - Typecheck every referenced project when the tsconfig has references
  - Declare the namespace of empty module entries in bundled declarations
  - Add `cache.dir` and `config.cacheFor(packageName)` to place every tool cache under one root, removing the eslint `defaultCacheLocation` constant
  - Require a blank line before a `throw` that follows other statements
  - Ignore `AGENTS.override.md` in the project block of the synced `.prettierignore` when Codex is a preferred agent
  - Require Node 24 to install engrenage
  - Define the precedence of scoped rules, task references and tool configuration in the shared instructions
  - Remove the migration of `.claude/backlog.md`

- [`0c69500`](https://github.com/AUAUST/lib-js-engrenage/commit/0c69500a4f6b5b414939ee60d5a257afbd8c625f) Thanks [@apademide](https://github.com/apademide)! - - Generate the `extends` of every managed tsconfig in `engrenage sync`: the base extends the engrenage `library.json` or `base.json`, environments extend the base and the `tests.dist` variant extends the tests tsconfig, each as a path relative to its own directory

- [`a4e42d1`](https://github.com/AUAUST/lib-js-engrenage/commit/a4e42d18064b463bd35126fc679042dda4c93ca0) Thanks [@apademide](https://github.com/apademide)! - - Derive the `include` of each environment tsconfig from its `dirs`, the environments inheriting it and the env file when it defines, expanding brace patterns that tsconfig globs do not support
  - Exclude the `tests.fixtures` from the tests tsconfigs
  - Add the `tsconfig.exclude` managed list option to every environment

- [`dc01af7`](https://github.com/AUAUST/lib-js-engrenage/commit/dc01af7000820a228df5e45201c29cf2c8e333fa) Thanks [@apademide](https://github.com/apademide)! - - Turn `typescript.tsconfig` into a group (`path`, `extends`, `compilerOptions`, `unmanaged`) and move `typescript.distTsconfig` to `tests.dist.tsconfig.path`, defaulting to `tsconfig.tests.dist.json`
  - Add a `tsconfig` group (`path`, `inherits`, `extends`, `include`, `lib`, `types`, `compilerOptions`, `unmanaged`, `check`) to the `src`, `tests`, `bin`, `scripts` and `tooling` environments and to `tests.dist`, resolved into `config.<environment>.tsconfig` with its owner, following `inherits` and failing on cycles and conflicting options
  - Warn when the base tsconfig is not named `tsconfig.json`

- [`967696c`](https://github.com/AUAUST/lib-js-engrenage/commit/967696c7179c28e597159cf9e0b283523617a4a0) Thanks [@apademide](https://github.com/apademide)! - - Write `build.outDir` into the `src` tsconfig's `compilerOptions.outDir` on `engrenage sync` when it differs from the `outDir` the tsconfig inherits, so `tsc` and editors build into the same directory as tsdown and Vitest

- [`6d5b092`](https://github.com/AUAUST/lib-js-engrenage/commit/6d5b092bca589294dc91686c814f740c31fda58b) Thanks [@apademide](https://github.com/apademide)! - - Generate the package-name `paths` of the base tsconfig from `src.exports`, leaving every other alias untouched
  - Write `paths: {}` in the `tests.dist` tsconfig so Node resolves the package through its `exports`

- [`3f6734c`](https://github.com/AUAUST/lib-js-engrenage/commit/3f6734cff9bf9e8a2786f73c29a7c1ee0aff274b) Thanks [@apademide](https://github.com/apademide)! - - Write `compilerOptions.target`, `lib` and `types` of each environment tsconfig on `engrenage sync` from the environment's runtime: a baseline snapshot gives its target and libs with no types, a Node major gives its target, libs and `node` types. `lib` and `types` accept list adjustments, and `compilerOptions.target` overrides the target

- [`fa6f0e7`](https://github.com/AUAUST/lib-js-engrenage/commit/fa6f0e762d2c1730567eb31c042cc0edbed537bb) Thanks [@apademide](https://github.com/apademide)! - - Write the solution base tsconfig: `files: []` and `references` to every owned environment tsconfig with `check: true`
  - Write `compilerOptions.tsBuildInfoFile` in every environment tsconfig, under `<cache.dir>/typescript`
  - Write `skipLibCheck: false` in the `tests.dist` tsconfig

- [`c275867`](https://github.com/AUAUST/lib-js-engrenage/commit/c2758679c34ff78aec117de51eb0af569697a234) Thanks [@apademide](https://github.com/apademide)! - `createTsdownConfig` sets tsdown's `target` from the resolved `src` runtime (the baseline browsers and Node minimum, or the Node major) instead of falling back to `engines.node`.

- [`41419a0`](https://github.com/AUAUST/lib-js-engrenage/commit/41419a05d4cf421195d126010c36e84656d51590) Thanks [@apademide](https://github.com/apademide)! - - `engrenage typecheck:dist` checks the `tests.dist` tsconfig and fails clearly when the variant is disabled, its file is missing or `tests` is inactive; `engrenage typecheck` fails when no environment is referenced (every `check` is false)

- [`8973f04`](https://github.com/AUAUST/lib-js-engrenage/commit/8973f04a6c46c16d3e7f8df55ec720e5b7afdd47) Thanks [@apademide](https://github.com/apademide)! - - `createVitestConfig` passes the `tests` tsconfig (the `tests.dist` one in build mode) as `test.typecheck.tsconfig`, so test type checks run on a solution base; the top-level `tsconfig` stays on the base for the package-name `paths`

### Patch Changes

- [`a51311e`](https://github.com/AUAUST/lib-js-engrenage/commit/a51311ea067379638b754795d5f2ed33a3808b06) Thanks [@apademide](https://github.com/apademide)! - - Agent references resolve package fragments with ESM conditions, so fragments a package exports only under `import` can be referenced

- [`e46d370`](https://github.com/AUAUST/lib-js-engrenage/commit/e46d370006216e19f53d3b74f4d96d730b1f58c1) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage agents skills [add <name>]` to install shared agent skills for Claude Code and Codex, and keep them current on `engrenage sync agents`
  - Add the `issue-planning` skill and its Claude Code `planner` agent, which plan work as a tree of GitHub issues without implementing it
  - Add the `issue-implementation` skill and its Claude Code `worker` agent, pinned to Sonnet, which implement one planned issue as written
  - Accept `model` in a skill's agent metadata

- [`8c60fcb`](https://github.com/AUAUST/lib-js-engrenage/commit/8c60fcb25a41a231d8d5e7db75c292b201b71738) Thanks [@apademide](https://github.com/apademide)! - The `ci:check` script added by `engrenage init` lints without the ESLint cache, so type-aware rules catch errors caused by changes in imported modules as CI does.

- [`967c703`](https://github.com/AUAUST/lib-js-engrenage/commit/967c703d06b3ca050fed161b86734bdb7c468cfc) Thanks [@apademide](https://github.com/apademide)! - - Make `engrenage sync --check` pass right after `engrenage init`: init now syncs once, and a single sync pass writes the build output directory (`/dist`) into the ignore files even when `tsconfig.json` does not exist yet
  - Run the selected sync targets in their declared order, with the tsconfig target first, instead of the order they were typed

- [`6e07fdf`](https://github.com/AUAUST/lib-js-engrenage/commit/6e07fdfa133d24334054bb1bd8ac20087f2b8fdf) Thanks [@apademide](https://github.com/apademide)! - - Apply the `debt-markers` agent rule to all files and let agents mark debt they notice in files they only read, without searching for it
  - Allow only technical or required comments in the `implementation` agent instructions, and forbid comments that describe the code
  - Make agents try an alternative before changing repository-wide configuration, and report each such change separately
  - Define debt in the `debt-markers` agent rule by its gap to the ideal code instead of a list of signs, and treat any doubt as debt

- [`11ffd6c`](https://github.com/AUAUST/lib-js-engrenage/commit/11ffd6c474601a56c6acd8ed8ad0e614561bb3aa) Thanks [@apademide](https://github.com/apademide)! - - Make the `debugging` skill look for and mark debt along its diagnosis path
  - Fix the `debugging`, `issue-implementation` and `issue-planning` skill descriptions contradicting their agents' "use proactively"

- [`346847b`](https://github.com/AUAUST/lib-js-engrenage/commit/346847bd30bd80203918d93d13b641e18c606755) Thanks [@apademide](https://github.com/apademide)! - - Stop falling back to the base tsconfig when `tsconfig.tests.dist.json` is missing: `config.tests.dist.tsconfig.path` is now `undefined`, and the build-mode Vitest config and `engrenage tsc:dist` fail naming the file and `engrenage sync`

- [`66f6241`](https://github.com/AUAUST/lib-js-engrenage/commit/66f6241340908d1bf162572bf298156c9b486570) Thanks [@apademide](https://github.com/apademide)! - - `engrenage eslint` no longer adds `--cache` and `--cache-location` when `--no-cache` is passed

- [`fa7d47b`](https://github.com/AUAUST/lib-js-engrenage/commit/fa7d47b2271c2f959a31555ab8a08abf7427517e) Thanks [@apademide](https://github.com/apademide)! - - Condense the `implementation` agent instructions section without changing its rules

- [`ea0e18d`](https://github.com/AUAUST/lib-js-engrenage/commit/ea0e18d9de172e82bfacf672f66639ce5f5480e1) Thanks [@apademide](https://github.com/apademide)! - - Fix `engrenage sync` rewriting JSON objects that already hold the synced value, which reformatted them and made `sync --check` fail on formatted files such as `tsconfig.json` paths

- [`50df351`](https://github.com/AUAUST/lib-js-engrenage/commit/50df351ce48d981ed68e677718b9272d3a322ca6) Thanks [@apademide](https://github.com/apademide)! - Read issue comments in the issue-planning and issue-implementation skills, and pass `--repo <owner>/<repo>` when the debugging skill reads issues.

- [`cbc4a01`](https://github.com/AUAUST/lib-js-engrenage/commit/cbc4a0129caa556c313d09a0fff1b211e96f923b) Thanks [@apademide](https://github.com/apademide)! - - Format the files `engrenage sync` and `engrenage init` write with the project's Prettier when it is installed, so synced output passes `prettier --check`; `sync --check` no longer reports format-only drift

- [`a725a38`](https://github.com/AUAUST/lib-js-engrenage/commit/a725a381133a1367f4a7fa21a22aa0478294281d) Thanks [@apademide](https://github.com/apademide)! - - Write in `tsconfig.tests.dist.json` only the fields that differ from `tsconfig.tests.json`, and remove the `include`, `exclude`, `target`, `lib` and `types` it inherits unless the `tests.dist` tsconfig configures them

- [`4fd1846`](https://github.com/AUAUST/lib-js-engrenage/commit/4fd184618fba63a3457cfa8b4d8ef3034dd4fe5d) Thanks [@apademide](https://github.com/apademide)! - - Build declarations with the `src` tsconfig, so the build works again with a solution base tsconfig

## 0.4.3

### Patch Changes

- [`2721271`](https://github.com/AUAUST/lib-js-engrenage/commit/27212710da21e456efb777067aa49dcd712581c1) Thanks [@apademide](https://github.com/apademide)! - - Fix initialization before engrenage's TypeScript presets are installed
  - Add missing esbuild and resolver build approvals to new and existing pnpm workspaces while preserving explicit choices

- [`1e7c7dc`](https://github.com/AUAUST/lib-js-engrenage/commit/1e7c7dcd8a1af050597c1b7b9e553c13bd43a82c) Thanks [@apademide](https://github.com/apademide)! - - Clarify that user questions invite explanation and comparison without implicitly requesting a change.
  - Require explicit consent for instruction changes and distill requests into minimal, actionable rules with clarified intent.

- [`67c0ca5`](https://github.com/AUAUST/lib-js-engrenage/commit/67c0ca572d3f718f73b99baf06cf261f0ce80ef6) Thanks [@apademide](https://github.com/apademide)! - - Offer Istanbul coverage during init and add the coverage script only when its provider is present
  - Offer a missing coverage script when re-running init with Istanbul installed

- [`d9b284d`](https://github.com/AUAUST/lib-js-engrenage/commit/d9b284ddc146250d3ce9a44c6ae5a9f0a895c967) Thanks [@apademide](https://github.com/apademide)! - - Add optional shared backlog setup and migrate legacy Claude backlogs to `.ai/backlog/`.
  - Add an indexed backlog template, scoped maintenance rules and brief shared agent guidance.
  - Add a shared scratchpad with explicit backlog triage instructions and randomized kawaii placeholders.

## 0.4.2

### Patch Changes

- [`b2ff895`](https://github.com/AUAUST/lib-js-engrenage/commit/b2ff89541f1f3774d0b677b2d9e28b32f8305c03) Thanks [@apademide](https://github.com/apademide)! - Disable too strict TypeScript rules

## 0.4.1

### Patch Changes

- [`1f093b4`](https://github.com/AUAUST/lib-js-engrenage/commit/1f093b4ea16f72ae48f77d03f168cb7c4511548c) Thanks [@apademide](https://github.com/apademide)! - - Allow object literal type assertions while continuing to enforce `as` syntax

- [`5440c22`](https://github.com/AUAUST/lib-js-engrenage/commit/5440c22b18a25e9baafbd81d5e0abfb51eb9e978) Thanks [@apademide](https://github.com/apademide)! - - Allow standalone `void` statements to explicitly ignore promises.

- [`2cf7014`](https://github.com/AUAUST/lib-js-engrenage/commit/2cf7014daedea4eb6e35fe049928868c56f7ec84) Thanks [@apademide](https://github.com/apademide)! - - Allow small objects to remain inline while preserving existing multiline formatting.
  - Wrap objects with three or more properties, nested objects, and sibling objects in arrays and argument lists when one requires multiline formatting.

- [`57212f7`](https://github.com/AUAUST/lib-js-engrenage/commit/57212f721ac18f4fbac0ccd9dc020cc9d615114c) Thanks [@apademide](https://github.com/apademide)! - Add recommended stylistic TypeScript ESLint rules

- [`7c9248f`](https://github.com/AUAUST/lib-js-engrenage/commit/7c9248f78c1e4c89ed6b727d566b4716ef588c29) Thanks [@apademide](https://github.com/apademide)! - - Preserve defined global types from env.d.ts in tsdown declaration output

- [`7dcba49`](https://github.com/AUAUST/lib-js-engrenage/commit/7dcba49fa6e36f59a0a8240059cb6bdccae30bd9) Thanks [@apademide](https://github.com/apademide)! - - Remove legacy Claude hook command migration and the `legacyEditHookCommand` export

- [`41c172a`](https://github.com/AUAUST/lib-js-engrenage/commit/41c172a4909866e2dc82fe3fd32564ff81a6defa) Thanks [@apademide](https://github.com/apademide)! - - Enable recommended typed ESLint rules for code with type checking enabled

## 0.4.0

### Minor Changes

- [`2512af8`](https://github.com/AUAUST/lib-js-engrenage/commit/2512af832820c119e4bcb13816cec2c568f7b084) Thanks [@apademide](https://github.com/apademide)! - - Move Claude commands under `engrenage agents claude` and migrate generated hook commands.
  - Select preferred agents during init and generate setup only for selected agents.
  - Add Codex instructions with a scoped rule mapping and patch formatting hooks.
  - Read paths frontmatter from shared rule sources without embedding it into instruction bodies.

### Patch Changes

- [`a8583d1`](https://github.com/AUAUST/lib-js-engrenage/commit/a8583d1b317c18d3283a0d7b1bfde8be9ae61134) Thanks [@apademide](https://github.com/apademide)! - - Separate reviewing missing setup from approving changes in `engrenage init`
  - Ask before creating Vite, Vitest and tsdown configs or filling missing package fields

- [`42259ed`](https://github.com/AUAUST/lib-js-engrenage/commit/42259eda54e7c713672be577af3b037aa31140a7) Thanks [@apademide](https://github.com/apademide)! - - Add interactive agent rule selection and installation by name.
  - Generate initial agent sections from ordered default metadata.
  - Install only default rules during automatic initialization.

- [`079d6d2`](https://github.com/AUAUST/lib-js-engrenage/commit/079d6d2f43436822f45ea3110e992eaca2c35ccb) Thanks [@apademide](https://github.com/apademide)! - - Allow constant conditions, void expressions as arguments and `await` member access in test files
  - Drop `no-unsafe-member-access` and `unicorn/no-negation-in-equality-check`
  - Allow empty object literals in type assertions
  - Allow concise arrows returning simple arrays or literals asserted `as const`

- [`7c84ebc`](https://github.com/AUAUST/lib-js-engrenage/commit/7c84ebcd94e35ac50432d136e328d9f05842874a) Thanks [@apademide](https://github.com/apademide)! - - Set `publishConfig.access` to `public` when `engrenage init` creates a public scoped package
  - Add the shared `agents/rules/changesets.md` agent rules fragment

- [`b349efa`](https://github.com/AUAUST/lib-js-engrenage/commit/b349efabc56595a4227ada6fd2ee1b9644b9e0c2) Thanks [@apademide](https://github.com/apademide)! - - Require blank lines around let and const declarations except between declarations of the same kind

## 0.3.0

### Minor Changes

- [`75f8994`](https://github.com/AUAUST/lib-js-engrenage/commit/75f8994bac01aafb3647edbc7f335a3db2092ad7) Thanks [@apademide](https://github.com/apademide)! - `define()` and `define.values` accept any JSON-serializable value (including objects with `toJSON`, such as `Date` and `URL`) and fail clearly on values that cannot be serialized. The `GlobalValue` and `Globals` types are removed. The `packageJson` passed to `define.values` exposes standard fields such as `version`, `description`, `license`, `author`, `engines` and `files`, each validated when read.

- [`da30bdb`](https://github.com/AUAUST/lib-js-engrenage/commit/da30bdbd32923ea819bd5cbfb613f310a00e1687) Thanks [@apademide](https://github.com/apademide)! - Enforce the `node:` protocol for Node.js builtin imports and dashed lowercase text encoding identifiers (`utf-8`).

- [`406e89b`](https://github.com/AUAUST/lib-js-engrenage/commit/406e89b17d43365071c3df2bd3d5243d8751ddea) Thanks [@apademide](https://github.com/apademide)! - Rename `auaust/func-style` to `auaust/prefer-function-declaration` and allow function expressions assigned to a typed variable.

- [`3c60f65`](https://github.com/AUAUST/lib-js-engrenage/commit/3c60f6556f94c334bca78b9ad0a5b5e9d7806297) Thanks [@apademide](https://github.com/apademide)! - Group the promise and async rules under the `promises` conventions, reported as `auaust/<rule>` and toggleable per convention. Enable `await-thenable`, allowing promise aggregators to receive arrays that mix promises and other values.

### Patch Changes

- [`e96c744`](https://github.com/AUAUST/lib-js-engrenage/commit/e96c744b9bbf62e22d8690ceca292b03f13e2b50) Thanks [@apademide](https://github.com/apademide)! - Allow `__DUNDER__` variables in the naming convention.

- [`5d2ea4c`](https://github.com/AUAUST/lib-js-engrenage/commit/5d2ea4cf39a2670f9c5802a48f3020aec31331d3) Thanks [@apademide](https://github.com/apademide)! - Autofix naming convention reports by renaming the declaration and its references to camelCase or PascalCase, skipping exported declarations and names that would collide.

- [`fb0d06e`](https://github.com/AUAUST/lib-js-engrenage/commit/fb0d06e263d222100129dde9afd4928ac089229a) Thanks [@apademide](https://github.com/apademide)! - Allow unused parameters named `ignored…`, `unused…` or prefixed with `_` in `no-unused-vars`.

- [`f42f4b8`](https://github.com/AUAUST/lib-js-engrenage/commit/f42f4b8484838ee8b9a613ae78f71e03867f4174) Thanks [@apademide](https://github.com/apademide)! - Add `eslint:fix` and `eslint:suppress` commands, and have `engrenage init` add `typecheck`, `lint:check`, `lint:fix` and `lint:suppress` scripts, with `format` calling `engrenage prettier`.

- [`512d509`](https://github.com/AUAUST/lib-js-engrenage/commit/512d509f56faaa23fc4f4d221bf0cf9e05876253) Thanks [@apademide](https://github.com/apademide)! - Report literals widened by their primitive only when written in the union itself, such as `"a" | string`, no longer through a referenced type, such as `Operator | string`. The rule is now the `auaust/no-redundant-types` convention.

- [`26cfbaa`](https://github.com/AUAUST/lib-js-engrenage/commit/26cfbaae672f08b1748cbfe2e9abe7948197e019) Thanks [@apademide](https://github.com/apademide)! - Allow type parameters used only in a function's declared return type, such as `cast<Value>(target: unknown): Value | null`, which callers use to type the result. Type parameters that are never used, or used only once elsewhere, are still reported. The rule is now the `auaust/no-unnecessary-type-parameters` convention.

## 0.2.0

### Minor Changes

- [`a054aa8`](https://github.com/AUAUST/lib-js-engrenage/commit/a054aa8b9cec532f0e7ae3b8bb698f073da8207e) Thanks [@apademide](https://github.com/apademide)! - - Build every `<bin dir>/<name>.ts` and `<bin dir>/<name>/index.ts` as the `<bin dir>/<name>` entry, from the `bin.dirs` of `engrenage.config.ts`, and remove the tsdown `bins` option

- [`2aa09e6`](https://github.com/AUAUST/lib-js-engrenage/commit/2aa09e6d2019b5cd0a2118358299697f56c89eec) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage claude hook edit`, which fixes, formats and lints the file a Claude Code edit touched and reports the remaining lint errors to the agent
  - Add the hook to `.claude/settings.json` through `engrenage init` and the `claude` sync target, opted out with `agents.claudeSettings: false`
  - Shorten the shared code-style rules to the lint conventions that are not fixed automatically

- [`3bcf531`](https://github.com/AUAUST/lib-js-engrenage/commit/3bcf5316e890283b9683f0260abee6f8a08508e6) Thanks [@apademide](https://github.com/apademide)! - - Add `engrenage init` to set up a project, or add the pieces it is missing on later runs
  - `engrenage sync` only updates existing files; `init` creates them
  - Write all synced files at once and restore them when a write fails

- [`0f808a1`](https://github.com/AUAUST/lib-js-engrenage/commit/0f808a1b1bdc784b3e9b0f727e3998bdd6235b87) Thanks [@apademide](https://github.com/apademide)! - - Add a `define` config option whose `values` (a record, or a function of `packageJson` and `filesystem`) are serialized and passed as `define` to tsdown, Vite and Vitest
  - Add the `define(value, { exact, type, scope, description })` helper to type a global exactly, override its type, limit it to tests or builds or document its declaration
  - Add the `globals` sync target, writing `declare const` declarations into the `// @define` block of `typescript.envFile` (`env.d.ts` by default), disabled by `define.types: false`
  - Allow block markers without arguments in `syncBlocks`
  - `createViteConfig` takes an `{ isTesting }` option

- [`fe09f61`](https://github.com/AUAUST/lib-js-engrenage/commit/fe09f618d0dab32efe1f80d665c13840a8b94f4d) Thanks [@apademide](https://github.com/apademide)! - - Accept an `info` severity in conventions, the built-in rule maps and the configs passed to `defineEslintConfig`; ESLint receives it as `warn`
  - Show the rules declared `info` at info severity in VS Code, derived from the project's ESLint config by `engrenage sync`
  - Declare the `naming` and `noUnusedVariables` conventions and the DOM unicorn rules as `info`
  - Enable more unicorn rules for likely bugs, dead code, clearer APIs and early exits, leaving out those that conflict with the toolkit and primitive-kit helpers
  - Add the `stylistic.numericSeparators` convention
  - Make the `vscode` sync target and `syncVscodeFiles` asynchronous

- [`28a8bfa`](https://github.com/AUAUST/lib-js-engrenage/commit/28a8bfab064cbb0a7f84d12da4fd560bc3a07108) Thanks [@apademide](https://github.com/apademide)! - - Root `engrenage init` at the working directory and start a package from an empty directory with `pnpm init --bare`
  - Ask the project type first and use it as the default for the following questions; `--yes` takes every default
  - Ask the package name and visibility, and set `version`, `license`, `private` and `author` when missing
  - Ask the build tool (tsdown, Vite or none) and whether to test with Vitest, and create the matching config files
  - Create a missing `tsconfig.json` and, for libraries, `tsconfig.dist.json`
  - Add the standard scripts for the chosen tools instead of failing placeholder scripts
  - Resolve `packageJsonPath`, `tsconfigPath` and the other file locations through `config.filesystem` when read; a missing configured file now fails when read instead of when the config loads
  - Read tsconfig files inside the project through `config.filesystem`
  - Change `defineViteConfig` to take options first, with a `test` layer, and set `resolve.tsconfigPaths` in `createViteConfig`
  - Add `createVitestLayer`; `createVitestConfig` now returns only the test overrides and `defineVitestConfig` builds on `defineViteConfig`

- [`e9a6f43`](https://github.com/AUAUST/lib-js-engrenage/commit/e9a6f43c498162246e803bc13733d7452cfd3668) Thanks [@apademide](https://github.com/apademide)! - - Split the `stylistic.paddingLines` convention into `paddedReturns`, `paddedMultilineDeclarations`, `paddedMultilineExpressions`, `paddedBlocks`, `imports.paddedImports` and `imports.paddedExports`, each reported under its own `auaust/*` rule
  - Pad types, interfaces, functions, classes, enums, namespaces and block statements with blank lines
  - Add `bracedCases`, `paddedCases`, `unpaddedSwitches` and `groupedOverloads` stylistic conventions

- [`9932dfa`](https://github.com/AUAUST/lib-js-engrenage/commit/9932dfa4d6def1e87944b14fe0ed10cab58c8b8d) Thanks [@apademide](https://github.com/apademide)! - - Add `directories.output` and `build.emptyOutDir` to `engrenage.config.ts`; the output directory still defaults to the tsconfig `outDir` and is emptied before each build by default
  - Apply them to tsdown (`outDir`, `clean`), Vite (`build.outDir`, `build.emptyOutDir`) and the Vitest output guard
  - Print "Typechecking..." or "Linting..." before `engrenage tsc`, `tsc:dist` and `eslint`, and "All good!" when they pass
  - Load `tsdown.config.ts` with tsx by default in `engrenage tsdown`, and add `tsx` as an optional peer dependency that `engrenage init` installs with tsdown

- [`5a9924b`](https://github.com/AUAUST/lib-js-engrenage/commit/5a9924b02331120fb355d6b853a68cd98edaa98a) Thanks [@apademide](https://github.com/apademide)! - - Add the `auaust/prefer-return-void` stylistic convention: a non-function block holding only an expression statement and a bare `return` becomes `return void expression;`
  - Add the `auaust/no-return-undefined` stylistic convention, fixing `return undefined;` into `return;`
  - Enable `no-useless-return` in the recommended rules

- [`254d62c`](https://github.com/AUAUST/lib-js-engrenage/commit/254d62ca91074b560561268d53024551cdfa36a4) Thanks [@apademide](https://github.com/apademide)! - - Add `config.filesystem`, a cached view of the project files that reads lazily and writes everything on flush
  - Sync targets, `syncFiles`, `syncIgnoreFile` and `syncBarrels` take the resolved config first and write through `config.filesystem` instead of returning results
  - Read `config.packageJson` and `config.environment` through `config.filesystem`, so they follow pending writes
  - Add `--vscode-settings` and `--vscode-extensions` to `engrenage sync`, and create a VS Code file when its `vscode` option is `true`
  - Limit the changesets sync to `$schema`; `engrenage init` adds `@changesets/cli` and runs `changeset init`
  - Add the `@auaust/engrenage/pnpm` entry; `engrenage init` creates a missing `pnpm-workspace.yaml`
  - Declare `@changesets/cli` as an optional peer dependency

- [`66a4c72`](https://github.com/AUAUST/lib-js-engrenage/commit/66a4c72f554a30dde8fd46fd2d165feae847e8af) Thanks [@apademide](https://github.com/apademide)! - - Add the `imports.noExternalNamespace` convention, reserving namespace imports and `export * as` re-exports for project modules
  - Sort project namespace imports, then project default imports, into their own groups after the named project imports
  - Group wildcard re-exports after the named ones
  - Let comments partition import sorting, as they already do for exports
  - Report `import-x/no-named-as-default` as an error
  - Remove `performance.noValibotNamespace`, which `imports.noExternalNamespace` covers, and drop namespace imports from `performance.noZodNamespace`
  - Resolve imports against the project's own tsconfig instead of the one in the working directory

- [`477a212`](https://github.com/AUAUST/lib-js-engrenage/commit/477a21274ad42b079befcdeb7f67494be5e2c02d) Thanks [@apademide](https://github.com/apademide)! - `defineViteConfig`, `defineVitestConfig` and `defineTsdownConfig` callbacks now receive the resolved config as their first argument, followed by the tool's own arguments.

- [`cdcb48b`](https://github.com/AUAUST/lib-js-engrenage/commit/cdcb48b14e8b1e023adca2dfc21be392000d4aba) Thanks [@apademide](https://github.com/apademide)! - - Rename the ESLint convention scopes: `files.code`, `files.config`, `files.discovered`, `files.generated`, `files.test`, `files.source`, `files.bin`, `files.scripts`, `files.tests`, `files.code.published` and `files.code.private` select code files; `dir.source`, `dir.bin`, `dir.scripts`, `dir.tests`, `dir.published` and `dir.private` select every file in those directories
  - Move `packageJsonPropertyOrder` out of `@auaust/engrenage/eslint/constants`, compose it from shared package.json field groups, and order `optionalDependencies` before `peerDependencies` and `inlinedDependencies` after them
  - Run type tests by default in `engrenage vitest`, `vitest:watch` and `vitest:dist`; pass `--no-typecheck` to skip them
  - Print a start message and "All good!" for `engrenage vitest`, `vitest:dist`, `vitest:coverage`, `prettier:check` and `sync --check`
  - Use `engrenage typecheck:dist` in the standard `build` script
  - Reject block markers with an unknown directive or no arguments, and `@end` markers that close no block

- [`a054aa8`](https://github.com/AUAUST/lib-js-engrenage/commit/a054aa8b9cec532f0e7ae3b8bb698f073da8207e) Thanks [@apademide](https://github.com/apademide)! - - Group `engrenage.config.ts` by meaning instead of by kind, and mirror the groups on the resolved config:
    - `code: { files, configFiles, discoveredFiles }`
    - `source: { dirs }`, `bin: { dirs }`, `scripts: { dirs }`, with `src`, `bin` and `scripts` as defaults
    - `test: { dirs, files, fixtureFiles, coverageDir }`
    - `build: { outDir, emptyOutDir }`
    - `codegen: { files }`
    - `typescript: { tsconfig, distTsconfig }`, `git: { gitignore }`, `prettier: { prettierignore }`
    - `agents: { instructionFiles, snippetsDir }`
  - Remove `directories`, `files`, `tsconfigPath`, `distTsconfigPath`, `gitignorePath` and `prettierignorePath` from the resolved config
  - Accept a single string or an array for every input list, including `presets`
  - Rename the ESLint convention scopes to `code`, `config`, `discovered`, `testFiles`, `source`, `bin`, `scripts`, `tests`, `public` (source and bin) and `private` (tests and scripts)
  - `filesIn` takes one or more directories and globs and returns every combination

- [`6cdd03e`](https://github.com/AUAUST/lib-js-engrenage/commit/6cdd03e0e9e9e6927ad39736f585e699e2b2f6d2) Thanks [@apademide](https://github.com/apademide)! - - Expose every convention rule as `auaust/<rule>`, named after the upstream rule it delegates to, with our options as defaults that projects override key by key; the upstream rule is turned off where the convention applies
  - Rename the convention rules accordingly (`curly` becomes `auaust/curly`, `import-x/no-duplicates` becomes `auaust/no-duplicates`, `@stylistic/padded-blocks` becomes `auaust/unpadded-switches`, …) and replace the `rules` field of conventions with `delegates` and `severity`
  - Replace the `bracedCases` convention with `switches` (`unicorn/switch-case-braces`, `no-fallthrough` reporting unused fallthrough comments) and `noReturnUndefined` with `noUselessUndefined` (`unicorn/no-useless-undefined`)
  - Add the `assignments`, `conditionals`, `exhaustiveSwitches`, `functionDeclarations`, `nameReplacements`, `naming`, `objects`, `typeChecks`, `typeStyle`, `voidPlacement` and `voidReturns` stylistic conventions, `comparisons.noTypeofUndefined`, `imports.noCommonjs` and `promises.returnAwait`
  - Report `naming-convention` as a warning, shown as info in VS Code
  - Replace the `recommendedRules` constant with one constant per plugin: `coreRules`, `typescriptRules`, `typescriptTypeAwareRules`, `importRules`, `stylisticRules` and `unicornRules`
  - Add `eslint-plugin-unicorn` and enable `unicorn/prefer-node-protocol`
  - Enable more correctness rules from ESLint, typescript-eslint (type-aware ones on published and private code) and import-x
  - Enable the recommended `eslint-plugin-package-json` validators
  - Add the `typeAware` ESLint option to turn off every rule that needs type information

### Patch Changes

- [`895ff77`](https://github.com/AUAUST/lib-js-engrenage/commit/895ff77f12aa73fcc9a4ddfc7498c2227539e301) Thanks [@apademide](https://github.com/apademide)! - - Add the `globals.noMathStatics` convention, reporting the `Math` functions that `@auaust/toolkit/math` replaces
  - Let `defineGlobalReplacement` take the list of properties to report

- [`fe1f048`](https://github.com/AUAUST/lib-js-engrenage/commit/fe1f0484df569c31894eb9c604a23a79338475d9) Thanks [@apademide](https://github.com/apademide)! - - Enforce consistent property quotes with `auaust/quote-props` (all quoted or none, methods and shorthand left alone) and set Prettier's `quoteProps` to `preserve`
  - Keep quoted keys in long form with `auaust/object-shorthand` while accepting quoted method shorthand
  - Prefer type arguments on the constructor with `auaust/consistent-generic-constructors`
  - Pad switch cases only once a case body spans several lines or the switch already uses blank lines
  - Let `delegateRule` take its name and the upstream messages to ignore as options

- [`359529f`](https://github.com/AUAUST/lib-js-engrenage/commit/359529fbc85e66efcb106ff90247758cbdff1387) Thanks [@apademide](https://github.com/apademide)! - Allow template literal bodies in `auaust/no-complex-concise-arrows`, restrict `auaust/no-runtime-typeof` to `typeof` comparisons, and configure `prefer-const` with `destructuring: "all"` through the new `stylistic.preferConst` convention.

- [`3c0e7db`](https://github.com/AUAUST/lib-js-engrenage/commit/3c0e7db308501bc2320ee4fc80ae680eafd44736) Thanks [@apademide](https://github.com/apademide)! - - Require `eslint` as a peer dependency, since the `engrenage` CLI always loads it

- [`0728692`](https://github.com/AUAUST/lib-js-engrenage/commit/0728692872b58b4d0b4c2170a80c443ac73f25c3) Thanks [@apademide](https://github.com/apademide)! - The package.json property order places `sideEffects` and tool configs such as `prettier` after scripts and dependencies.

## 0.1.1

### Patch Changes

- [`58c32c3`](https://github.com/AUAUST/lib-js-engrenage/commit/58c32c3c6384a48e43e9c8ca617fd8cf47a49542) Thanks [@apademide](https://github.com/apademide)! - Fix TS2883 in consumer config files that emit declarations: `@auaust/engrenage/config` now re-exports `ConfigInput`, and `Config` and `ResolvedConfig` are interfaces, so their inferred types are named through public entries.

- [`43822b1`](https://github.com/AUAUST/lib-js-engrenage/commit/43822b11a588ffe443d8a8faa3e99f4e17480bed) Thanks [@apademide](https://github.com/apademide)! - The tsdown preset enables `publint` and `attw` only when the project depends on `publint` and `@arethetypeswrong/core`, instead of failing at the pack step when they are not installed.

## 0.1.0

### Minor Changes

- [`fc32d19`](https://github.com/AUAUST/lib-js-engrenage/commit/fc32d19cb8ee56a5aa7781faf62e9b609ae2c565) Thanks [@apademide](https://github.com/apademide)! - `importOrder` puts `@auaust/*` imports in their own group, between the other packages and the project imports, with value imports before type-only imports. The autofix reorders existing imports.

- [`d692c46`](https://github.com/AUAUST/lib-js-engrenage/commit/d692c4678afa3d1bb2cead5253a10eda5ba66571) Thanks [@apademide](https://github.com/apademide)! - `syncBarrels` fills `// @barrel <glob> <mode>` blocks, which replace `@reference` and `@registry`. The glob is relative to the barrel, or to the root with a leading `/`, and matches every module except the barrel itself and declaration files. The mode picks the re-export: `all` writes `export * from`, `named` writes `export { <file> } from` and `default` writes `export { default as <file> } from`; file names that are not identifiers, or that collide, fail. Barrels are found under `directories.source` and selected by directory (`src/eslint`) or, when unambiguous, by directory name. Block fillers receive every argument of their marker.
  
  **Breaking:**
  
  - Barrel blocks must use `@barrel`: `// @reference <directory>` becomes `// @barrel /<directory>/*.ts all`.
  - `@auaust/engrenage/typescript/constants` drops `barrelModules`; `barrelFiles` is now one glob matched in each source directory.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `engrenage sync changesets` (`syncChangesetConfig` from `@auaust/engrenage/changesets`) writes the shared fields of `.changeset/config.json` when `@changesets/cli` is a dependency: `baseBranch`, `commit`, `format`, `updateInternalDependencies`, `access` from `publishConfig.access` (`restricted` by default), `$schema` pinned to the installed `@changesets/config` version, and `changelog`, which uses `@changesets/changelog-github` with `repo` derived from `package.json#repository` when that generator is installed and the repository is on GitHub. Other fields, such as `ignore`, `fixed` and `linked`, stay as the project sets them. `PublishAccess` is exported from `@auaust/engrenage`.
  
  **Breaking:**
  
  - `@auaust/engrenage/vscode/constants` drops `emptyObjectFile` and `formattingOptions`.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - `loadConfig` finds `engrenage.config.*` with c12's own lookup, so the config can also live in `.config/` (`.config/engrenage.ts` or `.config/engrenage.config.ts`), in any format c12 supports. The lookup starts in the given directory (`process.cwd()` by default) and walks up to the nearest `package.json`, so tools running from a subdirectory of the project find it. The project root is the directory holding the config, or the parent of `.config/`. Without a config, the defaults are rooted at the nearest `package.json` directory, or the starting directory when there is none.
  
  **Breaking:**
  
  - Several config files in one directory no longer fail: c12 picks the first in its order.
  - The config of a parent directory now applies to its subdirectories, up to the nearest `package.json`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `directories.source` defaults to `["src", "bin", "scripts"]`, so conventions scoped to source directories and barrel discovery cover `bin/` and `scripts/` without configuration. Missing directories are ignored, and a configured list still replaces the default.

- [`13381c8`](https://github.com/AUAUST/lib-js-engrenage/commit/13381c8146bfebe141dbfaf7a5addf52033a3a27) Thanks [@apademide](https://github.com/apademide)! - Expose each domain's constants as an entry, so projects can reuse engrenage's defaults: `@auaust/engrenage/config/constants` (global config defaults such as `defaultCodeFiles`, `defaultSourceDirectories`, `defaultFixtureFiles`, `builtinGeneratedFiles`, and known file names), `@auaust/engrenage/eslint/constants`, `@auaust/engrenage/typescript/constants`, `@auaust/engrenage/agents/constants` and `@auaust/engrenage/prettier/constants` (`defaultOptions`, also the default export of `@auaust/engrenage/prettier`).

- [`97c8faf`](https://github.com/AUAUST/lib-js-engrenage/commit/97c8faf4623ee576a4637e3c96882f9291993914) Thanks [@apademide](https://github.com/apademide)! - Add `engrenage sync [targets…] [--check]`, which syncs every project file engrenage derives from the config. Without targets it runs all of them. With `--check` it writes nothing, reports each outdated file and exits non-zero. Each changed file is reported as `created`, `synced` or `outdated`. The first targets are `agents` and `vscode`.
  
  The new `@auaust/engrenage/vscode` entry exports `syncVscodeFiles`, and `@auaust/engrenage/vscode/constants` exports the `integrations` it applies. Each integration applies only when the project declares its package:
  
  - `eslint`: ESLint fix on save, with the built-in organize and sort imports actions turned off, plus the ESLint extension recommendation.
  - `prettier`: Prettier as the default formatter, format on save and `prettier.requireConfig`, plus the Prettier extension recommendation.
  - `typescript`: `js/ts.tsdk.path` pointing to the workspace TypeScript, with the deprecated `typescript.tsdk` removed.
  
  Only these keys are written into `.vscode/settings.json`, and missing recommendations are appended to `.vscode/extensions.json`. Comments and every other key stay as they are. The new `vscode.settings` and `vscode.extensions` config keys decide which files are synced: `true` syncs the file and creates it when missing, `false` ignores it, and the default syncs it only when it exists.
  
  **Breaking:** `engrenage agents sync` is removed in favour of `engrenage sync agents`.
  
  **Breaking:** `syncFiles` takes a list of `{ file, initial?, update }` entries instead of shared `files` and `update` options. A missing file is created from `initial`; without `initial` it fails. `syncFiles`, `syncAgentFiles` and `syncBarrels` now return `{ file, status }` results instead of the outdated file paths. `FileSync`, `SyncResult`, `SyncResults` and `SyncStatus` are exported from `@auaust/engrenage`.

- [`491bbff`](https://github.com/AUAUST/lib-js-engrenage/commit/491bbff9a1448fd1b046d4c4c8f118af45138377) Thanks [@apademide](https://github.com/apademide)! - Every entry now re-exports all of its types, and the root entry every shared helper. New exports:
  
  - `@auaust/engrenage`: `validate` (valibot validation with errors naming the subject and each failing key) and the read-only list types `Directories`, `Files` and `Globs`;
  - `@auaust/engrenage/eslint`: `AuaustRules`, `PerfectionistRules` and `UnusedImportsRules`;
  - `@auaust/engrenage/prettier`: `Options`;
  - `@auaust/engrenage/typescript`: `BarrelMode` and `Tsconfig`.

- [`e70afad`](https://github.com/AUAUST/lib-js-engrenage/commit/e70afad37f3b25e75335575531e2df7f043571c1) Thanks [@apademide](https://github.com/apademide)! - Add `defineEslintConfig(options | (engrenage) => options, ...configs)` to `@auaust/engrenage/eslint`. It loads `engrenage.config.ts`, builds the AUAUST configuration from the global values (`directories.source`, `directories.test`, `files.code`, `files.test`, `files.fixtures`, `files.config`, `files.discovered`, `files.generated`, `files.gitignore`), appends the native ESLint configs, and resolves to the flat config array, so `eslint.config.ts` can export it directly. Options toggle categories by purpose:
  
  - `ignore`: the gitignore file, `files.generated`, `coverage/**`, the tsconfig `outDir` and `files.fixtures` under each test directory (`tests/**/fixtures/**` by default);
  - `recommended`: the ESLint and typescript-eslint presets with the AUAUST adjustments;
  - `globals`, `comparisons`, `stylistic`, `imports`, `promises`, `structure`: `false` turns the whole category off, and an object turns off single conventions (`{ comparisons: { noRuntimeTypeof: false } }`). Unknown keys are rejected.
  
  Each restriction is now its own rule under the `auaust/` namespace (`auaust/no-runtime-typeof`, `auaust/no-array-is-array`, `auaust/no-object-statics`, `auaust/no-is-null`, `auaust/no-is-undefined`, `auaust/no-loose-undefined`, `auaust/no-complex-concise-arrows`, `auaust/no-dynamic-import`, `auaust/no-misplaced-tests`), typed in `Rules`. Scoping one off is a native config (`{ files: ["src/utils/is*.ts"], rules: { "auaust/no-runtime-typeof": "off" } }`), and the project's own `no-restricted-syntax` and `no-restricted-properties` no longer replace engrenage's restrictions. `Array.isArray` is now also reported when destructured or accessed with brackets.
  
  `ConfigInput` accepts callback arguments. Validation errors from a union now name the failing nested key.
  
  **Breaking:**
  
  - `createEslintConfig` now takes `(config: ResolvedConfig, options?: Options)` instead of `Conventions`; the `Conventions` type is removed.
  - `createBaseRules`, `createImportRules`, `createStylisticRules`, `createRestrictedSyntaxRules` and `createPromiseRules` are removed: use `defineEslintConfig` options.
  - `filesIn(directory, codeFiles)` takes the code files glob.
  - Restriction reports and `eslint-disable` comments use the `auaust/…` rule IDs instead of `no-restricted-syntax` and `no-restricted-properties`.
  - `syncBlocks(content, syntax, fillers)` takes a record of fillers keyed by directive instead of one fill function.
  - `restrictImports`, `restrictProperties`, `restrictSyntax` and the `ImportPattern`, `RestrictedProperty` and `SyntaxRestriction` types are removed: each restriction is its own `auaust/*` rule, and `Rules` types the options of `no-restricted-imports`, `no-restricted-properties` and `no-restricted-syntax`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `createTsdownConfig` builds ES modules only: it sets `format: "esm"` and resolves bundled dependencies through their `module` field before `main`.
  
  **Breaking:**
  
  - A `package.json` without `"type": "module"` fails the build.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `files.fixtures` is matched inside each test directory, and the resolved `config.files.fixtures` lists the resulting root-relative globs (`tests/**/fixtures/**` by default). ESLint ignores and Vitest excludes the same files.
  
  **Breaking:**
  
  - Vitest no longer excludes fixture directories outside the test directories.
  - `config.files.fixtures` is a list of globs instead of a single glob.
  - `filesIn` moves from `@auaust/engrenage/eslint` to the root entry.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - tsdown entries skip tsconfig path aliases that are neither the package name nor one of its subpaths (`~/*`, `@/*`, `$lib/*`) instead of failing, so projects with internal aliases can build. Those aliases keep resolving from the tsconfig in TypeScript, tsdown and Vitest. The package's own aliases are still validated.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - `directories.coverage` (default `coverage`) sets the coverage directory: Vitest writes its reports there, ESLint ignores it, and the `project` ignore preset lists it in `.gitignore` and `.prettierignore`. File names shared across tools, package names and the `package.json` types (`PackageType`) live in the root constants.
  
  **Breaking:**
  
  - `@auaust/engrenage/config/constants` drops `coverageDirectory` (now `defaultCoverageDirectory`), `configFileName`, `packageFile` and the `default…File` names of `tsconfig.json`, `tsconfig.dist.json`, `.gitignore` and `.prettierignore`, which move to the root constants as `engrenageConfigFile`, `packageFile`, `tsconfigFile`, `distTsconfigFile`, `gitignoreFile` and `prettierignoreFile`.
  - The root constant `changesets` is renamed `changesetsCli`.
  - `@auaust/engrenage/git/constants` drops `coverageIgnores`, and the `defaults` ignore preset no longer lists the coverage directory.

- [`be428e8`](https://github.com/AUAUST/lib-js-engrenage/commit/be428e8d2acb017362ab868f904c8d3c094059e1) Thanks [@apademide](https://github.com/apademide)! - Add the `gitignore` and `prettierignore` targets to `engrenage sync`, which fill `# @ignore <preset>` blocks in `.gitignore` and `.prettierignore`. A block runs until the next marker, so consecutive presets share one `# @end`. Lines outside the blocks stay as they are, and a file without markers is left untouched. An unknown preset fails with an error naming the marker and the file. Each preset writes one or more titled groups, each under a `# <Title>` comment and separated by blank lines.
  
  Both files offer a `defaults` preset with their fixed groups and a `project` preset with the groups inferred from the config:
  
  - `.gitignore`:
    - `defaults`: `JavaScript` (`node_modules`, pnp and pnpm store files, `*.tgz`, `*.tsbuildinfo`, `.eslintcache`, npm and pnpm debug logs), `Package locks` (the lockfiles of other package managers, never `pnpm-lock.yaml`), `Operating systems` (macOS and Windows metadata files), `Environment` (`.env` and `.env.*`, except `.env.example`), `Logs` (`/logs`, `*.log`) and `Editors` (JetBrains, Fleet, Nova, Sublime Text, Vim swap and Visual Studio files; `.vscode` stays project-owned, since the `vscode` target syncs files there). Each group is also its own preset: `javascript`, `lockfiles`, `os`, `env`, `logs`, `editors`.
    - `project`: `Output` (the tsconfig `outDir`) and `Coverage`, anchored to the root.
  - `.prettierignore`:
    - `defaults`: `Package locks` (the `.gitignore` group plus `pnpm-lock.yaml`) and `ESLint suppressions`.
    - `project`: the same `Output` and `Coverage` groups as `.gitignore`, `Changelog` when the project depends on `@changesets/cli`, and `Codegen` with `files.generated` anchored to the root.
  
  The new `@auaust/engrenage/git` entry exports `syncGitignoreFile`, and `@auaust/engrenage/git/constants` its groups. `@auaust/engrenage/prettier` exports `syncPrettierignoreFile`, and `@auaust/engrenage/prettier/constants` its groups, which extend the git ones. `@auaust/engrenage` exports the shared `syncIgnoreFile` with its `IgnorePresets` and `GlobGroup` types. The new `files.prettierignore` config key (default `.prettierignore`) points to the Prettier ignore file.
  
  The resolved config gains `directories.output`, the tsconfig `outDir` when it lies inside the project root. `files.generated` now holds only the configured globs: ESLint adds `coverage/**` and `directories.output` to its ignores itself, so linting ignores the same files as before.

- [`ee88308`](https://github.com/AUAUST/lib-js-engrenage/commit/ee88308e303a980897ab329742b7c8b988a87c37) Thanks [@apademide](https://github.com/apademide)! - Add the `importOrder`, `exportOrder` and `noUnused` conventions to the ESLint `imports` category, all autofixable.
  
  - `importOrder` (eslint-plugin-perfectionist) groups imports by source, separated by blank lines: side-effect imports, Node builtins, packages, then project imports (subpath `#…`, internal and relative). Within each group, value imports come before type-only imports, and paths are sorted naturally. Inside braces, values come before types.
  - `exportOrder` sorts exports naturally with values before types. Comments split exports into separate sections that are sorted independently, so generated blocks stay intact.
  - `noUnused` (eslint-plugin-unused-imports) removes unused imports.
  
  `support codegen barrels` now writes re-exports in the same natural order.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - `importOrder` reads the project tsconfig, so imports through any path alias (`$lib/…`, `§/…`) sort with the project imports instead of the packages. Imports are classified with TypeScript's module resolution.
  
  `Convention.rules` and the `rules` of `defineConvention` accept a function of the resolved config, for rule options that depend on the project.

- [`9c59743`](https://github.com/AUAUST/lib-js-engrenage/commit/9c597431b34d32d859e64d1fc3eaa6d679c80231) Thanks [@apademide](https://github.com/apademide)! - Two new shared agent rules describe the AUAUST helper libraries:
  
  - `@auaust/engrenage/agents/rules/prefer-toolkit.md` covers the `@auaust/toolkit` conventions: object helpers instead of `Object.*`, `isArray`, `isNull`/`isUndefined` only as callbacks, subpath entries, `is<Type>` helpers, and preferring toolkit when primitive-kit provides the same helper.
  - `@auaust/engrenage/agents/rules/prefer-primitive-kit.md` covers the `@auaust/primitive-kit` conventions: subpath entries, and helpers over native methods with an equivalent.
  
  A project that depends on a library references its rule from `.claude/rules/`, so the rule is either present and strict or absent.
  
  **Breaking:** `code-style.md` and the `auaust-libraries` section no longer mention toolkit or primitive-kit. Projects using these libraries must reference the new rules to keep that guidance.

- [`7e49ec9`](https://github.com/AUAUST/lib-js-engrenage/commit/7e49ec9f1e2ae74fbdef944f5b4fae391905213d) Thanks [@apademide](https://github.com/apademide)! - Add the `library.json` and `library.dist.json` tsconfig presets. `library.json` extends `base.json` and places `outDir` and `rootDir` in the consuming project. `library.dist.json` type-checks `tests/**/*.ts` and every `env.d.ts` against the built package; extend it after the project's own tsconfig (`"extends": ["./tsconfig.json", "@auaust/engrenage/tsconfig/library.dist.json"]`).
  
  **Breaking:** `base.json` now sets `declaration: false`, so running `tsc` directly no longer writes `.d.ts` files next to sources. Build tools that generate declarations must enable them explicitly (for tsdown: `dts: { compilerOptions: { declaration: true } }`).

- [`426e165`](https://github.com/AUAUST/lib-js-engrenage/commit/426e165bf3ebc79789ea4b60643b95e88e4161ed) Thanks [@apademide](https://github.com/apademide)! - `engrenage sync workflows` (`syncWorkflowFiles` from the new `@auaust/engrenage/github` entry) writes the GitHub Actions workflows of a workflow set into `.github/workflows/`. Each file starts with a generated header and is overwritten as a whole. A project uses the set named after one of its presets, provided it declares the set's required packages. The new `github.workflows` config key picks a set explicitly, or turns the workflows off with `false`. `@auaust/engrenage/github/constants` exports `workflowSets`, and the templates ship as `@auaust/engrenage/github/workflows/<set>/*.yml`.
  
  The `library` set needs `@changesets/cli` and the `ci:check`, `ci:test`, `ci:build` and `ci:publish` scripts; sync fails when `package.json` does not declare one of them.
  
  - `ci.yml` runs on pull requests and on pushes to branches other than `main`. It installs with `--frozen-lockfile`, then runs `ci:check`, `ci:test` and `ci:build` as separate steps.
  - `publish.yml` runs on pushes to `main`. It runs the same steps, then `changesets/action` with `ci:publish`, and declares `id-token`, `contents` and `pull-requests: write`.
  - Node is set up with `node-version-file: package.json`, so the project declares its CI Node version in `devEngines.runtime` (or `engines.node`). pnpm comes from `devEngines.packageManager`.
  
  `PackageJson` exposes `scripts`.

- [`e73fece`](https://github.com/AUAUST/lib-js-engrenage/commit/e73feceade383e7e1271ba2fc9ef2f8f0d2b2f53) Thanks [@apademide](https://github.com/apademide)! - Report `*.test.*` and `*.spec.*` TypeScript files outside the test directories in `createEslintConfig` and `createRestrictedSyntaxRules`, which now accepts `testDirectories` (default `["tests"]`). Export the `testFiles`, `testDirectories` and `misplacedTestRestriction` configuration values from `@auaust/engrenage/eslint`.

- [`fc32d19`](https://github.com/AUAUST/lib-js-engrenage/commit/fc32d19cb8ee56a5aa7781faf62e9b609ae2c565) Thanks [@apademide](https://github.com/apademide)! - Native configs passed to `defineTsdownConfig` and `defineEslintConfig` can be callbacks, like those of `defineViteConfig` and `defineVitestConfig`: `(inlineConfig, context, engrenage) => config` for tsdown and `(engrenage) => config` for ESLint, sync or async. A callback returning nothing adds no config.

- [`ee88308`](https://github.com/AUAUST/lib-js-engrenage/commit/ee88308e303a980897ab329742b7c8b988a87c37) Thanks [@apademide](https://github.com/apademide)! - Add the `noLooseEqual` convention to the ESLint `comparisons` category: strict equality is required except for `== null`, `typeof` comparisons and comparisons between two literals (`eqeqeq: ["error", "smart"]`).

- [`ae85512`](https://github.com/AUAUST/lib-js-engrenage/commit/ae8551214a937b5af32ea75b45abcdef546e9a07) Thanks [@apademide](https://github.com/apademide)! - New `imports.noUnusedVariables` convention: unused local variables, functions and types are reported as warnings (`unused-imports/no-unused-vars`), so imports only they use can be removed too. The VS Code sync shows them as info through `eslint.rules.customizations`. Turn it off with `imports: { noUnusedVariables: false }`.

- [`fc32d19`](https://github.com/AUAUST/lib-js-engrenage/commit/fc32d19cb8ee56a5aa7781faf62e9b609ae2c565) Thanks [@apademide](https://github.com/apademide)! - The ESLint config now lints every `package.json` with eslint-plugin-package-json: top-level keys follow the sort-package-json order (`package-json/order-properties`), and `config`, `dependencies`, `devDependencies`, `optionalDependencies`, `overrides`, `peerDependencies`, `peerDependenciesMeta` and `scripts` are sorted (`package-json/sort-collections`). `exports` keeps its order, since tsdown generates it. Both rules are autofixable and typed in `Rules`. The `packageJson: false` option turns them off.

- [`ae85512`](https://github.com/AUAUST/lib-js-engrenage/commit/ae8551214a937b5af32ea75b45abcdef546e9a07) Thanks [@apademide](https://github.com/apademide)! - `package-json/order-properties` now follows the sort-package-json order with `bin` and `scripts` moved right after `type`, and `inlinedDependencies` right after `devDependencies`. `sort-collections` now sorts `inlinedDependencies` (it listed the misspelled `inlineDependencies`).

- [`cacf66f`](https://github.com/AUAUST/lib-js-engrenage/commit/cacf66f6c3a9eb46a73db87efa04d1bb325e1ce6) Thanks [@apademide](https://github.com/apademide)! - Add the `@auaust/engrenage/config` entry and its `engrenage.config.ts` project file, which holds globally relevant values: `directories` (`source`, `test`), `files` (`code`, `test`, `fixtures`, `config`, `discovered`, `generated`, `gitignore`, `tsconfig`) and `agents` (`instructionFiles`, `snippetsDirectory`). `defineConfig` types the file and accepts either the config object or a callback returning it, sync or async. That input shape is exported as `ConfigInput<Data>` from `@auaust/engrenage`, for every `define…Config` to share. `loadConfig(cwd?)` looks for `engrenage.config.*` in the current directory only (no upward search, no `.config/` directory), warns once and falls back to defaults when it is missing, and rejects unknown keys with an error naming the file and each key path. `loadConfig` reads no project file besides `engrenage.config.*`: it validates it and locates `package.json`, `files.tsconfig` (`tsconfig.json` by default) and `files.gitignore` (`.gitignore` by default). A configured file that does not exist fails, even under its default name; a missing default file resolves to `undefined`. The resolved config holds `root`, `raw` (the validated config as written, without defaults), the absolute `packageJsonPath`, `tsconfigPath` and `gitignorePath`, and `resolve()`, which resolves a path against the root and rejects paths escaping it. Everything else is a lazy, memoized getter, so a file is only read when a value needs it: `directories`, `files` and `agents` merge the defaults with the config; `files.generated` defaults to an empty list. `packageJson` (`manifest`, `name`, `imports`) and `tsconfig` (`compilerOptions` with `extends` and `${configDir}` resolved by TypeScript, root-relative `outDir`, `paths`) expose strict accessors that fail when the file or the field is missing, mirrored under `optional` by accessors returning `undefined` instead; invalid values fail in both. `PackageJson` and `Accessors` are exported from `@auaust/engrenage/config`, and `Tsconfig` from `@auaust/engrenage/typescript`. `c12` and `valibot` are now runtime dependencies.
  
  `engrenage agents sync` reads `agents.instructionFiles` from the config. A bare reference first resolves inside `agents.snippetsDirectory` when the file exists there, then as a package specifier. An unresolved reference fails, naming the reference and the file. `resolveAgentReference` is exported from `@auaust/engrenage/agents`.
  
  **Breaking:**
  
  - `engrenage agents sync` drops `--root`: run it from the project root.
  - `syncAgentFiles` now takes `{ config, check }`, where `config` comes from `loadConfig`, instead of `{ root, check }`.
  - `@auaust/engrenage/eslint` no longer exports `baseRules`, `importRules`, `promiseRules`, `stylisticRules`, `syntaxRestrictions`, `sourceSyntaxRestrictions`, `restrictedProperties`, `misplacedTestRestriction`, `testDirectories`, `testFiles`, `toolConfigFiles` or `typescriptFiles`. The global values are now the defaults of `directories.test`, `files.test`, `files.config` and `files.code`.
  - `@auaust/engrenage/agents` no longer exports `agentFiles` (now the default of `agents.instructionFiles`) or `markdownBlocks`.
  - `@auaust/engrenage/typescript` no longer exports `barrelFiles` or `typescriptBlocks`.
  - `@auaust/engrenage/prettier` no longer exports `prettierOptions` by name: use its default export.
  - `@auaust/engrenage` no longer exports `resolvePath`, now an internal helper, or `resolveReference`: use `resolveAgentReference` from `@auaust/engrenage/agents`.
  - The shipped data files move from `config/` to `data/` in the package. The public paths `@auaust/engrenage/tsconfig/*.json` and `@auaust/engrenage/agents/{rules,sections}/*.md` are unchanged.

- [`e569309`](https://github.com/AUAUST/lib-js-engrenage/commit/e56930922099566c5a2ef9d6e4b1a83af2f36309) Thanks [@apademide](https://github.com/apademide)! - The resolved config exposes `environment`, a lazy view of the packages the project declares. `config.environment.hasDependency(name)` is true for every package listed in the `dependencies`, `devDependencies`, `peerDependencies` or `optionalDependencies` of `package.json`, and for the package's own name. It is always false without a `package.json`. The new `packageJson.dependencies` accessor lists those package names, and an invalid dependency field fails with the field name. `Environment` is exported from `@auaust/engrenage/config`, and `PackageNames` from `@auaust/engrenage`.
  
  ESLint conventions can declare `requires`, a list of package names. Such a convention is on by default only when the environment has every one of them, on top of its presets. ESLint options still turn it on or off individually or by category.
  
  **Breaking:** library-specific conventions now require their library.
  
  - `noObjectStatics`, `noArrayIsArray`, `noIsNull`, `noIsUndefined` and `noToolkitRoot` require `@auaust/toolkit`.
  - `noPrimitiveKitRoot` requires `@auaust/primitive-kit`.
  - `noValibotNamespace` requires `valibot`.
  - `noZodClassic` and `noZodNamespace` require `zod`.
  
  A project that does not declare a library no longer gets these conventions unless its options enable them explicitly.

- [`a8cb7e0`](https://github.com/AUAUST/lib-js-engrenage/commit/a8cb7e0ee36dd3f76f3e93c8cab93df8fdcdc521) Thanks [@apademide](https://github.com/apademide)! - `engrenage.config.ts` accepts `presets`, a list of built-in preset names (for now only `"library"`), resolved as `config.presets` (default `[]`). The names live in `presets` from `@auaust/engrenage/config/constants`, and `Preset` and `Presets` are exported from `@auaust/engrenage/config`. ESLint conventions can list the presets that enable them: such a convention is on by default only when one of its presets is active, and ESLint options still turn it on or off individually or by category.
  
  A new `performance` ESLint category holds conventions enabled by the `library` preset in source directories: `noToolkitRoot` and `noPrimitiveKitRoot` report root imports of `@auaust/toolkit` and `@auaust/primitive-kit` in favor of their subpath entries, `noValibotNamespace` reports `import * as v from "valibot"`, `noZodClassic` reports imports of `zod` in favor of `zod/mini`, and `noZodNamespace` reports namespace, default and `z` imports from `zod/mini` in favor of named imports.

- [`d8c34cf`](https://github.com/AUAUST/lib-js-engrenage/commit/d8c34cfc32475bc7d04adae6f43dc6d2627749da) Thanks [@apademide](https://github.com/apademide)! - **Breaking:**
  
  - `@auaust/engrenage/typescript` no longer exports `readSubpathImports`: read `config.packageJson.imports` from `loadConfig` instead.
  - `syncBarrels` now takes `{ config, barrels, check }`, where `config` comes from `loadConfig`, instead of `{ root, barrels, check }`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - List inputs engrenage never mutates are typed read-only: the native configs of the definers, `syncBarrels` barrels, `createTsdownEntries` path aliases and the tsdown `bundle` option. `ScopeReferences` and `PathAliases` name the read-only lists of `ScopeReference` and `PathAlias`, and `resolvePathAliases` returns `PathAliases`.

- [`b35fddb`](https://github.com/AUAUST/lib-js-engrenage/commit/b35fddbf84bfc18cc567e5fc78f67e248cf7edad) Thanks [@apademide](https://github.com/apademide)! - **Breaking:**
  
  - `@auaust/engrenage/vite` drops `createViteAliases` and the `Alias` type: Vitest resolves sources through Vite's `resolve.tsconfigPaths`.
  - `PathAlias` drops `alias`, keeping the `name` and `path` tsdown entries need.

- [`a55620d`](https://github.com/AUAUST/lib-js-engrenage/commit/a55620dc31ef16ea94e6aee9f3af39f3353e5d4f) Thanks [@apademide](https://github.com/apademide)! - `createVitestConfig` sets `test.isolate: false`, so test files share workers instead of each starting its own, and `test.restoreMocks: true`, so spies and mocks are restored after each test instead of leaking into the next files.
  
  **Breaking:**
  
  - Tests that rely on a fresh module state per file, or on a mock surviving past the test that created it, must restore that state themselves or opt back in with `test.isolate: true` or `test.restoreMocks: false` through a native config passed to `defineVitestConfig`.

- [`eb5f20a`](https://github.com/AUAUST/lib-js-engrenage/commit/eb5f20a3cc2a53b90e924ce0e0f7127aeb184147) Thanks [@apademide](https://github.com/apademide)! - Remove the `engrenage codegen barrels` command from the published CLI: it only served this package's own sources and now runs as an internal command. `syncBarrels` stays exported from `@auaust/engrenage/typescript`.

- [`65a9c7b`](https://github.com/AUAUST/lib-js-engrenage/commit/65a9c7b2f29e4ed0354ba6c21fae43d4a62e9eb5) Thanks [@apademide](https://github.com/apademide)! - Add tool proxy commands that run each tool with the flags the engrenage setup implies. They resolve the tool from the project (an optional peer dependency) and fail with the package to install when it is missing. The tool's exit code or signal becomes engrenage's.
  
  Further arguments are passed to the tool, `--help` included. Each proxy only adds the flags you did not give: `engrenage prettier --check` checks instead of writing, `engrenage tsc -p other.json` keeps your project, and options after `--` are left alone.
  
  | Command             | Runs                                                                |
  | ------------------- | ------------------------------------------------------------------- |
  | `tsc` (`typecheck`) | `tsc --noEmit --project <files.tsconfig>`                           |
  | `tsc:dist`          | `tsc --noEmit --project <files.distTsconfig>`                       |
  | `vitest`            | `vitest run --typecheck`                                            |
  | `vitest:watch`      | `vitest watch --typecheck`                                          |
  | `vitest:coverage`   | `vitest run --coverage`                                             |
  | `vitest:dist`       | `vitest run --typecheck --mode build`, which tests the built output |
  | `tsdown`            | `tsdown`                                                            |
  | `vite`              | `vite`                                                              |
  | `eslint`            | `eslint --cache --cache-location node_modules/.cache/eslint`        |
  | `prettier`          | `prettier --write --ignore-unknown`, unless a mode is given         |
  | `prettier:check`    | `prettier --check --ignore-unknown`, dropping `--write`             |
  | `prettier:all`      | `prettier --write --ignore-unknown <root>`                          |
  
  The `PackageJson` model exposes the manifest's `bin` field.

- [`5db58e0`](https://github.com/AUAUST/lib-js-engrenage/commit/5db58e0184ab04629bdb7454c050e9bab72a2e10) Thanks [@apademide](https://github.com/apademide)! - **Breaking:** tsconfig presets move from `@auaust/engrenage/typescript/presets/*.json` to `@auaust/engrenage/tsconfig/*.json` (for example `@auaust/engrenage/tsconfig/base.json`). `@auaust/engrenage/typescript` now holds only TypeScript helpers.

- [`6fa23b4`](https://github.com/AUAUST/lib-js-engrenage/commit/6fa23b4a8c6b6e63cacd242f1eceabc03e5cb370) Thanks [@apademide](https://github.com/apademide)! - Add the `@auaust/engrenage/tsdown` entry. `defineTsdownConfig(options | (inlineConfig, context, engrenage) => options, ...configs)` loads `engrenage.config.ts` and returns a tsdown config function, so `tsdown.config.ts` can export it directly. It builds the shared AUAUST library build from the resolved config: one entry per tsconfig `paths` alias (`createTsdownEntries`), `outDir` and `tsconfig` from `files.tsconfig`, declarations and source maps, generated `exports`, publint, attw (`node16` profile, `attwOptions` in `@auaust/engrenage/tsdown/constants`), and `failOnWarn` and `minify` in CI. In CI, the build fails when it changes `package.json`, so stale exports cannot be published. Native configs are merged last with tsdown's `mergeConfig` (objects merge, arrays concatenate). Options:
  
  - `bins`: extra entries (`{ "bin/engrenage": "bin/engrenage/index.ts" }`), excluded from `exports`; a bin that shadows a package entry fails;
  - `customExports`: file exports added to the generated `exports` (`{ "./tsconfig/*.json": "./data/tsconfig/*.json" }`);
  - `bundle`: the only dependencies allowed in the bundle, none by default.
  
  `createTsdownConfig(config, { ci }, options?)` builds the same config without loading it. The `InlineConfig` and `ConfigContext` types name tsdown's config function arguments. `tsdown` is now an optional peer dependency.

- [`0bd357a`](https://github.com/AUAUST/lib-js-engrenage/commit/0bd357a5d376d8a6d6a8f3bd7a4020b8dcceed9e) Thanks [@apademide](https://github.com/apademide)! - Type `Rules` from the schemas of ESLint core and every plugin the shipped configuration registers (`@typescript-eslint`, `import-x`, `@stylistic`), so rule names autocomplete and rule options are checked. Each source is also exported on its own (`CoreRules`, `TypescriptEslintRules`, `ImportXRules`, `StylisticRules`). Projects using other plugins can type their rules by augmenting `Rules` from `@auaust/engrenage/eslint`; unknown rule names remain accepted.

- [`c2f9985`](https://github.com/AUAUST/lib-js-engrenage/commit/c2f9985a89157c883ddb61cdc211c438e892df12) Thanks [@apademide](https://github.com/apademide)! - Add `defineViteConfig` to `@auaust/engrenage/vite` and the `@auaust/engrenage/vitest` entry.
  
  - `defineViteConfig(...configs)` loads `engrenage.config.ts` and returns a Vite config function. Each native config is an object or a `(env, engrenage) => config` callback, merged in order with Vite's `mergeConfig` over the project defaults from `createViteConfig(config)`: `root`, `tsconfig` from `files.tsconfig`, and `build.outDir` from the tsconfig `outDir`.
  - `defineVitestConfig(options?, ...configs)` does the same on top of the Vite defaults, with options given as an object or a `(env, engrenage) => options` callback, so it works in `vitest.config.ts` and `vite.config.ts` alike. `--mode build` tests the build output with the dist tsconfig and no aliases. Any other mode tests sources: imports resolve through the tsconfig `paths` (Vite's `resolve.tsconfigPaths`), and a resolve guard fails when an import of the package itself resolves into `outDir`, comparing real paths so symlinked projects are guarded too (disable it with `{ guardOutDir: false }`). Both modes pass the chosen tsconfig to Vite and to `test.typecheck`, exclude `files.fixtures` from the tests and default the coverage provider to `istanbul`, which consumers install only to run coverage. `createVitestConfig(config, env, options?)` and `createOutDirGuard` build the same pieces without loading the config; `buildMode` is in `@auaust/engrenage/vitest/constants`.
  - The root config gains `files.distTsconfig`. Without it, `tsconfig.dist.json` is used when present, else the tsconfig; a configured file that does not exist fails. The resolved config exposes it as `distTsconfigPath`.
  
  `vitest` is now an optional peer dependency.

### Patch Changes

- [`d692c46`](https://github.com/AUAUST/lib-js-engrenage/commit/d692c4678afa3d1bb2cead5253a10eda5ba66571) Thanks [@apademide](https://github.com/apademide)! - - `loadConfig` retries a load that failed instead of caching the error.
  - A tsconfig that matches no file yet still exposes its compiler options.
  - Subpath imports with conditional targets resolve through their `default` condition, and targets with several `*` fail instead of being skipped.
  - Path aliases outside the package name, wildcard aliases without exactly one `*` on each side fail with a message instead of producing broken tsdown entries, and targets only match files.

- [`0cc2063`](https://github.com/AUAUST/lib-js-engrenage/commit/0cc20635b3c01e99d95a2af544107125e6a2f73d) Thanks [@apademide](https://github.com/apademide)! - A tsconfig `outDir` outside the project root no longer breaks the resolved config: `tsconfig.outDir` stays relative to the root (`../build`) and is left out of ignored files. An `outDir` equal to the root now fails, naming the tsconfig.

## 0.0.1

### Patch Changes

- [`60a24eb`](https://github.com/AUAUST/lib-js-engrenage/commit/60a24eb43b3616cdb5bb53d2f8673d8df4064d96) Thanks [@apademide](https://github.com/apademide)! - Initial release of shared tooling configuration for AUAUST projects.

  - ESLint flat config builder with AUAUST base, import, stylistic, promise and restricted-syntax rules
  - Prettier config, usable directly as the `prettier` key or extended through a builder
  - Base tsconfig preset (`@auaust/engrenage/typescript/presets/base.json`)
  - Turns tsconfig `paths` into Vite aliases
  - Shared AGENTS.md sections and `.claude/rules` files, kept up to date in consuming projects through `@reference` blocks
  - `engrenage` CLI: `agents sync` syncs agent instruction files, `codegen barrels` generates `index.ts` barrels; both support `--check` for CI
