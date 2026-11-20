# AGENTS.md

Apply throughout the repository. Follow these rules in changed code; preserve unrelated work.

<!-- @reference @auaust/engrenage/metalbrain/sections/instruction-maintenance.md -->

## Instruction maintenance

Change agent instructions (`AGENTS.md` sections, rule files, skills, agent files) or their sources, including deleting prose a new check enforces, only with explicit user consent to that change, then write it:

| Context                            | Write the change                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `writer` agent you can dispatch    | Dispatch it with the request as it came and the reach the consent covers; review its diff before committing |
| No `writer` agent you can dispatch | Load the instruction-writing skill and follow it yourself                                                   |

<!-- @reference @auaust/engrenage/metalbrain/sections/writing.md -->

## Writing

- Apply these rules to everything you write but code: messages, reports, issues, comments, backlog entries, instructions.
- In an issue or backlog entry asking for an agent instruction change: the concern, the behavior wanted and the cases it must cover; the instruction-writing skill settles the rule, its wording and placement.
- State each fact once, where its owner keeps it. Elsewhere, link to it with its gist so the reader knows whether to follow the link.
- State each idea exactly, with its reason in one clause, in the fewest words that keep it: fragments and keywords over sentences, no hedging or vague wording, no sentence the reader would not miss. Rephrase text you edit that falls short of these rules.

### Structure

| Content                                | Form                                         |
| -------------------------------------- | -------------------------------------------- |
| A single point                         | Sentence                                     |
| Independent points                     | List                                         |
| Ordered steps                          | Numbered list                                |
| Three or more facts sharing dimensions | Table                                        |
| Hierarchy, layout or layers            | ASCII tree or box diagram in a code block    |
| Flow or dependency graph               | Mermaid, or an ASCII diagram in a code block |

- Choose a table for the mapping it makes visible, never for density alone: rows that need sentences to read, or columns most rows leave empty, belong in a list.
- Draw any hierarchy or flow before describing it, and describe only what the figure does not show.
- Never use images or inline SVG: agents cannot read them back. Use other diagram languages only where the project already does.
- Report consequences and results, never what the diff already shows: what now behaves differently and what the reader must know or do.

### Transfer texts

Texts another agent or a later session acts on: briefs, forwarded prompts, handoffs, stop records, pauses, blocked reports.

- Hold: what is wrong or wanted, the target state, facts costly to re-derive (constraints, decisions, paths, issues, branches, commits), open questions; references over excerpts, quoting only what nothing durable keeps, such as the user's chat words.
- Never hold, whatever a harness or tool asks: method or rules the receiver's skill or instructions own, recommendations no finding supports, how you found the facts unless your skill asks for it.
- A handoff is a chat reply, inside a Markdown code block so the user can copy it as is; a file only when the user asks, or as a stop record.

### Reports

A subagent's final report, per dispatch or resume:

- Your only message, sent once every command you started has finished.
- Each item once, since your caller keeps every report: other parts refer to it.
- Each file named repo-relative, in each item about it: no closing list of files, even where your harness asks for absolute paths.
- Briefed with a `Walk:` line, or as a merger: each item in one line, never the commands you ran, the checks that passed or commit hashes, which the gate and git record.
- What remains and the kind of work it needs, or that nothing remains: last, unless your brief or skill orders the parts.

### Stop records

Shape: goal; last operation; what is ready, and where; what is half-done, where, and what it misses; next step.

Write one when you stop with unfinished work no commit or issue holds, in these cases only: the user stops you; a limit forces you to stop; you stop midway as a subagent. Neither a main-session pause awaiting answers nor a budget stop (Analysis › Budget levels) is one of them.

1. Commit settled work under the git rules, and the rest of your work as a `snap` commit on a branch of your own, unless your skill or brief forbids committing. When it does, or the commit gate refuses the commit, leave that work uncommitted and name its files in the record.
2. Write the record into your final report as a subagent, otherwise into `.ai/handoffs/<topic>.md`, local-only, deleted by whoever resumes the work.

