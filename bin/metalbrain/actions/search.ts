import { isNumber, isString } from "@auaust/toolkit";

import { quoteShellWord } from "#foundation/shell/index";
import { recordKinds } from "#metalbrain/kinds/constants";
import { findNamedRecordKind, formatRecordTree } from "#metalbrain/kinds/index";
import { searchRecords, type RecordQuery } from "#metalbrain/records/index";
import { CommandUsageError, getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

function readQuery(words: readonly string[], text: unknown): RecordQuery {
  if (isString(text) === words.length > 0) {
    throw new CommandUsageError(
      "Pass either query arguments or `--text <raw>`, not both nor neither",
    );
  }

  return isString(text)
    ? { kind: "text", text }
    : { kind: "syntax", query: words.join(" ") };
}

function formatRerun({
  kindName,
  words,
  text,
  limit,
  offset,
}: {
  kindName: string | undefined;
  words: readonly string[];
  text: unknown;
  limit: number;
  offset: number;
}) {
  return [
    "pnpm metalbrain",
    ...(kindName === undefined ? [] : [kindName]),
    "search",
    ...words.map(quoteShellWord),
    ...(isString(text) ? ["--text", quoteShellWord(text)] : []),
    "--limit",
    String(limit),
    "--offset",
    String(offset),
  ].join(" ");
}

export default async function (
  words: readonly string[],
  options: Readonly<Record<string, unknown>>,
  kindName?: string,
): Promise<void> {
  const { reporter } = getRunContext();

  const { text, limit, offset } = options;

  if (!isNumber(limit) || !isNumber(offset)) {
    throw new TypeError(
      "The search options lack their `--limit` and `--offset` defaults",
    );
  }

  const query = readQuery(words, text);

  const kinds = kindName === undefined
    ? recordKinds.filter(({ search }) => search !== undefined)
    : [findNamedRecordKind(kindName)];

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const {
    relaxed,
    entries,
  } = await searchRecords(config.context.filesystem, kinds, query);

  if (relaxed) {
    reporter.log("No entry matches every term; entries matching any of them:");
  }

  const end = offset + limit;

  const page = entries.slice(offset, end).map(({ document }) => {
    return document;
  });

  for (const line of formatRecordTree(page)) {
    reporter.log(line);
  }

  if (end < entries.length) {
    reporter.log(
      `${entries.length - end} more: ${formatRerun({
        kindName,
        words,
        text,
        limit,
        offset: end,
      })}`,
    );
  }
}
