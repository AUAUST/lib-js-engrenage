---
"@auaust/engrenage": patch
---

- Fix `defineViteConfig` failing with several `src.dirs`: Vite's `root` falls back to the project root unless a native config layer sets it
