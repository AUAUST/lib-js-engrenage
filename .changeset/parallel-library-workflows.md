---
"@auaust/engrenage": minor
---

- Run the library workflows' check, test and build as parallel jobs; the publish workflow releases in a final job that waits for all three and reuses the build job's output. Upgrade: run `engrenage sync` to regenerate the workflows, and update any required status checks to the new job names.
- Add the `github.testShards` option, splitting the tests into that many parallel CI jobs through Vitest's `--shard`
- Fix the publish step looking up a private package anonymously, which made changesets retry the published version on every push to the base branch: the release step now receives `NPM_READ_TOKEN`
- Serialize the publish workflow runs of a branch
