---
"@auaust/engrenage": minor
---

- **Breaking**: Replace `presets: ["library"]` with `preset: "library"` (at most one) and `traits: { enable, disable }`; the `library` preset bundles the `published` trait, which drives the published `package.json` fields, the library tsconfig, dist-mode tests, the library workflows and the library lint conventions. Upgrade: `presets: ["library"]` becomes `preset: "library"`.
- **Breaking**: Replace `tests.files` with `tests.location`, `tests.suffix` and `tests.extension`. Upgrade: split the glob into those three options.
- **Breaking**: Replace `tests.layout` with the boolean `tests.mirror` (default `false`). Upgrade: `layout: "mirror"` becomes `mirror: true`.
- **Breaking**: Rename `bin.layout` and `scripts.layout` to `tree` (default `commands`: the environment root and every non-role directory are command groups, their modules subcommands named after their file), and `bin.commands` to `bin.entries`. Upgrade: rename the keys.
- **Breaking**: Replace `build.emptyOutDir` with `build.clean`: `"all"`, `"emitted"` (only the files the previous build emitted) or `false`. Upgrade: `emptyOutDir: true` becomes `clean: "all"`.
- **Breaking**: Remove the `public` domain option. Upgrade: give each public domain an `entry.ts`.
- Reject each removed key with a message naming its replacement
- Add `typescript.verbatimModuleSyntax` (default `true`); `false` is written into the base tsconfig, resolves every role `typeOnly: false` and turns the type import convention off, and a contradicting `compilerOptions.verbatimModuleSyntax` fails
- Add `setupFiles` to the tests environment, defaulting to the `setup.ts` of the tests root
