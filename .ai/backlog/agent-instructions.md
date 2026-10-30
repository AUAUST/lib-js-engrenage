# agent-instructions

Agent instruction resolution and synchronization.

## 1. No discovery or sync of skills provided by dependencies.

- Problem: toolkit may publish a generated agent skill (toolkit backlog `documentation.2`), but nothing lists or syncs skills that dependencies provide.
- Fix: first check which conventions already distribute skills through packages; otherwise add a package-level skill declaration (in the spirit of `exports`) and an engrenage command listing available skills and keeping them up to date.
- Done when engrenage discovers and syncs skills declared by dependencies, or obsolete if an existing convention covers it.
