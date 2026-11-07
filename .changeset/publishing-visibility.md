---
"@auaust/engrenage": minor
---

- **Breaking**: Make `@auaust/engrenage` private and `UNLICENSED`, so every install needs an npm account of the `@auaust` organization. Upgrade: complete steps 2–5 of [#199 §Manual steps](https://github.com/AUAUST/lib-js-engrenage/issues/199#manual-steps-outside-the-repository) (read token, GitHub secrets, hand-written workflows, other install environments) before upgrading.
- **Breaking**: Install with the `NPM_READ_TOKEN` secret in the synced library workflows (`registry-url` on `actions/setup-node`, `NODE_AUTH_TOKEN` on the install step only), publishing staying tokenless OIDC. Upgrade: give every consumer repository `NPM_READ_TOKEN` before its CI runs the upgraded workflows.
- **Breaking**: Resolve a published project with neither `visibility` nor `publishConfig.access` as `private`. Upgrade: set `visibility: "public"` to keep publishing publicly, and rename unscoped private packages under a scope.
- **Breaking**: Add the `publishing` sync target, failing `engrenage sync` and `sync --check` on a configuration that could publish a private package publicly: `"private": true` on a published root, a `publishConfig.access` or changesets `access` off the visibility, an unscoped or provenance-enabled private package, or credentials in a project `.npmrc`. Upgrade: fix what it lists.
- Add the top-level `visibility` option (`public` or `private`), falling back to `publishConfig.access`, then `private`; `engrenage init` asks it and derives the license from it
- Sync `publishConfig.access` from the visibility at the root and in every workspace of a published project, `"private": true` at the root of an unpublished one, and the changesets `access`
- Add the `workspaces` option (globs, a package name pattern such as `@scope/app-{dir}`, tsconfig options), syncing `pnpm-workspace.yaml#packages` and each workspace's managed `package.json` keys and `tsconfig.json`, included by tsdown, Vitest, ESLint and the base tsconfig, a workspace importing another only as a declared dependency
- Test libraries' built package through public specifiers in dist mode, failing on any resolution into the sources; skip the managed `tsconfig.tests.dist.json` without the `published` trait
