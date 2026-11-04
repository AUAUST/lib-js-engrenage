import { custom, optional, strictObject } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";

import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { ConfigInput } from "#types/ConfigInput";

function isConfigInput(input: unknown): boolean {
  return isPlainObject(input) || isFunction(input);
}

export const optionsSchema = strictObject({
  test: optional(
    custom<ConfigInput<Config, [ResolvedConfig, ConfigEnv]>>(isConfigInput),
  ),
});
