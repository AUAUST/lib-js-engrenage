---
"@auaust/engrenage": patch
---

- Add the `generators` config key, declaring each scope's code generators with their command, input globs and output globs
- Run, before the fixes of the staged and worktree gates, each generator whose inputs a changed, deleted or renamed-away file matches or one of whose outputs is missing, and every generator under `gate --all`
- Restage the tracked outputs a generator changes in a staged gate run
- Report a failing generator under its name
- Treat declared generator outputs as generated files
- Add the `generate` gate stage, run first, and pass the removed files to every gate step's run
- Let a gate step's result name its failure and warnings with `name`
