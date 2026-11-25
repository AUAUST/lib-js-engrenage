import { isNumber } from "@auaust/toolkit";

import { findRecords } from "#metalbrain/records/operations/findRecords";
import { tapRecord } from "#metalbrain/records/operations/tapRecord";
import { checkTapNote } from "#metalbrain/records/utils/checkTapNote";
import { formatRecordTime } from "#metalbrain/records/utils/formatRecordTime";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LocatedRecord } from "#metalbrain/records/types/LocatedRecord";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages one tap at the current time, with `note` when given, on every entry
 * `givens` name, each tapped as `tapRecord` taps it, once `findRecords` has found
 * all of them in the kind `kindOf` gives for each ID.
 *
 * @returns The tapped entries, in argument order.
 * @throws {Error} When the note is not one line within `noteCap` words, or
 * `findRecords` fails on any ID or its kind takes no taps, staging nothing.
 */
export async function tapRecords(
  filesystem: Filesystem,
  givens: readonly string[],
  kindOf: (given: string) => RecordKind | Promise<RecordKind>,
  {
    note,
    noteCap,
    wordCaps,
  }: {
    note: string | undefined;
    noteCap: number;
    wordCaps: Readonly<Record<string, unknown>>;
  },
): Promise<readonly LocatedRecord[]> {
  if (note !== undefined) {
    checkTapNote(note, noteCap);
  }

  const located = await findRecords(
    filesystem,
    givens,
    async (given) => {
      const kind = await kindOf(given);

      if (kind.taps !== true) {
        throw new Error(`The ${kind.name} records take no taps: ${given}`);
      }

      if (!isNumber(wordCaps[kind.wordCap])) {
        throw new Error(
          `No word cap "${kind.wordCap}" bounds the ${kind.name} records`,
        );
      }

      return kind;
    },
    "No entry was tapped:",
  );

  const at = formatRecordTime(new Date());

  for (const { kind, found } of located) {
    const wordCap = wordCaps[kind.wordCap];

    await tapRecord(filesystem, kind, found.id, {
      at,
      ...(note !== undefined && { note }),
      wordCap: isNumber(wordCap) ? wordCap : Number.POSITIVE_INFINITY,
    });
  }

  return located;
}
