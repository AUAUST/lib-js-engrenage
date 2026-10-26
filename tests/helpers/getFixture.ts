import { fileURLToPath } from "node:url";

export function getFixture(path: string): string {
  return fileURLToPath(new URL(`../fixtures/${path}`, import.meta.url));
}
