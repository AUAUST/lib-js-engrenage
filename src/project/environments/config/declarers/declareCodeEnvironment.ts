import { declareStructureOptions } from "#batiment/environments/index";
import {
  declareList,
  directorySchema,
  globSchema,
} from "#foundation/options/index";
import { declareEnvironmentTsconfig } from "#project/tsconfig/index";
import type { Directories } from "#types/Directories";

export function declareCodeEnvironment(
  name: string,
  defaults: { dirs: Directories },
) {
  return {
    ...declareStructureOptions(),
    dirs: declareList(directorySchema, {
      description: [
        `Directories of the ${name} environment: its files of the languages it selects (\`languages\`) are included in its tsconfig, linted with its rules and, for \`src\` and \`bin\`, published.`,
        "The environment is inactive when none holds a file Git does not ignore.",
      ],
      optional: { value: defaults.dirs },
    }),
    generated: declareList(globSchema, {
      description: [
        `Globs, inside the ${name} directories, of files produced by tools.`,
        "They are ignored by ESLint's generated-file rules and listed in the Prettier ignore file.",
      ],
      optional: { value: [] },
    }),
    discovered: declareList(globSchema, {
      description: [
        `Globs, inside the ${name} directories, of files that tools discover by path and that may export defaults.`,
        "ESLint lifts its default-export restriction for them.",
      ],
      optional: { value: [] },
    }),
    tsconfig: declareEnvironmentTsconfig(name, {
      description: [
        `Options of the tsconfig that sync writes for the ${name} environment.`,
        "`false` manages none.",
      ],
      explain: `\`tsconfig.${name}.json\` with derived options`,
    }),
  };
}
