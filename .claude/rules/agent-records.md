<!-- @reference @auaust/engrenage/agents/rules/agent-records.md -->

# Agent records

| Record             | Where                                       | Holds                                                                                                                                                                                                      | Form                                                                                                                                                   |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Friction           | `.ai/friction.md`, `# Agent friction`       | Each time your tools or workflow, not your work, cost a retry, a workaround or a lookup: a command that behaved unexpectedly, a permission or tool that blocked you, a fact no instruction or command gave | `- <subject>: <what you tried> — <what stopped it and how you got past>`, the subject naming the command, tool or instruction                          |
| Discarded solution | `.ai/discarded.md`, `# Discarded solutions` | Each pattern, abstraction, refactor, library or tool you set aside because its cost exceeded what the task or your role allows                                                                             | `- <subject>: <need> — <reason set aside>`, naming a library by its package name                                                                       |
| Debt               | A comment at the code                       | Code that could be better and that you are not fixing                                                                                                                                                      | `@debt <statement>` at the start of its own comment, one per comment, stating what could be better as you see it; a fix only when you already know one |

- Record within the task, without asking first, whatever edit scope your role sets, and only in the current repository. Report instead what you notice elsewhere, and each record whose file your brief forbids you to edit.
- Create a log when absent, under its heading. Write each line a few words per part, so repeated mentions of a subject match.
- Before weighing a solution or reporting friction, search its log for the subject, and report a recurring one as a candidate with its line count and the needs it records.
- Remove a subject's lines once a backlog entry, an issue or a change takes it up, and a debt marker only when your change resolves it.
- Keep failures your work causes, project defects and work someone should do out of the logs: they go to the backlog.

## Debt

- Debt is any gap between the code as it is and the code as it would be with complete knowledge and no limits of time, scope or instructions, including code that holds only while something outside it stays true and any change that makes a tool accept the code instead of making it right.
- Judge against that ideal, never against the task: code following an issue, a decision, an instruction or the only option within your scope is still debt when it falls short. Doubt settles it: if you wonder, it is debt.
- Mark a concern even when you cannot say how to resolve it: a vague marker beats a dropped concern.
- Mark debt wherever you notice it, in files you change or only read, never searching for it beyond what your task shows. Debt never fails a check.

<!-- @end -->
