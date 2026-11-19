import type { StructureNode } from "#project/structure/types/StructureNode";

export function listNodeViolations(node: StructureNode): string[] {
  return [
    ...(node.cardinality ?? []).map(({ role, reason, files, globs }) => {
      return reason === "unique"
        ? `\`${role}\` holds at most one file here; found ${files.join(", ")}.`
        : `\`${role}\` requires a file here; add one matching ${globs.join(", ")}.`;
    }),
    ...(node.twin === undefined
      ? []
      : [
          `${node.twin} sits beside the command group ${node.path}; move it into the group or rename one of them.`,
        ]),
  ];
}
