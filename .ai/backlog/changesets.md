# changesets

Changesets configuration and presets.

## 1. The GitHub changelog preset should give way to the default preset.

- why: `@changesets/changelog-github` (set in `.changeset/config.json`) is judged poor. Open: whether the GitHub preset remains selectable and what the `syncChangesetConfig` target writes by default.
- want: engrenage's generated and synced changeset configuration defaults to the default preset, not the GitHub one, and this repository's config follows.
- done: the default configuration uses the default preset.
