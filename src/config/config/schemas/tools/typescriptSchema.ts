import {
  description,
  optional,
  pipe,
  record,
  strictObject,
  string,
  unknown,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { fileSchema } from "#config/config/schemas/values/fileSchema";
import { globListSchema } from "#config/config/schemas/values/globListSchema";
import { listOptionSchema } from "#config/config/schemas/values/listOptionSchema";
import { managedListOptionSchema } from "#config/config/schemas/values/managedListOptionSchema";
import { defaultEnvFile } from "#config/constants";

export const typescriptSchema = strictObject({
  tsconfig: optional(
    pipe(
      strictObject({
        path: optional(
          pipe(
            fileSchema,
            description(
              join(
                [
                  "File of the base tsconfig, which references the tsconfig of every environment and is the one editors and typed lint discover.",
                  "@default `tsconfig.json`, created by sync when missing; another name warns",
                ],
                "\n",
              ),
            ),
          ),
        ),
        extends: optional(
          pipe(
            managedListOptionSchema(string()),
            description(
              join(
                [
                  "Value of `extends` in the base tsconfig.",
                  "`false` leaves the field to the file.",
                  "@default the `library` tsconfig of `@auaust/engrenage` with the `library` preset, its `base` tsconfig otherwise",
                ],
                "\n",
              ),
            ),
          ),
        ),
        compilerOptions: optional(
          pipe(
            record(string(), unknown()),
            description(
              join(
                [
                  "Options written into `compilerOptions` of the base tsconfig, after the ones engrenage derives.",
                  "Unset, only the derived options are written.",
                ],
                "\n",
              ),
            ),
          ),
        ),
        unmanaged: optional(
          pipe(
            listOptionSchema(string()),
            description(
              join(
                [
                  "Dotted paths in the base tsconfig (such as `compilerOptions.paths`) that sync never writes.",
                  "@default none",
                ],
                "\n",
              ),
            ),
          ),
        ),
      }),
      description("Options of the base tsconfig that sync writes."),
    ),
  ),
  files: optional(
    pipe(
      globListSchema,
      description(
        join(
          [
            "Globs of the TypeScript files inside every environment directory, feeding the tsconfig `include` and the published file scopes.",
            // @debt the glob defaults are described in words and hand-synced with their constants; the description could be derived from the constants
            "@default every `.ts` and `.tsx` file at any depth",
          ],
          "\n",
        ),
      ),
    ),
  ),
  envFile: optional(
    pipe(
      fileSchema,
      description(
        join(
          [
            "Declaration file where sync writes the `define.values` globals, within a marked block.",
            "It is added to the tsconfig `include` of the environments that define globals.",
            `@default \`${defaultEnvFile}\``,
          ],
          "\n",
        ),
      ),
    ),
  ),
});
