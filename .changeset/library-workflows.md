---
"@auaust/engrenage": minor
---

`engrenage sync workflows` (`syncWorkflowFiles` from the new `@auaust/engrenage/github` entry) writes `.github/workflows/ci.yml` and `publish.yml` from the templates shipped in `@auaust/engrenage/github/workflows/*.yml`. Each file starts with a generated header and is overwritten as a whole. The workflows apply by default to `library` projects that depend on `@changesets/cli`. The new `github.workflows` config key forces them on or off.

- `ci.yml` runs on pull requests and on pushes to branches other than `main`. It installs with `--frozen-lockfile` and runs the prepare script.
- `publish.yml` runs on pushes to `main`. It runs the same steps, then `changesets/action` with the publish script, and declares `id-token`, `contents` and `pull-requests: write`.
- Node is set up with `node-version-file: package.json`, so the project declares its CI Node version in `devEngines.runtime` (or `engines.node`). pnpm comes from `devEngines.packageManager`.
- The script names come from `github.prepareScript` and `github.publishScript`, which default to `ci:prepare` and `ci:publish`. Sync fails when `package.json` does not declare them.

`PackageJson` exposes `scripts`.
