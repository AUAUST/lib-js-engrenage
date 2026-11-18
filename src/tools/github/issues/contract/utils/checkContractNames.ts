import { entries, keys } from "@auaust/toolkit/object";

import {
  fieldMeanings,
  optionMeanings,
  typeMeanings,
} from "#tools/github/issues/contract/constants";
import type { GithubSnapshot } from "#tools/github/issues/api/index";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";

export function checkContractNames(
  contractNames: ContractNames,
  snapshot: GithubSnapshot,
): string[] {
  const problems: string[] = [];

  for (const [organization, { types, fields }] of entries(
    snapshot.organizations,
  )) {
    const where = `the ${organization} organization of the snapshot`;

    for (const meaning of keys(typeMeanings)) {
      const name = contractNames.types[meaning];

      if (!types.some((type) => type.name === name)) {
        problems.push(
          `type meaning \`${meaning}\` maps to "${name}", which is no type of ${where}`,
        );
      }
    }

    for (const meaning of keys(fieldMeanings)) {
      const name = contractNames.fields[meaning];

      if (!fields.some((field) => field.name === name)) {
        problems.push(
          `field meaning \`${meaning}\` maps to "${name}", which is no field of ${where}`,
        );
      }
    }

    for (const meaning of keys(optionMeanings)) {
      const name = contractNames.options[meaning];

      const fieldName = contractNames.fields[optionMeanings[meaning].field];

      const field = fields.find((candidate) => candidate.name === fieldName);

      if (
        field !== undefined &&
        !field.options.some((option) => option.name === name)
      ) {
        problems.push(
          `option meaning \`${meaning}\` maps to "${name}", which is no option of the "${fieldName}" field of ${where}`,
        );
      }
    }
  }

  return problems;
}
