---
"@auaust/engrenage": minor
---

- Workers run at `low` effort by default and `medium` for `involved` or `complex` leaves; debuggers keep `medium`, `low` for `trivial` and `high` for `complex`
- Skill agents declare their effort per `complexity` in `agent.efforts`; Codex gets one `<agent>_<effort>` profile per effort it names besides the default, replacing the fixed `_low` and `_high` profiles of gated agents
