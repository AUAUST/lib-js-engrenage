import { basename } from "node:path";

import { boolean, record, string, unknown } from "valibot";

import { tsconfigFile } from "#constants";
import {
  declare,
  declareList,
  declareLocation,
  declareManagedList,
  declareObject,
  fileSchema,
  globSchema,
} from "#foundation/options/index";
import {
  defaultEnvFile,
  defaultTypescriptFiles,
} from "#project/tsconfig/constants";

export const typescriptSchema = declareObject(
  {
    tsconfig: declareObject(
      {
        path: declareLocation({
          description: "File of the base tsconfig, which references the tsconfig of every environment and is the one editors and typed lint discover.",
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
          explain: "the `library` tsconfig of `@auaust/engrenage` with the `published` trait, its `base` tsconfig otherwise",
        }),
        compilerOptions: declare(record(string(), unknown()), {
          description: "Options written into `compilerOptions` of the base tsconfig, after the ones engrenage derives.",
          optional: {
            value: {},
          },
        }),
        unmanaged: declareList(string(), {
          description: "Dotted paths in the base tsconfig (such as `compilerOptions.paths`) that sync never writes.",
          optional: { value: [] },
        }),
      },
      {
        description: "Options of the base tsconfig that sync writes.",
        optional: true,
      },
    ),
    verbatimModuleSyntax: declare(boolean(), {
      description: "Whether imports and exports are kept as written, which makes `typeOnly` roles enforceable. Sync writes `false` into the base tsconfig; with `false`, no role is type-only and the type import convention is off.",
      optional: { value: true },
    }),
    files: declareList(globSchema, {
      description: "Globs of the TypeScript files inside every environment directory, feeding the tsconfig `include` and the published file scopes.",
      optional: { value: defaultTypescriptFiles },
    }),
    envFile: declare(fileSchema, {
      description: "Declaration file where sync writes the `define.values` globals, within a marked block. It is added to the tsconfig `include` of the environments that define globals.",
      optional: { value: defaultEnvFile },
    }),
  },
  {
    optional: true,
  },
);
