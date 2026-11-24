import { freeze, getOwn, record } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { environmentsSchema } from "#project/environments/config/schemas/environmentsSchema";
import { environmentTsconfigSchema } from "#project/environments/config/schemas/environmentTsconfigSchema";
import { createEnvironmentTsconfig } from "#project/environments/operations/createEnvironmentTsconfig";
import { listTsconfigRegistrations } from "#project/environments/operations/listTsconfigRegistrations";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedEnvironmentTsconfig } from "#project/tsconfig/index";

export const environmentTsconfigsSection = declareSection({
  declaration: environmentsSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, ResolvedEnvironmentTsconfig>>> {
    const [registrations, withTsconfig] = await Promise.all([
      config.resolve("environments"),
      listTsconfigRegistrations(config),
    ]);

    const registered = input ?? {};

    const names = new Set(withTsconfig.map(({ name }) => name));

    for (const { name, preset } of registrations) {
      if (
        !names.has(name) &&
        getOwn(registered, name)?.tsconfig !== undefined
      ) {
        throw new Error(
          `environments.${name}.tsconfig is set, but the preset ${preset} of the environment ${name} has no tsconfig: unset it`,
        );
      }
    }

    return freeze(
      record(
        withTsconfig.map(({ name }) => {
          const path = `environments.${name}.tsconfig`;

          const option = environmentTsconfigSchema.resolve(
            getOwn(registered, name)?.tsconfig,
            { reporter: config.context.reporter },
            path,
          );

          return [
            name,
            createEnvironmentTsconfig(config, name, option),
          ] as const;
        }),
      ),
    );
  },
});
