## Instruction maintenance

- Never modify AGENTS.md or `.claude/rules/` unless the user explicitly asks to change agent instructions. Finishing a feature, refactor or new convention does not authorize it; mention the suggested change in your report instead.
- Blocks between `<!-- engrenage:… -->` markers are generated from `@auaust/engrenage/agents` by `engrenage agents sync`. Never edit them in place: add project rules outside the blocks, or change the shared source in `@auaust/engrenage`.
- AGENTS.md holds only rules every agent needs. Surface-specific detail lives in `.claude/rules/`, one file per surface. Neither holds feature documentation, file inventories, API details or records of recent changes.
- When a rule becomes mechanically enforced, list it under the matching "Enforced by tooling" line and keep prose only for what tools cannot check.
