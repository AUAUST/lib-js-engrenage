---
"@auaust/engrenage": minor
---

- Select the build tool (`build.tool`), the formatter (`format.formatter`) and the preset (`preset`) among the engines extensions contribute; `false` selects none, and an unset `build.tool` or `format.formatter` selects the only active engine
- Let a preset contribute option values by input path, replacing the defaults of those options; the config's own input wins
- Check `agents.preferred` against the agent runtimes extensions contribute
- Pass the loaded config to a `Formatter`, and to `formatContent` and `formatFile`, instead of the project root
- Resolve `preset` to the selected preset entry, or `false`
