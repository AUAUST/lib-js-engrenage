---
"@auaust/engrenage": minor
---

`engrenage sync workflows` (`syncWorkflowFiles` from the new `@auaust/engrenage/github` entry) writes the GitHub Actions workflows of a workflow set into `.github/workflows/`. Each file starts with a generated header and is overwritten as a whole. A project uses the set named after one of its presets, provided it declares the set's required packages. The new `github.workflows` config key picks a set explicitly, or turns the workflows off with `false`. `@auaust/engrenage/github/constants` exports `workflowSets`, and the templates ship as `@auaust/engrenage/github/workflows/<set>/*.yml`.

The `library` set needs `@changesets/cli` and the `ci:check`, `ci:test`, `ci:build` and `ci:publish` scripts; sync fails when `package.json` does not declare one of them.

- `ci.yml` runs on pull requests and on pushes to branches other than `main`. It installs with `--frozen-lockfile`, then runs `ci:check`, `ci:test` and `ci:build` as separate steps.
- `publish.yml` runs on pushes to `main`. It runs the same steps, then `changesets/action` with `ci:publish`, and declares `id-token`, `contents` and `pull-requests: write`.
- Node is set up with `node-version-file: package.json`, so the project declares its CI Node version in `devEngines.runtime` (or `engines.node`). pnpm comes from `devEngines.packageManager`.

`PackageJson` exposes `scripts`.