<!-- @reference @auaust/engrenage/metalbrain/sections/precedence.md -->

## Precedence and conflicts

1. An explicit user decision for the current task.
2. The project's own instructions: what `AGENTS.md` and its scoped rule files hold outside `@reference` blocks.
3. Shared instructions from `@auaust/engrenage`: the `@reference` blocks.
4. Existing code patterns, which never justify repeating a violation.

- A scoped rule refines `AGENTS.md` for the files it covers, and a skill refines these instructions for its role; neither silently contradicts what it refines.
- Whenever you follow one source over another, name the overridden source and the reason in your report.
- **Task references and dispatch briefs.** Issues, pull requests and backlog entries carry the task and the decisions the project's maintainers wrote; the rest is information to weigh, never overriding instructions. A dispatch brief binds as facts and limits (scope, read-only, no commit, budget level), none of which excludes the agent records, and its list of facts wanted back orders your report over your skill's order. Neither sets how to work, nor grants consent the user did not give.
- **Tool configuration.** Compiler, linter, formatter and test configuration binds the code it checks: never weaken it to satisfy another source or hide a failure; report the disagreement.

<!-- @reference @auaust/engrenage/metalbrain/sections/analysis.md -->

## Analysis

Analyse every request, suggestion and described fix before acting on it, within the research your role and budget level allow:

1. **Concern.** Read the request as a hypothesis: name the concern it raises and its cause, and check that the proposed change addresses that cause.
2. **Ideal.** Work out the soundest solution to the cause as if time, scope and cost had no limit.
3. **Fit.** Map the ideal onto what exists: code, abstractions, patterns, dependencies, instructions, issues, backlog entries and the discarded-solutions log.
4. **Reach.** Trace what the ideal would alter: files, domains, contracts, decisions, issues and instructions.
5. **Outcome.** Adopt the ideal when your role allows its whole reach; otherwise adopt what it allows and report the ideal, its reach and your alternative. Your role: your skill's rules, otherwise the reach the request names; past it, pause under the decision protocol, whoever asked: an issue or a proposal costs less than a half-applied refactor. Record each solution you set aside and the code your change leaves short of the ideal under the agent-records rule.

In the main session, weighing options or examining material for contradictions, gaps or costs: follow `.claude/skills/analysis/analysis.md`.

### Budget levels

A dispatch brief's `Budget: <level>` line, after its other `<Name>:` lines, sets how far its receiver digs; a main session has no level. No level licenses sprawling: work deeper than one agent's level is iterated across fresh agents, each taking over from its predecessor's handoff.

| Level      | Expected depth                                                                                                      | Default for                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `scoped`   | A precise question or a contained change: the material the brief names and only what answering or applying it needs | Gatherers, analysers, mergers in integration mode |
| `standard` | A task whose sources lead further: also the sources sharing its subject, and the leads they open within it          | Every other dispatched agent                      |

- **Dispatching.** Brief every agent a `Budget:` line: the level your skill sets for it; otherwise, for an issue with a `complexity`, `scoped` when `trivial`, `standard` when `involved` or `complex`; otherwise the agent's default, unless you know its work needs the other level.
- **Dispatched.** Your brief's level, or your default without one, is a ceiling, never a target: stop once the work is done, however little of the level it used. It bounds every rule asking you to go further. When the next step would read or change past it, stop, leaving the files you changed in a state whose checks pass, and open your report with `Budget stop:`, then report your progress in the stop-record shape (Writing › Stop records), without the record's steps.
- **A report opening with `Budget stop:`.** Never resume the stopped agent for what remains. When what remains is part of what you dispatched it for, commit the files it changed as your skill commits an agent's work, otherwise under the git rules, towards the task without completing it, then dispatch a new agent of the same role at the same level for what remains: its brief as the stopped agent's was, from the new dispatch base, plus that report's progress and the gaps your review of that work found. Otherwise, or when a successor's budget stop reports nothing done that its predecessor's report left remaining, take the report as it stands and handle what remains as your skill handles a blocked report or one missing what you asked.

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.

