import { map } from "@auaust/primitive-kit/arrays";
import { record, values } from "@auaust/toolkit/object";

import type { LoadedConfig } from "#project/config/index";
import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

import * as builtins from "#workflows/builtins/entry";

// @debt `Section` erases its declaration's type, so `ConfigInput` cannot be checked against these sections by type and every reader must assert each declaration is present
export async function composeInputSchemas(
  config: LoadedConfig,
): Promise<Record<string, ConfigSchema>> {
  const owners = new Set<unknown>(values(builtins));

  const declared = await Promise.all(
    config.context.registry
      .list("keys")
      .filter(({ owner }) => owners.has(owner))
      .map(async ({ key, declaration: { input, load } }) => {
        if (input === undefined) {
          return [];
        }

        const { declaration } = await load();

        if (declaration === undefined) {
          throw new Error(`Config key ${key} has no declaration`);
        }

        return [
          {
            key,
            input,
            schema: declaration.schema,
          },
        ];
      }),
  );

  const schemas = new Map<string, { key: string; schema: ConfigSchema }>();

  for (const { key, input, schema } of declared.flat()) {
    const known = schemas.get(input);

    if (known === undefined) {
      schemas.set(input, { key, schema });
    } else if (known.schema !== schema) {
      throw new Error(
        `Input "${input}" is declared by keys "${known.key}" and "${key}" with different schemas`,
      );
    }
  }

  return record(
    map([...schemas], ([input, { schema }]) => [input, schema] as const),
  );
}
