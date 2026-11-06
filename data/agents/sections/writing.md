---
title: Writing
description: Write every text densely, once, in the structure its content has.
category: workflow
default: true
order: 15
---

## Writing

- Apply these rules to everything you write other than code: messages, reports, issues, comments, backlog and debt entries, instructions.
- State each fact once, where its owner keeps it. Elsewhere, link to it with its gist so the reader knows whether to follow the link.
- State the core idea exactly, with its reason in one clause; never hedge it or blur it into vague wording.
- Prefer fragments and keywords to full sentences wherever the meaning stays exact.
- Drop every sentence the reader would not miss.
- Choose the clearest and shortest wording that keeps the meaning, and rephrase wording that falls short of these rules in the text you edit.

### Structure

| Content                                | Form                                         |
| -------------------------------------- | -------------------------------------------- |
| A single point                         | Sentence                                     |
| Independent points                     | List                                         |
| Three or more facts sharing dimensions | Table                                        |
| Hierarchy, layout or layers            | ASCII tree or box diagram in a code block    |
| Flow or dependency graph               | Mermaid, or an ASCII diagram in a code block |

- Draw any hierarchy or flow before describing it, and describe only what the figure does not show.
- Never use images or inline SVG: agents cannot read them back. Use other diagram languages only where the project already does.
- Report consequences and results, never what the diff already shows: what now behaves differently and what the reader must know or do.

### Length

| Text                  | Budget in words |
| --------------------- | --------------- |
| Goal                  | ~60             |
| Context               | ~80             |
| Done when             | ~60             |
| Comment               | ~150            |
| Backlog or debt entry | ~60             |

- Give **Steps**, **Tests**, **Planning**, **Questions**, model sections and **Decisions** no budget: make them as complete as a worker needs.
- Treat a budget as a signal: past it, link to where the detail lives or split the text, never truncate it.
- Cut repetition to meet a budget, never decisions.
