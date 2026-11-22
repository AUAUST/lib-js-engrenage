// @barrel operations
export { getRuleReferences } from "#metalbrain/instructions/operations/getRuleReferences";
export { listReferenceFiles } from "#metalbrain/instructions/operations/listReferenceFiles";
export { listStaleSkillFiles } from "#metalbrain/instructions/operations/listStaleSkillFiles";
export { migrateBacklogIndex } from "#metalbrain/instructions/operations/migrateBacklogIndex";
export { migrateInstructionLocations } from "#metalbrain/instructions/operations/migrateInstructionLocations";
export { parseInstruction } from "#metalbrain/instructions/operations/parseInstruction";
export { removeReferenceBlock } from "#metalbrain/instructions/operations/removeReferenceBlock";
export { resolveAgentReference } from "#metalbrain/instructions/operations/resolveAgentReference";
export { syncFrontmatter } from "#metalbrain/instructions/operations/syncFrontmatter";
// @end

// @barrel ports
export type * from "#metalbrain/instructions/ports/GeneratedRule";
export type * from "#metalbrain/instructions/ports/InstructionFormatter";
// @end

// @barrel types
export type * from "#metalbrain/instructions/types/FragmentConditions";
export type * from "#metalbrain/instructions/types/FragmentRenderer";
export type * from "#metalbrain/instructions/types/GeneratedFrontmatter";
export type * from "#metalbrain/instructions/types/SkillRendering";
// @end

// @barrel utils
export { createInstructionFile } from "#metalbrain/instructions/utils/createInstructionFile";
export { createSkillFileFiller } from "#metalbrain/instructions/utils/createSkillFileFiller";
export { filterConditionalBlocks } from "#metalbrain/instructions/utils/filterConditionalBlocks";
export { formatBacklogIndex } from "#metalbrain/instructions/utils/formatBacklogIndex";
export { formatReferenceMarker } from "#metalbrain/instructions/utils/formatReferenceMarker";
export { isSkillFileReference } from "#metalbrain/instructions/utils/isSkillFileReference";
export { isSupportingReference } from "#metalbrain/instructions/utils/isSupportingReference";
export { listFormerReferences } from "#metalbrain/instructions/utils/listFormerReferences";
export { listInstructionMarkers } from "#metalbrain/instructions/utils/listInstructionMarkers";
export { listMentionedFiles } from "#metalbrain/instructions/utils/listMentionedFiles";
export { listReferenceBlocks } from "#metalbrain/instructions/utils/listReferenceBlocks";
export { listReferences } from "#metalbrain/instructions/utils/listReferences";
export { relocateInstructionReference } from "#metalbrain/instructions/utils/relocateInstructionReference";
export { renderFragment } from "#metalbrain/instructions/utils/renderFragment";
// @end
