import { filterMap, toSortedBy } from "@auaust/toolkit/array";

import {
  stopwords,
  textQueryFrequencyLimit,
  textQueryLeafLimit,
} from "#foundation/matching/constants";
import { createLiteralLeaf } from "#foundation/matching/utils/createLiteralLeaf";
import { matchTiered } from "#foundation/matching/utils/matchTiered";
import { prepareText } from "#foundation/matching/utils/prepareText";
import { weighLeaf } from "#foundation/matching/utils/weighLeaf";
import type { Matcher } from "#foundation/matching/types/Matcher";
import type { PreparedDocuments } from "#foundation/matching/types/PreparedDocuments";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";
import type { QueryNode } from "#foundation/matching/types/QueryNode";

const backtickSpan = /`([^`]*)`/gu;
const whitespace = /\s+/u;
const identifierMark = /[/._\-#]/u;
const sentencePunctuation = /^[("'[{]+|[)"'\]},.;:!?]+$/gu;
const minimumWordLength = 3;

function listLeaves(text: string) {
  const leaves: QueryLeaf[] = [];

  const spans = Array.from(text.matchAll(backtickSpan), (match) => {
    return match[1] ?? "";
  });

  const tokens = text
    .replaceAll(backtickSpan, " ")
    .split(whitespace)
    .map((token) => {
      return token.replaceAll(sentencePunctuation, "");
    });

  for (const span of spans) {
    const leaf = createLiteralLeaf("phrase", span);

    if (leaf != null) {
      leaves.push(leaf);
    }
  }

  for (const token of tokens) {
    if (identifierMark.test(token)) {
      const leaf = createLiteralLeaf("phrase", token);

      if (leaf != null) {
        leaves.push(leaf);
      }

      continue;
    }

    for (const { value } of prepareText(token).words) {
      const leaf = value.length < minimumWordLength || stopwords.has(value)
        ? undefined
        : createLiteralLeaf("term", value);

      if (leaf != null) {
        leaves.push(leaf);
      }
    }
  }

  const seen = new Set<string>();

  return leaves.filter(({ kind, value }) => {
    const key = `${kind}:${value}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

/**
 * The text query for raw `text`, never parsed as query syntax: its backtick spans
 * and the tokens holding `/`, `.`, `_`, `-` or `#` as phrases, its other words
 * without stopwords and words under three characters as terms; of those, the
 * ones in at most half the documents of `prepared`, the heaviest twelve kept,
 * joined under `any` needing two of them, or one when one remains.
 */
export function createTextQuery<Document>(
  text: string,
  prepared: PreparedDocuments<Document>,
  matcher: Matcher = matchTiered,
): QueryNode {
  const limit = prepared.documents.length * textQueryFrequencyLimit;

  // @debt the leaves weighed here are weighed again when the caller ranks the query over the same documents; a weight cache per prepared documents and matcher would match each leaf once
  const weighed = filterMap(listLeaves(text), (leaf) => {
    const { weight, frequency } = weighLeaf(prepared, leaf, matcher);

    return frequency > limit ? undefined : { leaf, weight };
  });

  const children = toSortedBy(
    weighed,
    "weight",
    (left, right) => {
      return left - right;
    },
    { reverse: true },
  )
    .slice(0, textQueryLeafLimit)
    .map(({ leaf }) => {
      return leaf;
    });

  return {
    kind: "any",
    children,
    min: children.length === 1 ? 1 : 2,
  };
}
