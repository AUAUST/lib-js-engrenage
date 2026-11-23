import { omitRolesSchema, rolesSchema } from "#batiment/roles/index";
import { declare, declareObject, unset } from "#foundation/options/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import { aliasesSchema } from "#project/environments/config/schemas/aliasesSchema";
import {
  defaultSourceDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { exposedFilesSchema } from "#project/package/index";

export const sourceSchema = declareObject(
  {
    ...declareCodeEnvironment("src", {
      dirs: defaultSourceDirectories,
    }),
    roles: rolesSchema,
    omitRoles: omitRolesSchema,
    aliases: aliasesSchema,
    exports: declare(exposedFilesSchema, {
      description: [
        "Subpaths the package exposes besides its public domains, mapped to their source file; both sides use the same single `*` or none.",
        "A public domain, one holding the entry role's file, exposes that file on its own, so only other files are listed here; a subpath a public domain already exposes fails.",
        "They feed the tsdown entries, hence the `exports` of `package.json`, and the `paths` of the base tsconfig.",
      ],
      optional: unset("none, so only public domains are exposed"),
    }),
  },
  {
    description: [
      "The source environment: published code built by tsdown.",
      "`false` disables it, with its tsconfig, build entries and rules.",
    ],
    optional: true,
    disable: {
      value: {
        ...disabledCodeEnvironment,
        exports: undefined,
        aliases: {
          enabled: false,
          generated: false,
          define: {},
        },
      },
    },
  },
);
