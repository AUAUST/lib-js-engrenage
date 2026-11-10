# Agent friction

- `gh api issue-field-values`: clear the `Drafting` blocker by posting an empty multi-select array — 422 "must contain at least one option"; `DELETE repos/{owner}/{repo}/issues/<n>/issue-field-values/<field id>` works, undocumented in the drafts flush mechanics
- `gh issue view --repo`: read issues from `AUAUST/engrenage` — repository is `AUAUST/lib-js-engrenage`; had to read the git remote
- PreToolUse Bash hook: run any command after changing the config schema before `engrenage.config.ts` — the hook loads the project config and blocked every Bash call; migrated the config with Edit first
- `pnpm support codegen barrels`: regenerate a barrel after deleting a module it exports — the generator imports that barrel and fails on the missing module; fixed the stale line by hand, then reran
- `engrenage issues check`: validate local drafts before a flush — takes issue numbers only; checks deferred to after the flush
- PreToolUse Bash hook (`gh issue create`): pipe a draft through a shell variable path — hook needs the literal `.draft.md` path in the pipeline, resolved from the shell cwd; wrote one literal absolute path per command
- drafts flush: strip frontmatter with awk — left a leading blank line, so `engrenage issues check` saw no header; trimmed leading blank lines and republished
- git stash -u: stashing a tree with `git add -N` entries to test HEAD — stash refused, chained pop then half-applied an older stash's untracked files; removed them after cmp against stash^3, used a temporary worktree instead
- `gh issue create` hook: piped a body from a shell function, then from a relative `.draft.md` path outside the repository root — the hook accepts only a draft path relative to the root; reran from the root
- `engrenage issues check`: published draft bodies keeping the blank line after the frontmatter — the header check fails on a leading blank line; stripped it and republished
- node scratch scripts: imported `prettier` from a scratchpad `.mjs` — ESM resolves packages from the script directory, not the cwd; imported `node_modules/prettier/index.mjs` by absolute path
- PreToolUse Bash hook (`gh issue edit`): redirected a body file with `<`, then a draft without frontmatter — the hook accepts only a pipe from a `.draft.md` file and blocks the whole compound command; piped with `cat` in its own command
- `engrenage vitest`: printed exploration output with `console.log` in a scratch test — the run shows no test console output; wrote it to a file instead
- `gh issue view --repo`: read issue 160 from `AUAUST/engrenage` — repository is `AUAUST/lib-js-engrenage`; read the git remote
- `grep --include=*.ts`: unquoted glob in zsh — zsh aborts with "no matches found"; quoted the pattern
- node scratch scripts: imported `prettier` from a scratchpad `.mjs` — ESM resolves packages from the script directory; ran the code with `node --input-type=module -e` from the repository root
- `engrenage vitest`: printed exploration output with `console.log` in a scratch test — the default reporter hid it; reran with `--silent=false --reporter=verbose`
