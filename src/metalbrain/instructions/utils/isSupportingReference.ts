import { posix } from "node:path";

export function isSupportingReference(
  reference: string,
  skillReference: string,
): boolean {
  const { dir, name } = posix.parse(skillReference);

  return posix.dirname(reference) === `${dir}/${name}`;
}
