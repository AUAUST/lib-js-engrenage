import { freeze } from "@auaust/toolkit/object";

import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";
import type { NamespaceKindPreset } from "#batiment/scopes/types/NamespaceKindPreset";

/**
 * Creates a namespace kind preset declaring a kind with `defaults`, for a project
 * or an extension to declare its own kinds.
 */
export function createNamespaceKindPreset(
  defaults: NamespaceKind,
): NamespaceKindPreset {
  return function preset(options = {}) {
    return freeze({ ...defaults, ...options });
  };
}
