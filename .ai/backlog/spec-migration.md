# spec-migration

Breakage the #809 spec-leaf migration knowingly causes (S.18): what is expected to break and what must be handled before walks resume.

## 1. Every existing plan holding Steps is refused at dispatch

- why: the dispatch hook refuses any issue with **Steps** (P.3.3); 57 open issues hold them (engrenage 48, toolkit 2, interscript 7), under #675, #732, #338, #308 and 11 standalone.
- want: the P.3.2 sweep (planning skill › Steps migration) converts engrenage's, each batch reviewed by the user; the user migrates toolkit and interscript (S.23).
- done: no open engrenage issue holds **Steps**; then delete `steps-migration.md` with the consultant skill's §Steps sweep and the planner's and shaper's conversion mentions.

## 2. Leaves under a published segment without Done when are refused

- why: `planning issue check` requires **Done when** on segments and checks ancestors (S.8), so every leaf under an older segment fails readiness.
- want: the P.3.2 sweep writes each open segment's **Done when** per the issue-drafts rule.

## 3. Housekeeping parents holding Tests are refused

- why: S.6 (46072c6d) forbids **Tests** on a Task or Problem whose own work is only **Housekeeping**; ancestors are checked, so their leaves fail readiness too. Unknown whether open issues hold both sections.
- want: query open issues holding both; move each **Tests** into the sub-issue owning it, with the P.3.2 sweep.

## 4. Consumers lack the consultant agent and reject `freshness`

- why: sync installs no new skill, so a consumer's walker and Steps sweep brief a `consultant` that does not exist; agent blocks still setting `freshness` fail schema validation.
- want: toolkit and interscript run `pnpm engrenage agents skills add consultant` and drop `freshness` when the user migrates them (S.23).
