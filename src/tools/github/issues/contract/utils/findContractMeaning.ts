import { issueContracts } from "#tools/github/issues/contract/constants";
import { findTypeMeaning } from "#tools/github/issues/contract/utils/findTypeMeaning";
import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";

function hasContract(meaning: IssueType): meaning is ContractMeaning {
  return meaning in issueContracts;
}

export function findContractMeaning(
  protocol: IssueProtocol,
  name: string | undefined,
): ContractMeaning | undefined {
  const meaning = findTypeMeaning(protocol, name);

  return meaning !== undefined && hasContract(meaning) ? meaning : undefined;
}
