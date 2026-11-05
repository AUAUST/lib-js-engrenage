// @barrel setup/*.ts named
export { createVscodeExtensionsStep } from "#tools/vscode/setup/createVscodeExtensionsStep";
export { createVscodeSettingsStep } from "#tools/vscode/setup/createVscodeSettingsStep";
export { syncVscodeFiles } from "#tools/vscode/setup/syncVscodeFiles";
// @end

// @barrel operations/*.ts named
export { resolveVscode } from "#tools/vscode/operations/resolveVscode";
// @end

// @barrel config/schemas/*.ts named
export { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";
// @end

// @barrel types/*.ts all
export * from "#tools/vscode/types/Integration";
export * from "#tools/vscode/types/ResolvedVscode";
export * from "#tools/vscode/types/Setting";
export * from "#tools/vscode/types/Settings";
export * from "#tools/vscode/types/VscodeInput";
// @end
