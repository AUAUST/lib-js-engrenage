import type { JsonEdit } from "#foundation/json/index";

export function isLeftAlone(edit: JsonEdit, leftAlone: readonly string[]) {
  const path = edit.path.join(".");

  return leftAlone.some((alone) => {
    return path === alone || path.startsWith(`${alone}.`);
  });
}
