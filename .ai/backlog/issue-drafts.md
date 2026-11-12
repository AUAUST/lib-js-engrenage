# issue-drafts

Local issue drafts: claim, check and publish.

## 1. Publishing a draft whose type changed fails on the old type's fields

- why: seen in the #476 walk (Idea → Problem, `Nature` kept). Cause unlocated: `mergeDraftManifest` keeps a dropped key dropped when base and remote agree, and `updatePublishedIssue` already sets the type before the fields; suspects: the draft or `readIssueManifest` still carrying `Nature`, the manifest check, or `listPublishedFieldValues`.
- want: a type change publishes, the old type's fields dropped.
- done: claiming an `idea`, changing it to `problem` and publishing succeeds.
