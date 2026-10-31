import { engrenage } from "#constants";
import { listTsconfigPresets } from "#typescript/utils/listTsconfigPresets";

export function findLatestBaseline(): string {
  const latest = listTsconfigPresets("baseline").at(-1);

  if (latest === undefined) {
    throw new Error(`${engrenage} ships no tsconfig baseline snapshot`);
  }

  return latest;
}
