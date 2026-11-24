import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Section } from "#foundation/options/index";
import {
  discoverDeclaredEnvironment,
  type ResolvedEnvironment,
} from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Creates the section of the theme namespace `name`: its directories and activity
 * as discovery places them, without code files.
 */
export function createNamespaceSection(
  name: string,
): Section<ResolvedEnvironment> {
  return declareSection({
    async resolve(
      _input,
      config: ConfigResolver,
    ): Promise<ResolvedEnvironment> {
      const { dirs, active } = await discoverDeclaredEnvironment(config, name);

      return freeze({ active, dirs });
    },
  });
}
