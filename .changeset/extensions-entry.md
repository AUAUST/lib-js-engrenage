---
"@auaust/engrenage": minor
---

- Add the `@auaust/engrenage/extensions` entry for extension authors: `defineExtension`, the option declarers, and the extension, section, file, sync, gate and init contracts, each marked stable or experimental; experimental contracts may break in a minor release before 1.0
- Move `loadConfig`, `loadValidatedConfig` and `LoadedConfig` from `@auaust/engrenage/config` to `@auaust/engrenage/extensions`
- Accept nested lists in `extensions`, flattened in listed order
- Add `root` to extensions: `engrenage sync agents` reads the agent fragments an active extension's package exports under `./agents/<kind>/*.md`
- Add `compatibility.engrenage` to extensions: a semver range the running engrenage must satisfy
