import type { Lit } from "sh-syntax";

import { isArray } from "@auaust/toolkit";

import { isNode } from "#foundation/shell/utils/isNode";
import { readPlainParameter } from "#foundation/shell/utils/readPlainParameter";

function bindsName(text: string, name: string) {
  return (
    text === name ||
    text.startsWith(`${name}=`) ||
    text.startsWith(`${name}+=`) ||
    text.startsWith(`${name}[`)
  );
}

export function isRebound(value: unknown, name: string, own: Lit): boolean {
  if (isArray(value)) {
    return value.some((item) => isRebound(item, name, own));
  }

  if (!isNode(value) || value === own) {
    return false;
  }

  if (value.type === "Lit" || value.type === "SglQuoted") {
    return bindsName(value.value, name);
  }

  if (value.type === "ParamExp" && value.param?.value === name) {
    return readPlainParameter(value) === undefined;
  }

  return Object.values(value).some((child) => isRebound(child, name, own));
}
