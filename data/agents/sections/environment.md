---
title: Environment
description: Check the session's location and run its tools.
category: workflow
default: true
order: 35
---

## Environment

- On a session's first request, and on any later one naming a repository, package, path or issue that may be another repository's, check that what it names belongs to the current repository. When it seems to point to another and the request does not explicitly work across repositories, ask the user to confirm the location before any change; as a subagent, stop and report the mismatch instead.
- Run tools through pnpm: scripts as `pnpm <script>`, binaries as `pnpm exec <bin>`, engrenage as `pnpm engrenage <command>`; never `npx` or `npm`, which the package-manager policy rejects.

| Need                                                                                                  | Command                                             |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Run the tests and type checking                                                                       | `pnpm engrenage vitest`, `pnpm engrenage typecheck` |
| Build and test the output, after changing entries, exports or bundling                                | `pnpm build`                                        |
| Regenerate synced files, after adding, renaming or removing a module or changing what engrenage syncs | `pnpm engrenage sync`                               |
| List `@debt` markers                                                                                  | `pnpm engrenage debt --json`                        |
| Release a change, where the project uses changesets                                                   | Add a changeset in `.changeset/`                    |
| Any other engrenage task                                                                              | `pnpm engrenage --help`                             |
