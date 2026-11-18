// @barrel utils
export { createTagPreset } from "#project/docs/utils/createTagPreset";
export { listConventionalTags } from "#project/docs/utils/listConventionalTags";
export { readDocTag } from "#project/docs/utils/readDocTag";
export { splitDocTag } from "#project/docs/utils/splitDocTag";
// @end

// @barrel presets
export { alpha } from "#project/docs/presets/alpha";
export { author } from "#project/docs/presets/author";
export { beta } from "#project/docs/presets/beta";
export { callback } from "#project/docs/presets/callback";
export { classdesc } from "#project/docs/presets/classdesc";
export { defaultTag } from "#project/docs/presets/defaultTag";
export { defaultValue } from "#project/docs/presets/defaultValue";
export { deprecated } from "#project/docs/presets/deprecated";
export { desc } from "#project/docs/presets/desc";
export { description } from "#project/docs/presets/description";
export { eventProperty } from "#project/docs/presets/eventProperty";
export { example } from "#project/docs/presets/example";
export { experimental } from "#project/docs/presets/experimental";
export { internal } from "#project/docs/presets/internal";
export { license } from "#project/docs/presets/license";
export { module } from "#project/docs/presets/module";
export { overload } from "#project/docs/presets/overload";
export { override } from "#project/docs/presets/override";
export { packageDocumentation } from "#project/docs/presets/packageDocumentation";
export { param } from "#project/docs/presets/param";
export { privateRemarks } from "#project/docs/presets/privateRemarks";
export { privateTag } from "#project/docs/presets/privateTag";
export { property } from "#project/docs/presets/property";
export { protectedTag } from "#project/docs/presets/protectedTag";
export { publicTag } from "#project/docs/presets/publicTag";
export { readonly } from "#project/docs/presets/readonly";
export { remarks } from "#project/docs/presets/remarks";
export { returns } from "#project/docs/presets/returns";
export { satisfies } from "#project/docs/presets/satisfies";
export { sealed } from "#project/docs/presets/sealed";
export { see } from "#project/docs/presets/see";
export { since } from "#project/docs/presets/since";
export { stable } from "#project/docs/presets/stable";
export { template } from "#project/docs/presets/template";
export { throws } from "#project/docs/presets/throws";
export { type } from "#project/docs/presets/type";
export { typedef } from "#project/docs/presets/typedef";
export { typeParam } from "#project/docs/presets/typeParam";
export { virtual } from "#project/docs/presets/virtual";
// @end

// @barrel types
export type * from "#project/docs/types/DocSignature";
export type * from "#project/docs/types/DocsInput";
export type * from "#project/docs/types/DocTag";
export type * from "#project/docs/types/SourceDeclaration";
export type * from "#project/docs/types/TagDeclaration";
export type * from "#project/docs/types/TagPreset";
// @end

// @barrel ports
export type * from "#project/docs/ports/Declarations";
export type * from "#project/docs/ports/TagSetEntry";
// @end

// @barrel config/schemas
export { docsSchema } from "#project/docs/config/schemas/docsSchema";
export { tagDeclarationSchema } from "#project/docs/config/schemas/tagDeclarationSchema";
// @end

// @barrel config/sections
export { docsSection } from "#project/docs/config/sections/docsSection";
// @end
