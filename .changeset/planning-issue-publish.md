---
"@auaust/engrenage": minor
---

- Add `engrenage planning issue claim <refs>`: writes `.ai/issues/<n>.md` with the manifest and body as fetched and `<n>.draft.md` with the issue's manifest and body, a Plan's **Roadmap** turned into `subIssues`, then adds `Drafting` to its Blockers
- Add `engrenage planning issue publish <refs>`: validates the set, merges each claimed issue three-way, per manifest key and for the body, with its GitHub changes since the claim, creates new issues, sets title, body, type, labels, fields, state, sub-issues and blocked-by, renders Plan roadmaps, clears `Drafting`, prints each issue's diff and deletes its files; an interrupted publish resumes from the created issues' drafts
