import { applyInputDefaults } from "#foundation/options/utils/applyInputDefaults";
import { findValueOrigin } from "#foundation/options/utils/findValueOrigin";
import { validate } from "#foundation/options/utils/validate";
import type { InputReader } from "#foundation/options/apis/InputReader";
import type { Resolver } from "#foundation/options/apis/Resolver";
import type { Declaration } from "#foundation/options/ports/Declaration";
import type { InputLayer } from "#foundation/options/types/InputLayer";
import type { ValueOrigin } from "#foundation/options/types/ValueOrigin";
import type { Reporter } from "#foundation/reports/index";

interface ValidatedInput {
  readonly value: unknown;
  readonly layers: readonly InputLayer[];
  readonly origins: ReadonlyMap<string, string>;
}

export function createInputReader<Context>(
  input: Readonly<Record<string, unknown>>,
  {
    source,
    defaults,
    reporter,
  }: {
    source: string | undefined;
    defaults:
      | ((
          name: string,
          reader: Resolver<Context>,
        ) => Promise<readonly InputLayer[]>)
      | undefined;
    reporter: Reporter;
  },
): InputReader<Context> {
  const inputs = new Map<
    string,
    Map<Declaration<unknown, unknown, unknown>, Promise<ValidatedInput>>
  >();

  async function validateInput(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<ValidatedInput> {
    const layers = defaults === undefined ? [] : await defaults(name, reader);

    const {
      value,
      origins,
    } = applyInputDefaults(input[name], name, layers, reporter);

    function locate(path: string): string | undefined {
      const origin = findValueOrigin(
        input[name],
        name,
        path === "" ? name : `${name}.${path}`,
        layers,
        origins,
      );

      return origin.layer === "default" ? origin.name : undefined;
    }

    const validated = validate(
      declaration.schema,
      value,
      source === undefined ? `${name} config` : `${name} config in ${source}`,
      locate,
    );

    return {
      value: validated,
      layers,
      origins,
    };
  }

  function readValidated(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<ValidatedInput> {
    const validated = inputs.get(name) ?? new Map();

    const cached = validated.get(declaration);

    if (cached !== undefined) {
      return cached;
    }

    const pending = validateInput(name, declaration, reader);

    validated.set(declaration, pending);
    inputs.set(name, validated);

    pending.catch(() => {
      if (validated.get(declaration) === pending) {
        validated.delete(declaration);
      }
    });

    return pending;
  }

  async function read(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<unknown> {
    const { value } = await readValidated(name, declaration, reader);

    return value;
  }

  async function origin(
    name: string,
    path: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<ValueOrigin> {
    const { layers, origins } = await readValidated(name, declaration, reader);

    return findValueOrigin(input[name], name, path, layers, origins);
  }

  return { read, origin };
}
