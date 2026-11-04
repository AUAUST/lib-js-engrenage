# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: it says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. `AGENTS.md` describes the pre-#141 module layout.

- why: the project map says `config/` holds definers and `utils/` "every other function" and omits `operations/`; it says logic lives in `config/` and `utils/`; it names `tests/helpers/` (now `tests/utils/`).
- done: #152 rewrites the instructions and `pnpm engrenage sync agents` has propagated them.
