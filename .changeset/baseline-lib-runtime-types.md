---
"@auaust/engrenage": minor
---

- **Breaking:** derive the JavaScript built-in types of a baseline `src` from the consumer-installed `typescript-baseline-lib`: `noLib: true`, no `lib`, `typescript-baseline-lib/year/<Y>` first in `types` and `target: "ESNext"`, with `Y` the last Baseline year entirely widely available at the `src.baseline` snapshot
- **Breaking:** remove the `tsconfig/baseline/*.json` and `tsconfig/node/*.json` presets; Node environments get `lib` and `target` `ESNext`, with the Node surface from the installed `@types/node`
- **Breaking:** require `src.baseline` (or `src.node`) when the `src` environment is active and reject `<env>.tsconfig.lib` on baseline runtimes; `engrenage init` writes the current month
- **Breaking:** make `typescript-baseline-lib`, `baseline-browser-mapping` and `node-releases` peer dependencies, installed by `engrenage init`
- Validate Node majors against `node-releases` instead of the removed preset files
