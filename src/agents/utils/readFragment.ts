import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function readFragment(id: string): string {
  const url = import.meta.resolve(`@auaust/engrenage/agents/${id}.md`);

  return readFileSync(fileURLToPath(url), "utf8");
}
