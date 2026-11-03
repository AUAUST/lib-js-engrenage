# changesets

Changesets configuration and presets.

## 1. The GitHub changelog preset should give way to the default preset.

- Matter: `@changesets/changelog-github` (set in `.changeset/config.json`) is judged poor; the default changelog preset should be the default again.
- Expected: engrenage's generated and synced changeset configuration defaults to the default preset, not the GitHub one, and this repository's config follows.
- Open: whether the GitHub preset remains selectable and what the `syncChangesetConfig` target writes by default.
- Done when the default configuration uses the default preset.
