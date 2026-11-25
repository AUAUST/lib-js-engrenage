import { log, max } from "@auaust/toolkit/math";

import type { Matcher } from "#foundation/matching/types/Matcher";
import type { PreparedDocuments } from "#foundation/matching/types/PreparedDocuments";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";

const otherFieldShare = 0.1;

function listTargets<Document>(
  prepared: PreparedDocuments<Document>,
  leaf: QueryLeaf,
) {
  const targets = prepared.fields.map(({ name, weight }, index) => {
    return {
      name,
      weight,
      index,
    };
  });

  if (leaf.field == null) {
    return targets;
  }

  const restricted = targets.filter(({ name }) => {
    return name === leaf.field;
  });

  if (restricted.length === 0) {
    throw new Error(
      `The query restricts a leaf to the field "${leaf.field}", which the ranked documents do not declare.`,
    );
  }

  return restricted;
}

/**
 * The BM25 inverse document frequency of `leaf` over `prepared` as its weight,
 * its document frequency, the heaviest weight of the fields it may match, and
 * per document its field-weighted score before its weight: the best field's
 * tier score times that field's weight, plus a tenth of that per other matching
 * field, `undefined` when it matches no field.
 *
 * @throws {Error} when `leaf` names a field `prepared` does not declare.
 */
export function weighLeaf<Document>(
  prepared: PreparedDocuments<Document>,
  leaf: QueryLeaf,
  matcher: Matcher,
) {
  const targets = listTargets(prepared, leaf);

  const scores = prepared.texts.map((texts) => {
    let best = 0;
    let matching = 0;

    for (const { weight, index } of targets) {
      const text = texts[index];
      const tier = text == null ? 0 : matcher(leaf, text);

      if (tier <= 0) {
        continue;
      }

      matching++;

      best = max(best, tier * weight);
    }

    return matching === 0
      ? undefined
      : best * (1 + otherFieldShare * (matching - 1));
  });

  const frequency = scores.filter((score) => {
    return score != null;
  }).length;

  const count = prepared.documents.length;
  const weight = log(1 + (count - frequency + 0.5) / (frequency + 0.5));

  const heaviest = max(
    0,
    ...targets.map(({ weight: fieldWeight }) => {
      return fieldWeight;
    }),
  );

  return {
    weight,
    frequency,
    heaviest,
    scores,
  };
}
