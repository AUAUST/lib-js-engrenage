## Instruction maintenance

- Never modify AGENTS.md or `.claude/rules/` unless the user explicitly asks to change agent instructions. Finishing a feature, refactor or new convention does not authorize it; mention the suggested change in your report instead.
- A `<!-- @reference <reference> -->` marker opens a block that `engrenage sync agents` fills with the referenced file, up to the next `@reference` or `<!-- @end -->` marker. Never edit blocks in place: add project rules after an `@end` marker, or change the referenced source.
- AGENTS.md holds only rules every agent needs. Surface-specific detail lives in `.claude/rules/`, one file per surface. Neither holds feature documentation, file inventories, API details or records of recent changes.
- When a rule becomes mechanically enforced, list it under the matching "Enforced by tooling" line and keep prose only for what tools cannot check.
