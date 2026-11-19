---
"@auaust/engrenage": minor
---

- Ship every agent instruction fragment under `@auaust/engrenage/metalbrain/<kind>/`, replacing `agents/<kind>/` and `extensions/<name>/agents/<kind>/`
- Rewrite `@reference` markers naming the former locations on sync
- Warn about each `agents.snippetsDir` snippet still at a former location
- Gate a shipped fragment on an active extension through its `extension` frontmatter key
- Read an extension package's fragments from its `./metalbrain/<kind>/*.md` exports
