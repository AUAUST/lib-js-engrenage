import { find, map } from "@auaust/primitive-kit/arrays";

export function compareVersions(a: string, b: string): number {
  const second = map(b.split("."), Number);

  const difference = map(a.split("."), (part, index) => {
    return Number(part) - (second[index] ?? 0);
  });

  return find(difference, (part) => part !== 0) ?? 0;
}
