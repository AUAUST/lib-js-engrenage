import { boolean, record, string, unknown } from "valibot";

import { tsconfigFile } from "#constants";
import {
  declare,
  declareList,
  declareLocation,
  declareManagedList,
  declareObject,
} from "#foundation/options/index";

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
  },
  {
    optional: true,
  },
);
