// @barrel operations
export { addAgentRules } from "#metalbrain/instructions/operations/addAgentRules";
export { createInstructionRegistry } from "#metalbrain/instructions/operations/createInstructionRegistry";
export { getMissingRuleTemplates } from "#metalbrain/instructions/operations/getMissingRuleTemplates";
export { getRegisteredTemplates } from "#metalbrain/instructions/operations/getRegisteredTemplates";
export { getRuleReferences } from "#metalbrain/instructions/operations/getRuleReferences";
export { getRuleTemplates } from "#metalbrain/instructions/operations/getRuleTemplates";
export { getSharedFiles } from "#metalbrain/instructions/operations/getSharedFiles";
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
export type * from "#metalbrain/instructions/ports/AgentFiller";
export type * from "#metalbrain/instructions/ports/AgentRuleGenerator";
export type * from "#metalbrain/instructions/ports/GeneratedRule";
export type * from "#metalbrain/instructions/ports/InstructionEntry";
export type * from "#metalbrain/instructions/ports/InstructionFormatter";
export type * from "#metalbrain/instructions/ports/InstructionMetadata";
export type * from "#metalbrain/instructions/ports/RuleEntry";
export type * from "#metalbrain/instructions/ports/SectionEntry";
export type * from "#metalbrain/instructions/ports/SkillEntry";
// @end

// @barrel types
export type * from "#metalbrain/instructions/types/ContributedInstruction";
export type * from "#metalbrain/instructions/types/FragmentConditions";
export type * from "#metalbrain/instructions/types/FragmentRenderer";
export type * from "#metalbrain/instructions/types/GeneratedFrontmatter";
export type * from "#metalbrain/instructions/types/InstructionKind";
export type * from "#metalbrain/instructions/types/InstructionRegistry";
export type * from "#metalbrain/instructions/types/RegisteredInstruction";
export type * from "#metalbrain/instructions/types/SkillRendering";
// @end

// @barrel utils
export { bindAgentFillers } from "#metalbrain/instructions/utils/bindAgentFillers";
export { createInstructionFile } from "#metalbrain/instructions/utils/createInstructionFile";
export { createSkillFileFiller } from "#metalbrain/instructions/utils/createSkillFileFiller";
export { createWordCapsFiller } from "#metalbrain/instructions/utils/createWordCapsFiller";
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
