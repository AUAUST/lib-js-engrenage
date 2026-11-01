# debt-markers

In-code debt markers: how agents capture them, how they are listed and checked, and how they are harvested into planned work.

## 1. Agents need a cheap, constant way to make technical debt visible.

- Matter: each agent decides locally that a small repetition, inline workaround or misplaced interpretation is not worth stopping for. Every agent makes the same call, so the pattern spreads (for example the same few lines at dozens of sites) without anyone seeing it. The current safeguards do not surface it:
  - "Report relevant nearby inconsistencies" sends findings to the session report, which is lost when the session ends.
  - A backlog entry (category, numbering, completion condition) costs too much for a small observation, so low-effort agents skip it.
  - Asking an agent to judge each instance ("is this a missing abstraction?") gets an honest "no" at every site; repetition is only visible across sites and sessions.
- Goal: any agent, including the lowest-effort model on the smallest task, can report debt as part of the edit it is already making, with no extra tool call, lookup or design work. A later, smarter pass makes sense of all reports at once (see entry 4). No full scan of the codebase is required.
- Settled:
  - Capture is an in-code comment starting with `@debt`, written in the same edit as the code it concerns. It lives with the code, disappears when the code is deleted, avoids conflicts in a shared file, and gives the eventual fix a list of sites to migrate.
  - A note is a plain statement of something that could be better, at whatever level the agent perceives it: "data.dirs could be empty when data is inactive" or "interpretation of config outside the config layer". It proposes no fix and needs no knowledge beyond what the agent already saw. It must not depend on naming an abstraction, choosing a boundary or knowing how another module behaves.
  - Valid triggers include repetition the agent saw in other files, even when each copy is clean and might benefit from a helper; having to read an implementation to use something correctly; and forced workarounds (broken behavior, type issues).
  - Debt is informational: it never fails a check. Only a malformed marker fails, through lint, like any other syntax rule.
  - `engrenage debt` lists markers with their location and note, with `--json` for agents and tools.
  - Markers are a deliberate exception to "avoid code comments" and the shared instructions must say so.
- Done when markers can be written, linted and listed in every engrenage project, the shared agent section tells coding agents when and how to write them, and the questions in entries 2 to 5 are settled.

## 2. Whether markers carry a category from a fixed list.

- Matter: without categories, agents decide on their own what counts as debt and may never consider some kinds (repetition, for one) to be debt. A fixed list names those kinds and so prompts agents to notice them. Candidate list: unobvious helpers, detected repetition, fallback config value outside config, hardcoded default instead of config, workaround for broken behavior, workaround for a type issue.
- Why a list helps: a named kind works as a recognition prompt. An agent that has just written something matching "detected repetition" notices it more readily than when asked an open question about quality.
- Risks that could make it brittle:
  - Fitting cases into boxes: once the list appears exhaustive, agents may read a case that fits no category as not being debt, which is the failure the open format was meant to avoid. A catch-all "other" tends to be ignored or to become a dumping ground.
  - Exhaustiveness is out of reach: the list will miss kinds, and each kind added costs context in every coding session.
  - Overlap: "fallback config value outside config", "hardcoded default instead of config" and "interpretation of config outside the config layer" describe close matters, so agents will choose inconsistently. Categories cannot be trusted as grouping keys; the harvest pass must regroup anyway.
  - Project scope: the list ships to every engrenage project, so it must name kinds any project can have, not one project's layers. "Config layer" may not mean the same thing everywhere.
  - Classification at write time: choosing a category is a small decision, but a decision all the same, which is what capture tries to remove.
- Options:
  - Required category field (`@debt <category>: <statement>`): strongest prompt, strongest box-fitting.
  - Categories as prompts only: the instructions list the kinds as things to watch for, but the marker stays `@debt <statement>`. This keeps the recognition benefit without forcing a classification. The instructions also state that a note matching no listed kind is still welcome.
  - No categories: weakest prompt, no box-fitting.
  - Subject key (`@debt <identifier>: <statement>`, the identifier copied from the code): makes grouping easier without a vocabulary, but adds a field to fill.
- Decision: which option, and if a list is kept, its final wording.
- Done when the marker syntax and the list (if any) are fixed in the shared instructions and the lint rule.

## 3. How the debt guidance reaches agents that write code.

- Matter: the guidance (triggers, syntax and possibly the list from entry 2) must be in context whenever an agent writes code, without adding to every session's context.
- Candidates: a shared `.claude/rules` file scoped to source globs, which loads only when code files are touched (Codex reads it through the `AGENTS.override.md` rule table); a short section in `AGENTS.md`; or hook output (a session-start hook, or the existing edit hook replying when a file gains a marker).
- Constraint: injecting existing markers or groups into context primes agents with known cases and can strengthen box-fitting (entry 2). Inject the guidance, not a list of past findings, unless that effect is shown to be harmless.
- Decision: the delivery channel, and whether the edit hook gives any feedback on markers.
- Done when the chosen channel is synced by `engrenage sync agents` for Claude and Codex.

## 4. A harvest pass turns markers into planned work.

- Matter: raw markers are deliberately unclassified and imprecise. A capable agent must read them together, group the ones that describe one matter (across wording, files and categories), discard what is not debt, and turn the remaining groups into work the planner can take.
- Expected: a skill (a backlogger mode or a skill of its own) that reads `engrenage debt --json`, groups and evaluates the markers, and writes one backlog entry per real group in the category owning the affected subsystem, listing the sites and the observed problem. It updates existing entries rather than duplicating them. Markers stay in the code until the fix lands, as its list of sites.
- Open:
  - Output: backlog entries (reuses deduplication, ownership categories and the planner flow) or a dedicated report regenerated on each harvest.
  - Trigger: on demand, periodic, or proposed when the marker count crosses a threshold. It must never become a blocking check.
  - Whether the harvest may remove markers it judges not to be debt, or only report them.
- Done when the harvest skill exists, ships through engrenage, and produces backlog entries (or the chosen report) that the planner can act on.

## 5. Where to mark debt seen outside the files being changed.

- Matter: an agent often notices a repetition or quirk in a file it only reads. Marking only files it already changes keeps diffs focused but loses those observations. Marking any file it read adds noise to unrelated diffs and edges into unsolicited changes.
- Options: mark only changed files, and cite the other locations in the note ("same sequence as `syncEditHook.ts`"); allow markers in read-only files; or send observations about other files elsewhere (the session report, which entry 1 shows gets lost).
- Done when the shared instructions state the rule.
