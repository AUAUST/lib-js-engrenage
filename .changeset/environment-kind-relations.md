---
"@auaust/engrenage": minor
---

- Derive environment import rights from each kind's `imports` relations and `inward` policy, replacing `consumesSource`
- Check data imports through `import-environments`, removing `import-data`
- Let `src` import `data` in published packages too
