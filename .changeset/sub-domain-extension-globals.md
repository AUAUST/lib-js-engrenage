---
"@auaust/engrenage": minor
---

- Fix the `claude` and `codex` agent runtimes and the `shopify-theme` preset typed as unknown against the published declarations
- Export each built-in extension on its own from `@auaust/engrenage/builtins`, sub-domain extensions included
- Add the `collected` role option, letting other domains import a role's modules inside sub-domains without going through their parent domains' surfaces; the `extension` role sets it
- Reject an extension importing its sub-domains' extensions in the `extension-imports` rule