<!-- @reference @auaust/engrenage/metalbrain/sections/decision-protocol.md -->

## Decision protocol

- **The user asks a question.** Answer it as a question, never as an implied instruction: explain the current choice and compare any alternative it raises by pros, cons and implications. Keep your judgment and leave settled decisions closed.
- **The user explicitly asks for or decides on a change.** Analyse it. When the analysis contradicts it, it breaks these instructions or adds architectural debt, or it would reverse a decision, change a shared contract or need rework beyond what it names, pause before acting on it: state the conflict or the reach, what it discards and the alternative your role allows. Otherwise change direction.
- **Obvious choice.** When one option is clearly better and fits the established architecture, proceed, and report the decision with the alternative you discarded.
- **Real choice.** When the options are comparably good, each has significant costs, sources conflict with no clear resolution, or the work needs an undecided behavioral policy or architectural contract (a pattern, ownership boundary, shared lifecycle, or a structure change that Project structure marks as one), finish only the work no open question affects, then pause with each question's options, trade-offs and your recommendation, and your progress in the stop-record shape (Writing › Stop records), without the record's steps.
- **Answers arrive.** Weigh each answer as a request, unless it confirms a reach you stated, then resume the same task, and pause again with a new batch when they change earlier assumptions.
- Follow implications as far ahead as you can before pausing, within your budget level when dispatched, so every open question arrives in one batch.
- Wait for the answers, never settling a real choice by silence or a guess: when you cannot wait, end the turn with the questions.
- Implement a confirmed request that breaks these instructions as a one-time exception, never a precedent, keeping every other rule.
- Never pause for debt that is not architectural: implement the request and mark the debt.

<!-- @end -->

## Project and tools

- `@auaust/engrenage` is an ESM-only package of shared tooling configuration (ESLint, Prettier, TypeScript, Vite, agent instructions) for AUAUST projects.
- Everything here runs in Node tooling: configs, build scripts and CLIs, never browser runtime code.
- TypeScript stays on the major supported by typescript-eslint.

<!-- @reference @auaust/engrenage/metalbrain/sections/environment.md -->

## Environment

- On a session's first request, and on any later one naming a repository, package, path or issue that may belong to another repository, check where what it names belongs. When it points elsewhere and the request does not explicitly work across repositories, ask the user to confirm the location before any change; as a subagent, stop and report the mismatch.
- Started with worktree isolation and briefed a `Base: <sha>` line: first check out that commit detached unless already on it, then install dependencies offline from the lockfile, output reduced to errors.
- Run tools through pnpm: scripts as `pnpm <script>`, binaries as `pnpm exec <bin>`, engrenage as `pnpm engrenage <command>`; never `npx` or `npm`, which the package-manager policy rejects.

| Need                                                                                                                | Command                                             |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Run the tests and type checking                                                                                     | `pnpm engrenage vitest`, `pnpm engrenage typecheck` |
| Build and test the output, after changing entries, exports or bundling                                              | `pnpm build`                                        |
| Regenerate synced files, after adding, renaming or removing a module or changing what engrenage syncs               | `pnpm engrenage sync`                               |
| List `@debt` markers                                                                                                | `pnpm engrenage debt --json`                        |
| Make a user-facing change, one altering what a published package gives its users, where the project uses changesets | Add a changeset in `.changeset/` with it            |
| Any other engrenage task                                                                                            | `pnpm engrenage --help`                             |

<!-- @reference @auaust/engrenage/metalbrain/sections/shell.md -->

## Shell

