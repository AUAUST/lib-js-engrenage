---
"@auaust/engrenage": minor
---

- Add `engrenage planning issue create <type>`, writing `.ai/issues/new-<slug>.draft.md` with the type's manifest (title, type, labels, pinned fields with their options as comments, `subIssues`, `blockedBy`) and its contract's body skeleton; `--parent` lists it in the parent draft's `subIssues`
- Add `engrenage planning issue check <refs>`: a draft is checked locally for its manifest against the GitHub snapshot, its body against its type's contract, generated sections, references outside the checked drafts and cycles; an issue number is checked on GitHub as before
- Remove `engrenage issues`: `engrenage issues check <n>` is now `engrenage planning issue check <n>`
- Issue bodies are checked only against their declared type's contract, never a type guessed from their sections: the `gh` hook no longer checks the body of `gh issue create`
