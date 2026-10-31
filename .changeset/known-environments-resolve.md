---
"@auaust/engrenage": minor
---

- Replace the `source`, `test`, `bin`, `scripts` and `code` config groups with the `src`, `tests`, `bin`, `scripts` and `tooling` environments, each resolved into `config.src`, `config.tests`, `config.bin`, `config.scripts` and `config.tooling` with its `active` state, and add `config.files` aggregating their `generated`, `discovered`, `fixtures`, `published` and `private` globs
- Move `source` to `src`, `test` to `tests`, `test.fixtureFiles` to `tests.fixtures`, `code.files` to `typescript.files`, `code.configFiles` to `tooling.files`, and `code.generatedFiles` and `code.discoveredFiles` to the `generated` and `discovered` lists of each environment, relative to its `dirs`
- Add `defines` to the `src`, `tests`, `bin` and `scripts` environments, and accept `false` to disable any environment
- Accept list options for the dirs and globs of every environment and for `typescript.files`
- Rename the ESLint scope references `files.source` and `dir.source` to `files.src` and `dir.src`, and `files.config` to `files.tooling`
