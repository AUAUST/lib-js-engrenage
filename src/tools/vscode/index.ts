// @barrel setup
export { createVscodeExtensionsStep } from "#tools/vscode/setup/createVscodeExtensionsStep";
export { createVscodeSettingsStep } from "#tools/vscode/setup/createVscodeSettingsStep";
export { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
// @end

// @barrel config/sections
export { vscodeSection } from "#tools/vscode/config/sections/vscodeSection";
// @end

// @barrel config/schemas
export { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";
// @end

// @barrel types
export type * from "#tools/vscode/types/Integration";
export type * from "#tools/vscode/types/ResolvedVscode";
export type * from "#tools/vscode/types/Setting";
export type * from "#tools/vscode/types/Settings";
export type * from "#tools/vscode/types/VscodeInput";
// @end
