import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

/**
 * Finds a segment listed directly in a segment's sub-issues.
 */
export function checkNesting(
  meaning: ContractMeaning | undefined,
  parent: ContractMeaning | undefined,
): IssueFinding[] {
  return meaning === "segment" && parent === "segment"
    ? [
        {
          rule: "nested-segment",
          message: "A Segment directly under a Segment: list its members in the parent Segment instead.",
        },
      ]
    : [];
}
