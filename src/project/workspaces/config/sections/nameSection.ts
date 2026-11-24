import { basename } from "node:path";

import { declareSection } from "#foundation/options/index";
import { nameSchema } from "#project/workspaces/config/schemas/nameSchema";
import { directoryPlaceholder } from "#project/workspaces/constants";
import type { ConfigResolver } from "#project/config/index";
import type { PackageName } from "#types/PackageName";

export const nameSection = declareSection({
  declaration: nameSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<PackageName | undefined> {
    const name = nameSchema.resolve(input, undefined, "name");

    if (name === undefined) {
      const { optional } = await config.resolve("packageJson");

      return optional.name;
    }

    return name.split(directoryPlaceholder).join(basename(config.context.root));
  },
});
