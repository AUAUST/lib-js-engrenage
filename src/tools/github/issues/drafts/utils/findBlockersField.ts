import type { IssueProtocol } from "#tools/github/issues/contract/index";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

export function findBlockersField(
  target: ManifestTarget,
  protocol: IssueProtocol,
): ManifestTarget["types"][number]["fields"][number] {
  const field = target.types
    .flatMap(({ fields }) => fields)
    .find(({ name }) => name === protocol.fields.blockers);

  if (field === undefined) {
    throw new Error(
      `No issue type of ${target.repository} pins the field ${protocol.fields.blockers}: map \`github.protocol.fields.blockers\` or run \`engrenage github fetch\``,
    );
  }

  return field;
}
