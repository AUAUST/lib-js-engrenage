import { declareEnvironmentTsconfig } from "#project/tsconfig/index";

export const environmentTsconfigSchema = declareEnvironmentTsconfig({
  description: [
    "Options of the tsconfig that sync writes for the environment's instance in the root scope, only when its preset has a tsconfig.",
    "`false` manages none.",
  ],
  explain: "`tsconfig.<name>.json` with derived options, for a preset with a tsconfig",
});
