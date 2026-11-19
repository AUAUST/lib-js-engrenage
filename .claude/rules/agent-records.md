<!-- @reference @auaust/engrenage/metalbrain/rules/agent-records.md -->

# Agent records

- **Friction**, `.ai/friction.md` under `# Agent friction`: each retry, workaround or lookup a tool or your workflow cost you, whatever caused it but your own changes: a command that behaved unexpectedly or failed transiently, a permission or tool that blocked you, a fact no instruction or command gave. Form: `- <subject>: <what you tried> — <what stopped it and how you got past>`, the subject naming the command, tool or instruction.
- **Discarded solution**, `.ai/discarded.md` under `# Discarded solutions`: each pattern, abstraction, refactor, library or tool you set aside because its cost exceeded what the task or your role allows. Form: `- <subject>: <need> — <reason set aside>`, naming a library by its package name.
- **Debt**, a comment at the code: code that could be better and that you are not fixing. Form: `@debt <statement>` at the start of its own comment, one per comment, stating what could be better as you see it; a fix only when you already know one.

- Write each record yourself as soon as you find what it records, without asking or awaiting review, whatever your role, mode or brief; only in the current repository. Report instead what you notice elsewhere.
- Before your final report as a subagent, and before ending a turn in the main session, write each friction line still missing since your dispatch, resume or turn began.
- Create a log when absent, under its heading. Write each line a few words per part, so repeated mentions of a subject match.
- Before weighing a solution or writing a friction line, search its log for the subject. A subject with three or more lines is recurring: report it as a candidate with its line count and the needs it records.
- Remove a subject's lines once a backlog entry, an issue or a change takes it up, and a debt marker only when your change resolves it.
- Keep project defects and work someone should do out of the logs: they go to the backlog, and the friction they cost you still gets its line, even once an entry or issue tracks them.

## Debt

- Debt is any gap between the code as it is and the code as it would be with complete knowledge and no limits of time, scope or instructions, including code that holds only while something outside it stays true and any change that makes a tool accept the code instead of making it right.
- Judge against that ideal, never against the task: code following an issue, a decision, an instruction or the only option within your scope is still debt when it falls short. Doubt settles it: if you wonder, it is debt.
- A likely or proven bug outside your task is no debt: it goes to the backlog. Code that may or may not be a bug is debt.
- Mark debt wherever you notice it, in files you change or only read, as a backlog entry where it has no site, and even when you cannot say how to resolve it: a vague marker beats a dropped concern. Never search for it beyond what your task shows. Debt never fails a check.

<!-- @end -->
