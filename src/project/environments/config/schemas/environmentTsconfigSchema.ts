import { declareEnvironmentTsconfig } from "#project/tsconfig/index";

export const environmentTsconfigSchema = declareEnvironmentTsconfig({
  description: [
    "Options of the tsconfigs that sync writes, one per active instance of the environment in each scope, the root and each workspace, only when its preset has a tsconfig.",
    "`false` manages none.",
  ],
  explain: "`tsconfig.<name>.json` in each scope root with derived options, for a preset with a tsconfig",
});
