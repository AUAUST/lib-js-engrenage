import { posix } from "node:path";

export function listFormerReferences({
  reference,
  formerly = [],
}: {
  reference: string;
  formerly?: readonly string[] | undefined;
}): readonly string[] {
  return formerly.map((former) => {
    return posix.join(posix.dirname(reference), `${former}.md`);
  });
}
