import { replaceOutsideCode } from "#foundation/markdown/utils/replaceOutsideCode";

export function stripComments(text: string): string {
  return replaceOutsideCode(text, /<!--[\s\S]*?-->/g, () => "");
}