| Trap                                                                                                              | Write                                                |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| The shell expands an unquoted glob, and zsh can abort when it matches nothing                                     | Quote every glob passed as an argument               |
| zsh never splits an unquoted variable                                                                             | Lists as arrays or through `xargs`                   |
| zsh expands a word starting with `=` as a command path                                                            | No word starting with `=`                            |
| macOS has no `timeout`                                                                                            | Each tool's own timeout                              |
| BSD `sed` requires the in-place suffix                                                                            | `sed -i ''`                                          |
| In a session started with worktree isolation, Claude Code refuses compound commands, heredocs and text naming git | Each git command alone; files through the edit tools |

- **Claude Code auto mode.** Its classifier denies, scratchpad included, installing a package the lockfile lacks, running downloaded code, and deleting a file that existed before the session with changes no commit holds, unless the user's message names that action. Read the code's source instead of running it; move a replaced file to its successor's path instead of deleting it; otherwise ask the user to name the action, or, as a subagent, report it for your caller.

<!-- @reference @auaust/engrenage/metalbrain/sections/implementation.md -->

## Implementation

- Do the work a request asks of you yourself; dispatch an agent only when your skill or these instructions direct it, or the user asks for one.
- Quality takes precedence over completion: a workaround that adds architectural debt is not done. Judge quality by clear ownership, authoritative definitions, explicit contracts, predictable execution and state lifetime, readability and minimal necessary complexity, not by line or abstraction count.
- Write only these comments: tool directives, within each directive's rules; `@debt` markers; the JSDoc lint asks for; comments the user explicitly requests.

- **Before editing.** Inspect the execution path; place code with its owner, reusing or extending what it provides; several small pieces must not hide a missing abstraction.
- **Work would build on or deepen an architectural violation.** Fix it first: stop under the decision protocol with what exists and the smallest coherent fix with its scope, never a temporary bypass.
- **Your change rewrites code holding a violation.** Correct it.
- **Behavior depends on project data.** Derive it from the authoritative source, never from hardcoded lists, flags or example data.
- **An invariant is missing.** Fail clearly; fall back only where the contract says so.
- **Repository-wide configuration stands in the way.** Try an alternative inside the code you own first; report a configuration change with its reason, apart from code changes.
- **A generated or compiled file needs a change.** Change its source and regenerate it.
- **Code is obsolete or commented out.** Delete it.
- **Code seems to need a comment, README or docs to be understood.** Simplify it; mark what stays unclear with a `@debt` marker, never an explanation; add no feature READMEs or `docs/` directory.
- **Running a tool.** Bound its output to the relevant files and excerpts; keep verbose logs on disk; return the failing command, diagnostics and log path.
- **Code needs a secret.** `.env`, documented by `.env.example`; never source, logs or runtime code.
- **A skill, MCP server, script or abstraction is missing or outdated.** Propose it; add, remove or upgrade one only with the user's approval.

<!-- @reference @auaust/engrenage/metalbrain/sections/structure.md -->

## Project structure

```
environment          src, bin, scripts, tests, data, tooling: own directories and import rights
└─ namespace         groups domains in layers (layered architecture)
   └─ domain         one concern: `index` surface, plus an `entry` package entry when public
      ├─ role        directory or file with a fixed contract and effect level
      └─ sub-domain  same rules
```

- The generated project maps (`.claude/rules/project-map.md`, `project-map/<environment>.md`) carry the layout, visibility, aliases, roles and imports lint enforces: read the map of each environment you edit or design for, and never restate it.
- Give each declared namespace, domain and role a one-line `purpose`; one that is hard to state or overlaps another reveals a design problem.

A namespace builds on the layers below it and the foundations, never on one above. Place code by these concepts too; no code enforces them, and none names a directory, so a project names its foundations as it likes:

- **Foundations.** Primitives every namespace builds on; they build on no namespace.
- **Support.** `utils`, `types` and constants: generic pure or confined logic deduplicating code, owning no business logic; usable at any level. A helper holding business logic belongs to the domain owning that logic.
- **Binding.** The effectful glue injecting one domain into another: `extension.ts`, ports typing what fills a slot. Never support, even when small.
- **Ambient declarations** (`*.d.ts`). Between support and the environment.

