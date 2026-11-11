import { keys } from "@auaust/toolkit/object";

import { typeMeanings } from "#tools/github/issues/contract/constants";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";

export function findTypeMeaning(
  protocol: IssueProtocol,
  name: string | undefined,
): IssueType | undefined {
  return name === undefined
    ? undefined
    : keys(typeMeanings).find((meaning) => protocol.types[meaning] === name);
}
