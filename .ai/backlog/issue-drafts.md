# issue-drafts

Local issue drafts: claim, check and publish.

## 1. Publishing a draft whose type changed fails on the old type's fields

- why: `mergeDraftManifest` sets every key of the base or the remote manifest, so a field the new type lacks (`Nature` after Idea → Problem) is set again, and the merged manifest fails validation.
- want: a key the draft dropped stays dropped when the base and remote agree; publish changes the type before its fields.
- done: claiming an `idea`, changing it to `problem` and publishing succeeds.