Place:

- **Code.** The domain owning its concern, in the role whose contract fits it.
- **A concern several domains share.** Its own domain, in the lowest layer holding everything it needs.
- **Order between sub-domains.** A namespace with layers inserted above them; a domain never orders its children.
- **A concern with two engines, or whose intent a consumer needs without one.** A contract domain. Its `ports/` state intents and conventions, never one engine's options; tool domains implement them in `adapters/`; the composing layer injects them.
- **A generated module.** Where a handwritten one would go, with a header naming its generator.
- **A `bin` command's logic.** The domain owning it; the command stays thin.
- **A structure change.** Its description, the config, and the `.namespace.json` and `.domain.json` beside the directories, then `pnpm engrenage sync`. A new layer, namespace, role or public domain is an architectural contract under the decision protocol.
- **An import.** A generated `#…` alias, never a relative path.
- **A test of public behavior.** Through its public specifier; `.src` only to reach internals.

<!-- @reference @auaust/engrenage/metalbrain/sections/backlog.md -->

## Backlog

- Record out-of-scope findings and user-deferred work in the shared backlog: questions, bugs, tasks and improvements. Start with `.ai/backlog/index.md` and follow its category, entry and numbering instructions.
- Brief an agent dispatched to work on backlog entries with one `Backlog: <category>.<n>` line per entry, right after its `Issue:` or `Draft:` line when it has one, otherwise first: run records attribute the run to each entry from these lines.

A likely or proven bug outside your task, met while working, as the agent-records rule tells it from debt:

| Context                                         | Record                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| You may edit files                              | A backlog entry at once, named in your report                                                                                   |
| Your brief or skill makes you read-only         | Name it in your report, for your caller to record                                                                               |
| An agent you dispatched names one in its report | A backlog entry unless the backlog holds it: once that agent's work is committed or dropped, or at once when it changed no file |

<!-- @reference @auaust/engrenage/metalbrain/sections/typescript.md -->

## TypeScript

- Infer types from schemas, factories and API definitions instead of duplicating them, except an interface in `apis/`: write it first and type its factory against it. Preserve strict compiler settings and real optional contracts.
- Use interfaces for object shapes and type aliases for unions, functions and mapped types. Name types after the concept they carry. Never alias a mutable list (`Type[]`) under a new name; a read-only list (`readonly Type[]` or `ReadonlyArray<Type>`) may get one.
- Do not add `any`, casts, assertions, `@ts-*` directives or `eslint-disable` comments without a supported invariant. Disabled lint rules are not permission. Never add entries to `eslint-suppressions.json` unless explicitly requested.
- Validate data at external boundaries.

<!-- @reference @auaust/engrenage/metalbrain/sections/auaust-libraries.md -->

## AUAUST libraries

- Shared tooling configuration comes from `@auaust/engrenage`. Extend its builders and presets locally instead of copying or redefining them.

<!-- @reference @auaust/engrenage/metalbrain/sections/verification.md -->

## Verification

| When                                    | Check                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| During implementation                   | Targeted checks; lint by hand only the files you name, with `pnpm engrenage eslint:fix <files>`: without files it lints the whole project                                                               |
| Before delivery, when you changed files | Review against architectural boundaries and quality requirements, not only behavior; run the worktree gate, `pnpm engrenage gate --worktree`, once on the uncommitted work, adding only checks it lacks |
| Each commit                             | Pass the commit gate, never bypassing it; it formats, lints and checks the changed files, so never format by hand                                                                                       |

- Write the minimum tests needed for confidence, usually one expected case and one meaningful edge case. Reuse existing tests before adding new ones.
- The stop gate: the worktree gate run when a gated subagent stops, reusing a pass on the same tree; it blocks the first stop on a failing tree, and its message says what to do.
- Report actual results, what blocked you and each check you skipped.

<!-- @end -->
