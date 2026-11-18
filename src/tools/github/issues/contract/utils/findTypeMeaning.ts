import { keys } from "@auaust/toolkit/object";

import { typeMeanings } from "#tools/github/issues/contract/constants";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";

export function findTypeMeaning(
  contractNames: ContractNames,
  name: string | undefined,
): IssueType | undefined {
  return name === undefined
    ? undefined
    : keys(typeMeanings).find((meaning) => {
        return contractNames.types[meaning] === name;
      });
}
