import { compose } from "@auaust/toolkit/composer";
import { freeze, get as getProperty } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { resolveWithin } from "#foundation/filesystem/index";
import { declareSection, type Resolver } from "#foundation/options/index";
import { locateTsconfigPath } from "#project/config/operations/locateTsconfigPath";
import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ResolvedTypescript } from "#project/tsconfig/index";

export const typescriptSection = declareSection({
  name: "typescript",
  async resolve(
    _input,
    config: Resolver<ConfigContext>,
  ): Promise<ResolvedTypescript> {
    const option = await config.resolve(typescriptOptionsSection);

    const { tsconfig, verbatimModuleSyntax } = option;

    const base = once(() => {
      const configured = getProperty(
        tsconfig.compilerOptions,
        "verbatimModuleSyntax",
      );

      if (configured !== undefined && configured !== verbatimModuleSyntax) {
        throw new Error(
          `typescript.tsconfig.compilerOptions.verbatimModuleSyntax contradicts typescript.verbatimModuleSyntax (${verbatimModuleSyntax}): set the second option only`,
        );
      }

      return freeze(
        compose(
          {
            file: tsconfig.path.file,
            extends: tsconfig.extends,
            compilerOptions: verbatimModuleSyntax
              ? tsconfig.compilerOptions
              : { ...tsconfig.compilerOptions, verbatimModuleSyntax },
            unmanaged: tsconfig.unmanaged,
          },
          compose.getters({
            path: () => Promise.try(() => locateTsconfigPath(config)),
          }),
        ),
      );
    });

    return freeze(
      compose(
        {
          files: option.files,
          verbatimModuleSyntax,
        },
        compose.getters({
          tsconfig: base,
          envFile: () => resolveWithin(config.context.root, option.envFile),
        }),
      ),
    );
  },
});
