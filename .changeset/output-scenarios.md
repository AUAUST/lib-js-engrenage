---
"@auaust/engrenage": minor
---

- Add the `--output <scenario>` run option and detect the scenario otherwise: `agent` for agents, CI and output without a TTY, else `human`
- Add the rich and JSON printers, data entries, scenarios, detectors and per-command printer bindings to `future/nexus/cli`
- Replace the `printer` option of `runProgram` with `scenarios` and `detectors`
- Replace the `--json` flag of `metalbrain debt` with `--output json`
