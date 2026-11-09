import { custom, is } from "valibot";

import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isObject } from "@auaust/toolkit/isObject";

import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/index";
import type { ResolvedEnvironment } from "#project/environments/ports/ResolvedEnvironment";

const resolvedEnvironment = custom<ResolvedEnvironment>((value) => {
  return (
    isObject(value) &&
    "active" in value &&
    isBoolean(value.active) &&
    "dirs" in value &&
    isArray(value.dirs)
  );
});

export async function readEnvironment(
  config: Resolver<ConfigContext>,
  name: string,
): Promise<ResolvedEnvironment> {
  const resolved = await config.resolve(name);

  if (!is(resolvedEnvironment, resolved)) {
    throw new Error(
      `Config key "${name}" resolves to no environment: it lacks a boolean \`active\` or a \`dirs\` list`,
    );
  }

  return resolved;
}
