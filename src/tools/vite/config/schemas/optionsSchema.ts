import { custom, optional, strictObject } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";

import type { ConfigContext } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { Resolvable } from "#types/Resolvable";

function isResolvable(input: unknown): boolean {
  return isPlainObject(input) || isFunction(input);
}

export const optionsSchema = strictObject({
  test: optional(
    custom<Resolvable<Config, [ConfigContext, ConfigEnv]>>(isResolvable),
  ),
});
