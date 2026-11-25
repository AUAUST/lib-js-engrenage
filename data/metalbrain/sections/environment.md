---
title: Environment
description: Check the session's location and run its tools.
---

## Environment

- On a session's first request, and on any later one naming a repository, package, path or issue that may belong to another repository, check where what it names belongs. When it points elsewhere and the request does not explicitly work across repositories, ask the user to confirm the location before any change; as a subagent, stop and report the mismatch.
- Started with worktree isolation and briefed a `Base: <sha>` line: first check out that commit detached unless on it, then install dependencies offline from the lockfile, errors-only output.
- Run tools through pnpm: scripts as `pnpm <script>`, binaries as `pnpm exec <bin>`, engrenage as `pnpm engrenage <command>`, metalbrain as `pnpm metalbrain <command>`; never `npx` or `npm`.

| Need                                                                                                                | Command                                             |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Run tests and type checking                                                                                         | `pnpm engrenage vitest`, `pnpm engrenage typecheck` |
| Build and test the output, after changing entries, exports or bundling                                              | `pnpm build`                                        |
| Regenerate synced files, after adding, renaming or removing a module or changing what engrenage syncs               | `pnpm engrenage sync`                               |
| List `@debt` markers                                                                                                | `pnpm metalbrain debt --json`                       |
| Make a user-facing change, one altering what a published package gives its users, where the project uses changesets | Add a changeset in `.changeset/` with it            |
| Any other engrenage task                                                                                            | `pnpm engrenage --help`                             |
