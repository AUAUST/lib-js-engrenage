---
"@auaust/engrenage": minor
---

- Add the `name` config key, which a `.workspace.json` sets to override its glob entry's package name
- Sync each workspace's `private` and `publishConfig` from its own `published` trait, and its `devEngines.runtime` from its own `runtime`
- Generate each workspace's barrels from its own structure
- Stop writing the `#self/*` import into workspaces: import their modules through their synced `#…` aliases and delete the stale `#self/*` entry
