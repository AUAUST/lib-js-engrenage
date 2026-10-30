# github

GitHub repository metadata and generated workflows.

## 1. No GitHub metadata sync.

- Problem: labels are a hand-copied set reused across AUAUST repositories, and GitHub issue types and severity/priority fields are unused. Issue types are configured at organization level, so syncing them needs organization permissions.
- Fix: an `engrenage github` command syncing labels, issue types and bug levels from a library-owned definition, with a check mode. Decide the definition's source (the current label set lives in each repository), authentication (`gh` CLI or a token from `.env`) and how organization-level types are handled without admin rights.
- Done when toolkit's labels and issue types come from the sync.
