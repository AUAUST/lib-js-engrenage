<!-- @reference @auaust/engrenage/metalbrain/rules/agent-records.md -->

# Agent records

- **Friction**, `.ai/friction.md` under `# Agent friction`: each retry, workaround or lookup that a command, tool, hook, permission, missing instruction or your own workflow cost you, unless your own changes caused it. Form: `- <subject>: <what you tried> — <what stopped it and how you got past>`, the subject naming the command, tool or instruction.
- **Discarded solution**, `.ai/discarded.md` under `# Discarded solutions`: each solution you set aside because its cost exceeded what the task or your role allows. Form: `- <subject>: <need> — <reason set aside>`, naming a library by its package name.
- **Debt**, as the Debt section below defines it, as a comment at the code. Form: `@debt <statement>` at the start of its own comment, one per comment, stating what could be better as you see it; a fix only when you already know one.

- Write each record yourself as soon as you find what it records, without asking or awaiting review, whatever your role, mode or brief, but only in the current repository: report what you notice in another repository instead.
- Telling the user or your caller of a finding, in chat or in a report, records nothing: record it first, under this rule or Backlog, and name where you recorded it. Two findings go in your report unrecorded: one Backlog leaves to your caller, and one whose backlog entry waits on a dispatched agent's work, which you name as pending.
- Before your final report as a subagent, or before ending a turn in the main session, and ahead of any closing step your harness asks for: write each record and backlog entry that came due since your dispatch, resume or turn began and is still missing.
- Create a log with its heading when it is absent. Keep each part of a line to a few words, so repeated mentions of one subject match.
- Before weighing a solution or writing a friction line, search its log for the subject. A subject with three or more lines is recurring: report it as a candidate with its line count and the needs it records.
- Remove a subject's log lines once a backlog entry, an issue or a change takes the subject up. Remove a debt marker only when your change resolves it.

## Debt

- Debt is any gap between the code as it is and the code as it would be with complete knowledge and no limits of time, scope or instructions, including code that holds only while something outside it stays true and any change that makes a tool accept the code instead of making it right.
- Judge against that ideal, never against the task: code your issue, a decision, instructions or scope dictated is still debt when it falls short. Doubt settles it: if you wonder, it is debt.
- A likely or proven bug outside your task is no debt: it goes to the backlog. Code that may or may not be a bug is debt.
- Mark debt wherever you notice it: in files you change or only read, and in the report of an agent you dispatched that left it unmarked. Record debt with no site in code as a backlog entry. A vague marker beats a dropped concern. Never search for it beyond what your task shows. Debt never fails a check.

<!-- @end -->
