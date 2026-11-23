import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";

/**
 * Builds a frozen namespace kind from the preset's defaults, each given option
 * replacing its field.
 */
export type NamespaceKindPreset = (
  options?: Partial<NamespaceKind>,
) => NamespaceKind;
