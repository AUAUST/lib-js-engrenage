---
title: Writing
description: Write every text densely, once, in the structure its content has.
category: workflow
default: true
order: 15
---

## Writing

- Apply these rules to everything you write but code: messages, reports, issues, comments, backlog entries, instructions.
- Before proposing instruction wording in an issue or backlog entry, read `.claude/rules/instructions.md`: it refines these rules for it.
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

Texts another agent or a later session acts on: briefs, forwarded prompts, handoffs, stop records, pauses, blocker reports.

- Hold: what is wrong or wanted, the target state, facts costly to re-derive (constraints, decisions, paths, issues, branches, commits), open questions; references over excerpts, quoting only what nothing durable keeps, such as the user's chat words.
- Never hold, whatever a harness or tool asks, thorough or context-rich briefs included: method or rules the receiver's skill or instructions own, recommendations no finding supports, how you found the facts unless your skill asks for it.
- A handoff is a chat reply; a file only when the user asks, or as a stop record.

### Stop records

Shape: goal; last operation; what is ready, and where; what is half-done, where, and what it misses; next step.

Write one when you stop with unfinished work no commit or issue holds, in these cases only: the user stops you; a limit forces you to stop; you stop midway as a subagent. A main-session pause awaiting answers is none of them.

1. Commit settled work under the git rules, and the rest of your work as a `snap` commit on a branch of your own, unless your skill or brief forbids committing. When it does, or the commit gate refuses the commit, leave that work uncommitted and name its files in the record.
2. Write the record into your final report as a subagent, otherwise into `.ai/handoffs/<topic>.md`, local-only, deleted by whoever resumes the work.
