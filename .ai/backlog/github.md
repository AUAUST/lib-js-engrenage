# github

Generated GitHub workflows and templates.

## 1. Nested workflows are relocated by string substitution

- site: `src/tools/github/operations/renderWorkflow.ts:9`
- why: regex replacements on templates silently stop matching when a template changes.
- want: template the YAML instead.
