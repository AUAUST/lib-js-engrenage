---
title: Agent records
description: Record friction, discarded solutions, missing capabilities and debt so recurring ones surface.
---

# Agent records

Each record but debt goes to its agent log, `<log>` below:

- **Friction**, log `friction`, fields `--subject <its cause> --tried <what you tried> --stopped <what stopped it and how you got past>`: each retry, workaround or lookup anything but your own changes cost you.
- **Discarded solution**, log `discarded`, fields `--subject <the solution> --need <need> --reason <reason set aside>`: each solution you set aside because its cost exceeded what the task or your role allows, naming a library by its package name.
- **Missing capability**, log `missing`, fields `--subject <the capability> --need <what you needed it for> --instead <what you wrote or did instead, with its site>`: each operation you write, or work around because nothing provides it, that holds nothing specific to the case it serves: one a dependency or a shared domain could provide, sparing you that code. State the capability, never why it belongs elsewhere; when you wonder, record it.
- **Debt**, as defined below, a comment at the code. Form: `@debt <statement>` at the start of its own comment, one per comment, stating what could be better as you see it; a fix only when you already know one.

Every log and the backlog take the same commands, `<kind>` naming a log or `backlog`:

```sh
pnpm metalbrain <log> add --<field> '<text>' … [--keywords '<terms>']  # prints the ID, then similar entries
pnpm metalbrain <kind> update <id> --<field> '<text>' …
pnpm metalbrain <kind> tap <id…> [--note '<text>']
pnpm metalbrain <kind> merge <new-id> <kept-id> [--note '<text>']
pnpm metalbrain <kind> search <query…>                                  # GitHub code search syntax
pnpm metalbrain <kind> search --text '<raw text>'
pnpm metalbrain <log> stats
pnpm metalbrain search <query…>                                         # every kind together
pnpm metalbrain [<kind>] show|close <id…>                               # without <kind>, read from each ID
```

- Write each record yourself as soon as you find what it records, without asking or awaiting review, whatever your role, mode or brief; only in the current repository, reporting what you notice elsewhere.
- Telling anyone a finding records nothing: record it first, under this rule or Backlog, and name where. Report unrecorded only a finding Backlog leaves to your caller.
- Before your final report as a subagent, or ending a turn in the main session, ahead of any closing step your harness asks for, write each record and backlog entry due since your dispatch, resume or turn began.
- Read and change the agent logs only through these commands. Keep each log field to a few words, so mentions of one subject match.
- Chain several `add`, `update` or `merge` invocations on one kind into one call with `--next` between them; `tap`, `show` and `close` take several IDs.
- Add entries without searching first; when `add` lists one recording the same thing, run the `merge` or `close` it prints and update the kept entry with anything yours adds. Pass `--keywords` with the subject's other names when you expect a duplicate worded otherwise.
- An entry you know records what you met again: tap it instead of adding one, its note holding what the entry lacks.
- Before weighing a solution, search the discarded log for it. A subject its `stats` flags as recurring is a candidate: report it with its entry count and the needs its entries record.
- Close a subject's log entries once a backlog entry, issue or change takes it up, and remove a debt marker only when your change resolves it.

## Debt

- Debt is any gap between the code as it is and the code as it would be with complete knowledge and no limits of time, scope or instructions, including code that holds only while something outside it stays true and any change that makes a tool accept the code instead of making it right.
- Judge against that ideal, never against the task: code your issue, a decision, instructions or scope dictated is still debt when it falls short. Doubt settles it: if you wonder, it is debt.
- A likely or proven bug outside your task is no debt: it goes to the backlog. Code that may or may not be a bug is debt.
- Mark debt wherever you notice it, as a backlog entry where it has no site in code: a vague marker beats a dropped concern. Never search for it beyond what your task shows. Debt never fails a check.
