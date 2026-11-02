# agents

Shared agent fragments and their init and sync consumers.

## 1. An unresolvable `@reference` fails init and sync instead of warning.

- Matter: setting up the backlog throws `Error: Cannot resolve reference "@auaust/engrenage/agents/rules/scratchpad.md"` during init, because the consumer's agent file points to a dropped rule.
- Expected: a missing reference warns the user, leaves its block untouched, logs its location for later review, and lets the process continue.
- Done when init and sync complete with a warning naming the file and reference, with a test.

## 2. Skills are duplicated across agent directories.

- Matter: each agent directory receives its own copy of the skills, which bloats consumer repositories.
- To investigate: whether the supported agents can read a shared skills directory, so skills are centralized rather than duplicated.
- Done when support is established or ruled out per agent, and the sync output follows the result.
