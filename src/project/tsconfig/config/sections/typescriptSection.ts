import { object } from "@auaust/toolkit";
import { compose } from "@auaust/toolkit/composer";
import { once } from "@auaust/toolkit/function";

import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTypescript } from "#project/tsconfig/types/ResolvedTypescript";

export const typescriptSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTypescript> {
    const option = await config.resolve("typescript.options");

    const { tsconfig, verbatimModuleSyntax } = option;

    const base = once(() => {
      const configured = object.get(
        tsconfig.compilerOptions,
        "verbatimModuleSyntax",
      );

      if (configured !== undefined && configured !== verbatimModuleSyntax) {
        throw new Error(
          `typescript.tsconfig.compilerOptions.verbatimModuleSyntax contradicts typescript.verbatimModuleSyntax (${verbatimModuleSyntax}): set the second option only`,
        );
      }

      return object.freeze({
        file: tsconfig.path.file,
        extends: tsconfig.extends,
        compilerOptions: verbatimModuleSyntax
          ? tsconfig.compilerOptions
          : { ...tsconfig.compilerOptions, verbatimModuleSyntax },
        unmanaged: tsconfig.unmanaged,
      });
    });

    return object.freeze(
      compose(
        {
          verbatimModuleSyntax,
        },
        compose.getters({
          tsconfig: base,
        }),
      ),
    );
  },
});
