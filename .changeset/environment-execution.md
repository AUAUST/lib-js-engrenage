---
"@auaust/engrenage": minor
---

- Add execution (`globals`, `apis`, `syntax`, `module`) and bundler pass (`bundled`) to environment presets, tuned per registration under `environments.<name>`
- Read tsconfig `lib`, `types` and `module`, build targets, `engines.node` and `init`'s generated config from the tuning of the registrations they concern
- Fail the build config when the registrations on package entries resolve different runtimes
- Remove the `src.host`, `src.baseline`, `src.node`, `src.apis`, `src.bundled` and `bin.node` options
