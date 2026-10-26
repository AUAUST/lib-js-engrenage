---
"@auaust/engrenage": patch
---

Fix TS2883 in consumer config files that emit declarations: `@auaust/engrenage/config` now re-exports `ConfigInput`, and `Config` and `ResolvedConfig` are interfaces, so their inferred types are named through public entries.
