---
"@auaust/engrenage": minor
---

`loadConfig` finds `engrenage.config.*` with c12's own lookup, so the config can also live in `.config/` (`.config/engrenage.ts` or `.config/engrenage.config.ts`), in any format c12 supports. The lookup starts in the given directory (`process.cwd()` by default) and walks up to the nearest `package.json`, so tools running from a subdirectory of the project find it. The project root is the directory holding the config, or the parent of `.config/`. Without a config, the defaults are rooted at the nearest `package.json` directory, or the starting directory when there is none.

**Breaking:**

- Several config files in one directory no longer fail: c12 picks the first in its order.
- The config of a parent directory now applies to its subdirectories, up to the nearest `package.json`.
