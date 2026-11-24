import type { PackageName } from "#types/PackageName";

type PresetName = (string & {}) | keyof Engrenage.Presets;

/**
 * When an extension is active in a scope: `installed` while the scope depends on
 * that package; `preset` while the scope's input selects that preset, and the
 * package installed when both are set; `config`, a dotted config key path, while
 * that key resolves to `true`.
 */
export type ExtensionActivation =
  | { readonly installed: PackageName; readonly preset?: PresetName }
  | { readonly preset: PresetName }
  | { readonly config: string };
