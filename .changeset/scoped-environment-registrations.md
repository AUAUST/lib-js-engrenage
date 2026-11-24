---
"@auaust/engrenage": minor
---

- Register environments in a workspace's `environments`, its glob entry's or `.workspace.json`, placed relative to the workspace, beside the root's registrations each workspace inherits and re-places relative to itself
- Place a workspace's top-level namespaces at the directories its registrations declare, instead of its direct child directories holding a `.namespace.json`
- Resolve each workspace instance's execution, its tsconfig's included, through the workspace's config, at the workspace's `runtime.node` when its Node major is unset
- Fail discovery when a workspace's `.workspace.json` or glob entry sets a project-only or invalid key
- Leave a namespace's root `index` and `entry` files out of a scope's synced `exports`
