---
"@auaust/engrenage": patch
---

- Resolve namespace kinds and environment presets per scope, from the extensions active in it
- Keep the root's environment presets available to workspaces inheriting its registrations
- Accept `namespaceKinds` overrides naming a kind any registered extension contributes, active or not
