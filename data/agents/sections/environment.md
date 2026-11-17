---
title: Environment
description: Check the session's location and run its tools.
category: workflow
default: true
order: 35
---

## Environment

- On a session's first request only, check that the repository, package, paths and issues it names belong to the current repository; when they seem to point to another and the request does not explicitly work across repositories, ask the user to confirm the location before any change.
- Run tools through pnpm: scripts as `pnpm <script>`, binaries as `pnpm exec <bin>`, engrenage as `pnpm engrenage <command>`; never `npx` or `npm`, which the package-manager policy rejects.

| Need                                                                                                  | Command                                             |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Check uncommitted work before delivery                                                                | `pnpm engrenage gate --worktree`                    |
| Run the tests and type checking                                                                       | `pnpm engrenage vitest`, `pnpm engrenage typecheck` |
| Build and test the output, after changing entries, exports or bundling                                | `pnpm build`                                        |
| Regenerate synced files, after adding, renaming or removing a module or changing what engrenage syncs | `pnpm engrenage sync`                               |
| List `@debt` markers                                                                                  | `pnpm engrenage debt --json`                        |
| Release a change, where the project uses changesets                                                   | Add a changeset in `.changeset/`                    |
| Any other engrenage task                                                                              | `pnpm engrenage --help`                             |
