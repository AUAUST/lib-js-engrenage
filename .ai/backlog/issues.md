# issues

GitHub issue drafts, checks and planning commands.

## 1. Publishing a draft fails on a published ancestor in an unregistered repository

- sites: `src/tools/github/issues/drafts/operations/resolvePublishedAncestors.ts:50`, `src/tools/github/issues/drafts/operations/resolvePublishedAncestors.ts:181`, `src/tools/github/issues/drafts/utils/toLocalStem.ts:24`
- why: `toLocalStem` throws for any repository missing from `github.repositories`; found publishing #677 and #680 under AUAUST/clients-intscr-shopify#49 before that repository was registered.
- want: an ancestor outside the registry kept as its full `owner/repo#n` reference instead of failing the publish.

## 2. `planning issue check` demands readiness sections of closed drafts

- sites: `src/tools/github/issues/drafts/operations/checkIssues.ts:143`, `src/tools/github/issues/drafts/utils/checkDrafts.ts:363`
- why: `complete` is one flag for every draft checked, whatever its `state`; #708 and #713, both `completed`, fail on missing **Steps** and **Tests**.
- want: a draft whose `state` is not `open` checked without the worker-readiness sections.
