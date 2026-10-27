import { custom, optional, strictObject } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";

import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { Config } from "#vite/types/Config";
import type { ConfigEnv } from "#vite/types/ConfigEnv";

function isConfigInput(input: unknown): boolean {
  return isPlainObject(input) || isFunction(input);
}

export const optionsSchema = strictObject({
  test: optional(
    custom<ConfigInput<Config, [ResolvedConfig, ConfigEnv]>>(isConfigInput),
  ),
});
