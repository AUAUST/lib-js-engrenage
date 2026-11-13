// @debt no code produces the `preset` source, so what a preset-classified node means is unstated
/**
 * Where a node's classification comes from: the config, a `.namespace.json` or
 * `.domain.json` metadata file, a preset, or the directory tree itself.
 *
 * @experimental
 */
export type StructureSource = "config" | "metadata" | "preset" | "inferred";
