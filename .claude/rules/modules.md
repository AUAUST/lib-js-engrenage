---
paths:
  - "src/**"
  - "bin/**"
  - "scripts/**"
  - "tooling/**"
  - "tests/**"
  - "package.json"
---

# Modules and steps

- Init steps create only files engrenage owns and never overwrite existing ones; where a tool has its own setup command, the step adds the tool and runs that command. Sync targets update existing files and create one only when a flag or config option asks for it.
- Name modules by kind: `create…Step` for init steps, `sync…` for sync targets only, `generate…` for generators, `define…Config` for definers.
- Declare a domain's options in `config/` with the `foundation/options` declarers; `pnpm support codegen config` generates its `<Name>Input` type from them.
- Read library-only behavior from the `published` trait, never from the preset.
- Give a function, constant or schema its own module only when a barrel exports it or two modules, tests included, import it; otherwise keep it private in its only consumer.
- Name types after their tool's concept, without a tool prefix. Use the global `Directory`, `File` and `Glob` for path-like values, adding `URL` where a URL is accepted.
- Compose function arguments from those types inline; never pick them from a larger options type.
- Export global types only from the root entry.
- `@auaust/toolkit`, commander and Octokit are devDependencies bundled into `dist`, so engrenage never depends on them at install time. Every other package it uses at runtime stays unbundled, as a dependency or a peer dependency: `package.json` lists both, with each peer's optionality.
