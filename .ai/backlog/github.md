# github

Generated GitHub workflows and templates.

## 1. Nested workflows are relocated by string substitution

- sites: `src/tools/github/operations/renderWorkflow.ts:9`, `:10`
- why: regex replacements silently stop matching when a template changes; the lockfile name repeats `tools/pnpm`'s resource.
- want: templated YAML; the lockfile location read from its owner.
