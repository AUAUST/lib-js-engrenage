---
"@auaust/engrenage": minor
---

- Declare an environment's root namespace in its `.environment.json`, with a `kind`, in place of its `.namespace.json`
- Report an `.environment.json` outside a scope's direct child directory, beside a `.namespace.json` or naming an unknown kind
- Register a workspace's environments from the `.environment.json` in its direct child directories
- Replace `resolveEnvironmentDirs` and `hasUnignoredFile` with `discoverDeclaredEnvironment` for contributed environments
