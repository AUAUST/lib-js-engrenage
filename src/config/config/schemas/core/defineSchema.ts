import {
  boolean,
  check,
  custom,
  pipe,
  rawTransform,
  record,
  regex,
  string,
  union,
  unknown,
  type GenericSchema,
} from "valibot";

import { includes } from "@auaust/primitive-kit/arrays";
import { isFinite } from "@auaust/primitive-kit/numbers";
import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

import {
  defaultDefineTypes,
  defaultGlobalScope,
  definitionKey,
  globalNamePattern,
  globalScopes,
} from "#config/constants";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { validate } from "#foundation/options/utils/validate";
import type { ConfigContext } from "#config/types/ConfigContext";
import type { Definition } from "#config/types/Definition";
import type { GlobalsFactory } from "#config/types/GlobalsFactory";
import type { ResolvedGlobal } from "#config/types/ResolvedGlobal";
import type { ResolvedGlobals } from "#config/types/ResolvedGlobals";
import type { JsonValue } from "#support/json/types/JsonValue";

function isDefinition(input: unknown): input is Definition {
  return isPlainObject(input) && input[definitionKey] === true;
}

function assertSerializable(key: string, value: unknown): unknown {
  if (isDefinition(value)) {
    throw new TypeError("Expected define() only as a top-level definition");
  }

  if (
    value == null ||
    isString(value) ||
    isBoolean(value) ||
    isFinite(value) ||
    isArray(value) ||
    isPlainObject(value)
  ) {
    return value;
  }

  throw new TypeError(
    key === ""
      ? "Expected a JSON-serializable value"
      : `Expected a JSON-serializable value at key "${key}"`,
  );
}

function serialize(value: unknown): string {
  const expression = JSON.stringify(value, assertSerializable);

  if (expression === undefined) {
    throw new TypeError("Expected a JSON-serializable value");
  }

  return expression;
}

function isValidDefinition(input: Definition): boolean {
  return (
    isBoolean(input.exact) &&
    (input.type === undefined || isString(input.type)) &&
    includes(globalScopes, input.scope) &&
    (input.description === undefined ||
      (isString(input.description) && !input.description.includes("*/")))
  );
}

function resolveGlobal(input: unknown): ResolvedGlobal {
  const definition = isDefinition(input) ? input : undefined;

  const expression = serialize(
    definition === undefined ? input : definition.value,
  );

  const value: JsonValue = JSON.parse(expression);

  return {
    expression,
    value,
    exact: definition?.exact ?? false,
    type: definition?.type,
    scope: definition?.scope ?? defaultGlobalScope,
    description: definition?.description,
  };
}

const globalValueSchema: GenericSchema<unknown, ResolvedGlobal> = pipe(
  unknown(),
  check((input) => {
    return !isDefinition(input) || isValidDefinition(input);
  }, "Expected a valid top-level definition"),
  rawTransform(({ dataset, addIssue, NEVER }) => {
    try {
      return resolveGlobal(dataset.value);
    } catch (error) {
      addIssue({
        message: error instanceof Error ? error.message : String(error),
      });

      return NEVER;
    }
  }),
);

export const globalsSchema: GenericSchema<
  Readonly<Record<string, unknown>>,
  ResolvedGlobals
> = record(
  pipe(
    string(),
    regex(
      globalNamePattern,
      "Expected an identifier or a dotted path such as import.meta.env.NAME",
    ),
  ),
  globalValueSchema,
);

export const defineSchema = declareObject(
  {
    types: declare(boolean(), {
      description:
        "Whether sync declares the `define.values` globals in the env file (`typescript.envFile`) and `build.typed` follows.",
      optional: { value: defaultDefineTypes },
    }),
    values: declare(
      union([globalsSchema, custom<GlobalsFactory>(isFunction)]),
      {
        description: [
          "Compile-time globals, by identifier or dotted path (such as `import.meta.env.NAME`) with a JSON-serializable value, optionally wrapped by `define()` for a type, scope and documentation.",
          "A function receives the `package.json` and the filesystem and returns them.",
          "They feed the `define` option of tsdown and Vite (hence Vitest) according to their scope, and the env file declarations.",
        ],
        optional: {
          value: {},
        },
        adjust(input, _fallback, context: ConfigContext) {
          if (!isFunction(input)) {
            return input;
          }

          const configFile = context.get("configFile");

          return validate(
            globalsSchema,
            input({
              packageJson: context.get("packageJson"),
              filesystem: context.get("filesystem"),
            }),
            `define.values of ${configFile ?? context.get("root")}`,
          );
        },
      },
    ),
  },
  {
    optional: true,
  },
);
