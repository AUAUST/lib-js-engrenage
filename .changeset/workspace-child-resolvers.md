---
"@auaust/engrenage": minor
---

- Resolve each workspace through its own config, reached with `context.scope(dir)`: project keys resolve through the root, inherited keys over the root's values, the rest from the workspace's glob entry, preset and `.workspace.json`
- Let extensions declare each config key's `scope`: `project`, `scoped` or `inherited`
- Accept config keys in a `workspaces` glob entry, refusing project-only ones there and in `.workspace.json`
