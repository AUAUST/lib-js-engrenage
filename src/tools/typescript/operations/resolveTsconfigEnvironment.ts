import { custom, is } from "valibot";

import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isObject } from "@auaust/toolkit/isObject";

import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigEnvironment } from "#tools/typescript/types/TsconfigEnvironment";

// @debt the check covers the shape of the fields, so their contents and the runtime a contributed environment resolves are trusted unchecked
const tsconfigEnvironment = custom<TsconfigEnvironment>((value) => {
  return (
    isObject(value) &&
    "active" in value &&
    isBoolean(value.active) &&
    "dirs" in value &&
    isArray(value.dirs) &&
    "globs" in value &&
    isArray(value.globs) &&
    "defines" in value &&
    isBoolean(value.defines) &&
    "tsconfig" in value &&
    isObject(value.tsconfig) &&
    "runtime" in value
  );
});

export async function resolveTsconfigEnvironment(
  config: Resolver<ConfigContext>,
  name: string,
): Promise<TsconfigEnvironment> {
  const environment = await config.resolve(name);

  if (!is(tsconfigEnvironment, environment)) {
    throw new Error(
      `Config key "${name}" of an environment with a tsconfig resolves to no \`active\`, \`dirs\`, \`globs\`, \`defines\`, \`tsconfig\` and \`runtime\``,
    );
  }

  return environment;
}
