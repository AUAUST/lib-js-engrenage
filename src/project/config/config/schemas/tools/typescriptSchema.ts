import { basename } from "node:path";

import { record, string, unknown } from "valibot";

import { fileSchema } from "#config/config/schemas/values/fileSchema";
import { globSchema } from "#config/config/schemas/values/globsSchema";
import { defaultEnvFile, defaultTypescriptFiles } from "#config/constants";
import { declareList } from "#config/utils/declareList";
import { declareLocation } from "#config/utils/declareLocation";
import { declareManagedList } from "#config/utils/declareManagedList";
import { tsconfigFile } from "#constants";
import { declare } from "#options/utils/declare";
import { declareObject } from "#options/utils/declareObject";

export const typescriptSchema = declareObject(
  {
    tsconfig: declareObject(
      {
        path: declareLocation({
          description:
            "File of the base tsconfig, which references the tsconfig of every environment and is the one editors and typed lint discover.",
          optional: {
            value: tsconfigFile,
            explain: `\`${tsconfigFile}\`, created by sync when missing; another name warns`,
          },
          assert(file) {
            if (basename(file) !== tsconfigFile) {
              console.warn(
                `The base tsconfig ${file} is not named ${tsconfigFile}, the only name editors and typed lint discover`,
              );
            }
          },
        }),
        extends: declareManagedList(string(), {
          description: [
            "Value of `extends` in the base tsconfig.",
            "`false` leaves the field to the file.",
          ],
          explain:
            "the `library` tsconfig of `@auaust/engrenage` with the `library` preset, its `base` tsconfig otherwise",
        }),
        compilerOptions: declare(record(string(), unknown()), {
          description:
            "Options written into `compilerOptions` of the base tsconfig, after the ones engrenage derives.",
          optional: {
            value: {},
          },
        }),
        unmanaged: declareList(string(), {
          description:
            "Dotted paths in the base tsconfig (such as `compilerOptions.paths`) that sync never writes.",
          optional: { value: [] },
        }),
      },
      {
        description: "Options of the base tsconfig that sync writes.",
        optional: true,
      },
    ),
    files: declareList(globSchema, {
      description:
        "Globs of the TypeScript files inside every environment directory, feeding the tsconfig `include` and the published file scopes.",
      optional: { value: defaultTypescriptFiles },
    }),
    envFile: declare(fileSchema, {
      description:
        "Declaration file where sync writes the `define.values` globals, within a marked block. It is added to the tsconfig `include` of the environments that define globals.",
      optional: { value: defaultEnvFile },
    }),
  },
  {
    optional: true,
  },
);
