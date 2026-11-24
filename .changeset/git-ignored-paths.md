---
"@auaust/engrenage": patch
---

- Speed up config loads in repositories with many git-ignored files
- Exclude git-ignored paths holding glob characters, such as `[id]`, as themselves only
- List nested `.gitignore` files through Git, which skips those in ignored directories and lists none outside a repository
