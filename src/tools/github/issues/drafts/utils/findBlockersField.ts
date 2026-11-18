import type { ContractNames } from "#tools/github/issues/contract/index";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

export function findBlockersField(
  target: ManifestTarget,
  contractNames: ContractNames,
): ManifestTarget["types"][number]["fields"][number] {
  const field = target.types
    .flatMap(({ fields }) => fields)
    .find(({ name }) => name === contractNames.fields.blockers);

  if (field === undefined) {
    throw new Error(
      `No issue type of ${target.repository} pins the field ${contractNames.fields.blockers}: map \`github.contract.fields.blockers\` or run \`engrenage github fetch\``,
    );
  }

  return field;
}
