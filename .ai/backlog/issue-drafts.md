# issue-drafts

Local issue drafts: claim, check and publish.

## 1. Draft check and published check disagree on an Idea's blockers

- why: `planning issue check new-<slug>` passed an Idea with Blockers `Open questions` and an `## Open` section; `check <n>` on the published issue then failed it ("no **Planning** or **Questions** is open"). Seen publishing #502.
- want: both checks apply the same Blockers rule to a draft and its published issue.
