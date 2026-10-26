---
"@auaust/engrenage": minor
---

`directories.source` defaults to `["src", "bin", "scripts"]`, so conventions scoped to source directories and barrel discovery cover `bin/` and `scripts/` without configuration. Missing directories are ignored, and a configured list still replaces the default.
