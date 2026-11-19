---
title: Issues
description: Decide what to apply and what to record, then record findings as issues or backlog entries.
category: workflow
default: true
order: 17
paths:
  - ".ai/issues/**"
---

# Issues

Applies to every finding you record under a skill sending you here or in an issue draft in `.ai/issues/`. Outcome binds only under a skill naming it, and the Recording bullet only under a skill sending you here; such a skill refines this rule for its role. For those roles, this rule refines the decision protocol, as a question's findings are still recorded.

<!-- @file .claude/rules/issue-drafts.md -->

Read `.claude/rules/issue-drafts.md` too before writing any issue: it holds how issues are typed, written and filed.

<!-- @end -->

## Outcome

- **The sound change delivers what your request or input names**, in its owner's code, with no new pattern, architecture or shared contract, no reversed decision and no rework elsewhere: apply it when your skill lets you change code; otherwise write it up.
- **It goes past that**: in the main session, pause under the decision protocol, and write it up unless the answer widens your request or drops the change; as a subagent, write it up and apply none of it.

Write up each independent change on its own, and several ordered changes as one write-up holding the diagnosis and the breakdown left to design: report that it needs planning.

## Recording

- Record every finding worth keeping without being asked, so it outlives the session: findings on the concern the request names as issues while the issue-drafts rule exists, otherwise as backlog entries; debt, friction and discarded solutions under the agent-records rule; other findings in the backlog. Answer in chat alone only a narrow question whose request expects a short answer. When the user asks a question, answer it, then record the findings it produced: recording is not acting on the question.
