# package-json

Published package contents and the `package.json` fields derived by the sync `package` target.

## 1. Exclude stray files from the published package

- Matter: the `files` field in `package.json`, derived by the sync `package` target, lists `dist`, `data` and `src`. Since the whole `data` directory is published, a stray file there (such as `.DS_Store`) would ship.
- Context: `.gitignore` already keeps such files out of the repository, so the risk is judged nearly impossible. Low-priority safeguard, an improvement to consider, not a bug.
- Expected outcome: decide whether to add an `.npmignore` (or an equivalent mechanism) that excludes stray files from the package, and if so who owns it (engrenage's own repository only, or generated for consumers by the sync target).
- Done when the safeguard is added or the decision not to is recorded; obsolete if the published `files` stop covering directories that can hold stray files.
