// @barrel utils/*.ts named
export { createOptionSchema } from "#foundation/options/utils/createOptionSchema";
export { createSections } from "#foundation/options/utils/createSections";
export { declare } from "#foundation/options/utils/declare";
export { declareObject } from "#foundation/options/utils/declareObject";
export { declareRecord } from "#foundation/options/utils/declareRecord";
export { describeDefault } from "#foundation/options/utils/describeDefault";
export { listDefaults } from "#foundation/options/utils/listDefaults";
export { resolveDefault } from "#foundation/options/utils/resolveDefault";
export { unset } from "#foundation/options/utils/unset";
export { validate } from "#foundation/options/utils/validate";
// @end

// @barrel types/*.ts all
export * from "#foundation/options/types/Declaration";
export * from "#foundation/options/types/DeclarationEntries";
export * from "#foundation/options/types/Default";
export * from "#foundation/options/types/Description";
export * from "#foundation/options/types/InputOf";
export * from "#foundation/options/types/ObjectContext";
export * from "#foundation/options/types/ObjectDeclaration";
export * from "#foundation/options/types/ObjectInput";
export * from "#foundation/options/types/ObjectOutput";
export * from "#foundation/options/types/ObjectResolution";
export * from "#foundation/options/types/OptionContext";
export * from "#foundation/options/types/OutputOf";
// @end
