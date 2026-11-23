import type { RegisteredInstruction } from "#metalbrain/instructions/types/RegisteredInstruction";

/**
 * The instruction registry's entries in their order: built-ins in their listed
 * order, then contributions in the host's order.
 */
export type InstructionRegistry = readonly RegisteredInstruction[];
