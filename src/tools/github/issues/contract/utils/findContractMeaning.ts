import { issueContracts } from "#tools/github/issues/contract/constants";
import { findTypeMeaning } from "#tools/github/issues/contract/utils/findTypeMeaning";
import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";

function hasContract(meaning: IssueType): meaning is ContractMeaning {
  return meaning in issueContracts;
}

export function findContractMeaning(
  contractNames: ContractNames,
  name: string | undefined,
): ContractMeaning | undefined {
  const meaning = findTypeMeaning(contractNames, name);

  return meaning !== undefined && hasContract(meaning) ? meaning : undefined;
}
