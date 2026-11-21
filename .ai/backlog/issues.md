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

## 3. GitHub snapshot errors and ordering lose information

- sites: `src/tools/github/issues/api/operations/fetchGithubSnapshot.ts:242`, `src/tools/github/issues/api/operations/fetchGithubSnapshot.ts:325`
- why: a GraphQL error from a fine-grained token lacking a permission surfaces without naming it, unlike the REST reads; sorting by name drops GitHub's option priority and pinned order.
- want: the missing permission named; GitHub's order kept.

## 4. Manifest and remote reads treat any failure as missing

- sites: `src/tools/github/issues/api/operations/readManifestRepository.ts:24`, `src/tools/github/issues/api/operations/readOriginRepository.ts:13`
- why: an unreadable manifest reads as a missing one; any git failure as a missing `origin` remote.
- want: a missing file or remote told from a failed read.

## 5. The repository is carried as an unparsed string

- sites: `src/tools/github/issues/api/types/GithubAccess.ts:3`, `src/tools/github/issues/contract/types/ParsedIssueBody.ts:3`
- why: every route splits `<owner>/<repo>` again; a plain `#<n>` entry carries `repository: undefined`.
- want: owner and name parsed once; entries parsed against a base repository.

## 6. Planning vocabulary is restated by hand in schemas

- sites: `src/tools/agents/config/schemas/skillSchema.ts:27`, `src/tools/github/config/schemas/contractNamesSchema.ts:33`
- why: complexity keys and each group's meaning keys repeat the GitHub contract's meanings.
- want: entries derived from the meaning constants.

## 7. Roadmap links miss repeated-heading anchors

- sites: `src/tools/github/issues/contract/utils/renderRoadmap.ts:4`
- why: GitHub suffixes a repeated heading's anchor with `-<k>`.
- want: the suffixed anchor linked.

## 8. Publishing an unchanged draft can push formatter-only changes

- sites: `src/tools/github/issues/drafts/operations/fetchPublishedDraft.ts:134`
- why: the merge returns the formatted remote body, so an unchanged draft may rewrite GitHub's body.
- want: the remote body kept when the draft is unchanged.

## 9. Issue commands duplicate resolution and requests

- sites: `src/tools/github/issues/drafts/operations/releaseIssues.ts:20`, `src/tools/github/issues/drafts/operations/resolvePublishedAncestors.ts:23`, `src/tools/github/issues/contract/utils/formatIssueTreeCheck.ts:100`, `bin/engrenage/planning/issue/actions/claim.ts:1`
- why: `releaseIssues` repeats `claimIssues`' stem resolution, itself unlike `toClaimedIssue`'s; sub-issue paging repeats thrice; the tree check rebuilds a tree it flattened; claim, publish and release clone each other.
- want: one stem resolver; one sub-issue location fetch; the check returning its tree.

## 10. Draft checks and reads fail silently or on wording

- sites: `src/tools/github/issues/drafts/utils/checkDrafts.ts:308`, `src/tools/github/issues/drafts/operations/readDraft.ts:26`
- why: a draft whose repository fails to resolve drops out of parent and cycle checks; the comment-separation error is detected by `yaml`'s message wording.
- want: the resolution failure reported in every check; detection by error code or structure.

## 11. `planning issue check` passes trees `publish` refuses

- why: friction ×4: a header line without ancestors and a Segment or new `subIssues` whose Plan is outside the published set pass `check`, then `publish` refuses them.
- want: `check` applies `publish`'s tree preconditions to the refs it checks.

## 12. `publish` sends the skeleton's hint comments to GitHub

- sites: `src/tools/github/issues/drafts/operations/createDraft.ts:269`, `src/foundation/markdown/utils/stripComments.ts:3`
- why: `create problem` writes HTML hint comments above **Steps** and **Leads**; `check` strips them, `publish` keeps any the author left.
- want: hint comments stripped from the published body, or `check` failing on one left.

## 13. `planning issue publish` exits 1 after printing `published` for every draft

- why: friction ×1; `publishIssues` returns `passed: true` on that path, so the code comes from later; not reproduced without GitHub writes.
- want: the exit code matching the outcome; needs live-GitHub debugging.

## 14. `planning issue check` treats every **Planning** section as open

- why: friction ×2: any **Planning** section counts as open, and a task for a shaper is refused without **Steps** and **Tests**.
- want: a decision on which issues may leave **Planning** open and need no **Steps**/**Tests** (planning-contract policy).

## 15. `planning walk check` lists a leaf ready that the dispatch hook refuses for its ancestors

- sites: `src/tools/github/issues/contract/operations/checkIssueTree.ts:233`, `src/tools/github/issues/contract/operations/checkIssue.ts:103`
- why: the walk checks each issue alone; dispatch also checks ancestors (a parent's **Questions**, any ancestor's `Drafting`): #733 was listed `Ready` under #732 holding both.
- want: the walk's ready set matching what dispatch accepts.

## 16. `check` lets a **Housekeeping** step name source or test paths

- why: the instructions limit Housekeeping to edits outside code and tests, enforced only when an orchestrator applies it.
- want: a `check` finding for a Housekeeping step naming a path under a code or test environment.
