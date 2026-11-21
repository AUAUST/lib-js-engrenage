# Housekeeping

An issue's **Housekeeping**: its own work once its sub-issues land, reduced to commands and fully stated edits outside source code and tests. No agent takes it: you, the orchestrator dispatching its sub-issues, apply it yourself, and only as written; investigating, designing and implementing stay with the agents you dispatch.

1. Start once every sub-issue is closed, or closed by a commit not pushed yet, and while no agent changes files in the checkout you apply it in.
2. Apply each numbered step in order, exactly as written: run the command it names from that checkout, or make the edit it states in the file it names. Read only the steps, the files they name and the output of their commands.
3. Stop at a step that fails or reports errors, names a file, entry or command that does not exist as stated, leaves a choice open, or needs you to read or edit code, tests or a file it does not name: what its command changes is part of the step. Never fix, investigate or work around it: discard the changes the steps made, by path, keeping every other change, and hand the issue back as your skill states, with the step and the output that stopped you.
4. Commit the changes as your skill commits the issue's closing work.
