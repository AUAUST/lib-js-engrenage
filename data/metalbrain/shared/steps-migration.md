# Steps migration

An open issue still holding **Steps** or `Checkpoint:` lines predates the issue-drafts rule's current shapes: `planning issue check` fails on it and no worker takes it. Deleted, with each reference to it, once no open issue holds **Steps**.

Convert such an issue before any other edit to it or any dispatch of it, as a draft under the issue-drafts rule:

1. Under **Done when**, state what the **Steps** make true, as the rule's **Done when** row asks; keep each clause it already holds.
2. Move into **Context** the code facts the **Steps** verified: paths, names, current behavior.
3. Add **Provides** only for what a Model section of the nearest plan expects from it.
4. A `problem`: keep what the **Steps** settled or suspected about the fix under **Fix** or **Leads**, as the rule's rows hold them.
5. Delete the **Steps** and every `Checkpoint:` line, with the procedure they held.
6. Run `pnpm engrenage planning issue check` on it until it passes.
