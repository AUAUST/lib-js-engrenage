import { findRecord } from "#metalbrain/records/operations/findRecord";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LocatedRecord } from "#metalbrain/records/types/LocatedRecord";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * The entries `givens` name, in argument order, each found by `findRecord` in
 * the kind `kindOf` gives for its ID; an entry two IDs name, such as its former
 * and current ones, appears once.
 *
 * @throws {Error} When any ID fails, opening with `heading` and listing every
 * failing ID's reason.
 */
export async function findRecords(
  filesystem: Filesystem,
  givens: readonly string[],
  kindOf: (given: string) => RecordKind | Promise<RecordKind>,
  heading: string,
): Promise<readonly LocatedRecord[]> {
  const settled = await Promise.allSettled(
    givens.map(async (given): Promise<LocatedRecord> => {
      const kind = await kindOf(given);

      return {
        given,
        kind,
        found: await findRecord(filesystem, kind, given),
      };
    }),
  );

  const failures = [
    ...new Set(
      settled
        .filter((result) => result.status === "rejected")
        .map(({ reason }: PromiseRejectedResult) => {
          return reason instanceof Error ? reason.message : String(reason);
        }),
    ),
  ];

  if (failures.length > 0) {
    throw new Error(
      [heading, ...failures.map((failure) => `- ${failure}`)].join("\n"),
    );
  }

  const ids = new Set<string>();

  return settled.flatMap((result) => {
    if (result.status === "rejected" || ids.has(result.value.found.id)) {
      return [];
    }

    ids.add(result.value.found.id);

    return [result.value];
  });
}
