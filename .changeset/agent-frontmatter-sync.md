---
"@auaust/engrenage": minor
---

- Make `engrenage sync agents` maintain the frontmatter keys engrenage generates in skills, agents and rules (`name`, `description`, `model`, `disable-model-invocation`, `disallowedTools`, `paths`): it overwrites them, adds missing ones and removes those the source no longer produces, and `sync --check` reports the drift. Keys engrenage does not generate are never touched
- Add the `# @preserve <key>,<key>` YAML comment in a generated file's frontmatter to keep the listed keys as they are
