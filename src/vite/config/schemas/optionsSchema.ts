import { custom, optional, strictObject } from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";

import type { ConfigLayer } from "#vite/types/ConfigLayer";

export const optionsSchema = strictObject({
  test: optional(custom<ConfigLayer>(isFunction)),
});
