import { engrenage } from "#constants";
import { metalbrain } from "#metalbrain/instructions/constants";

const kinds = new Set(["templates", "rules", "sections", "skills"]);

/**
 * The current reference of an engrenage instruction fragment named by its
 * former `agents/<kind>/` or `extensions/<name>/agents/<kind>/` location; any
 * other reference unchanged.
 */
export function relocateInstructionReference(reference: string): string {
  const prefix = `${engrenage}/`;

  if (!reference.startsWith(prefix)) {
    return reference;
  }

  const segments = reference.slice(prefix.length).split("/");

  const agents = segments.findLastIndex((segment, index) => {
    return segment === "agents" && kinds.has(segments[index + 1] ?? "");
  });

  const isFormer = agents === 0 || (agents > 1 && segments[0] === "extensions");

  return isFormer
    ? `${prefix}${[metalbrain, ...segments.slice(agents + 1)].join("/")}`
    : reference;
}
