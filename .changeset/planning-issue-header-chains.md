---
"@auaust/engrenage": minor
---

- Render issue header chains at `engrenage planning issue publish` from the tree: a draft's header holds only `<sections>: <gist>`, and `claim` strips the chain
- Fail `engrenage planning issue check` on a draft header starting with a reference, and on a listed child draft without a header line or with the placeholder left as written
- Fail `engrenage planning issue publish` on an issue whose header line does not match its ancestors, and on a set that changes the ancestors of issues outside it
- Write the `<sections>: <gist>` header placeholder in `engrenage planning issue create --parent` drafts of types with a header
