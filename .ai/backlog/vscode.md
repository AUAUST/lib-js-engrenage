# vscode

VS Code project settings and synchronization.

## 1. Synced VS Code settings replace whole arrays.

- Where: `src/vscode/setup/syncVscodeFiles.ts`, `src/support/json/utils/flattenJsonObject.ts`
- Problem: settings are flattened to one edit per object path, so an array such as `eslint.rules.customizations` is written as a whole and a project's own entries are dropped on every `engrenage sync`.
- Fix: decide how arrays merge, for example by adding the missing entries keyed by `rule` and keeping the others.
