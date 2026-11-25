import { filterMap, toSortedBy } from "@auaust/toolkit/array";
import { min } from "@auaust/toolkit/math";

import { matchTiered } from "#foundation/matching/utils/matchTiered";
import { weighLeaf } from "#foundation/matching/utils/weighLeaf";
import type { Matcher } from "#foundation/matching/types/Matcher";
import type { PreparedDocuments } from "#foundation/matching/types/PreparedDocuments";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";
import type { QueryNode } from "#foundation/matching/types/QueryNode";
import type { RankedDocument } from "#foundation/matching/types/RankedDocument";

type LeafWeight = ReturnType<typeof weighLeaf>;

function collectLeaves(node: QueryNode, leaves: Set<QueryLeaf>) {
  if (node.kind === "all" || node.kind === "any") {
    for (const child of node.children) {
      collectLeaves(child, leaves);
    }
  } else if (node.kind === "not") {
    collectLeaves(node.child, leaves);
  } else {
    leaves.add(node);
  }

  return leaves;
}

function scoreNode(
  node: QueryNode,
  weights: ReadonlyMap<QueryLeaf, LeafWeight>,
  document: number,
): number | undefined {
  if (node.kind === "not") {
    return scoreNode(node.child, weights, document) == null ? 0 : undefined;
  }

  if (node.kind === "all" || node.kind === "any") {
    let total = 0;
    let matching = 0;

    for (const child of node.children) {
      const score = scoreNode(child, weights, document);

      if (score == null) {
        continue;
      }

      total += score;
      matching++;
    }

    const needed = node.kind === "all" ? node.children.length : node.min;

    return matching >= needed ? total : undefined;
  }

  const leaf = weights.get(node);
  const score = leaf?.scores[document];

  return leaf == null || score == null ? undefined : leaf.weight * score;
}

function scoreCeiling(
  node: QueryNode,
  weights: ReadonlyMap<QueryLeaf, LeafWeight>,
): number {
  if (node.kind === "not") {
    return 0;
  }

  if (node.kind === "all" || node.kind === "any") {
    let total = 0;

    for (const child of node.children) {
      total += scoreCeiling(child, weights);
    }

    return total;
  }

  const leaf = weights.get(node);

  return leaf == null ? 0 : leaf.weight * leaf.heaviest;
}

/**
 * The documents of `prepared` matching `query`, each with its score and its
 * similarity, the score over the one a document matching every leaf at exact tier
 * in its heaviest field would get, capped at `1`; ordered by score descending,
 * then in the order of `prepared`.
 *
 * @throws {Error} when a leaf names a field `prepared` does not declare.
 */
export function rankDocuments<Document>(
  prepared: PreparedDocuments<Document>,
  query: QueryNode,
  matcher: Matcher = matchTiered,
): RankedDocument<Document>[] {
  const weights = new Map<QueryLeaf, LeafWeight>();

  for (const leaf of collectLeaves(query, new Set())) {
    weights.set(leaf, weighLeaf(prepared, leaf, matcher));
  }

  const ceiling = scoreCeiling(query, weights);

  const ranked = filterMap(prepared.documents, (document, index) => {
    const score = scoreNode(query, weights, index);

    if (score == null) {
      return;
    }

    const similarity = ceiling > 0 ? min(1, score / ceiling) : 0;

    return {
      document,
      score,
      similarity,
    };
  });

  return toSortedBy(
    ranked,
    "score",
    (left, right) => {
      return left - right;
    },
    { reverse: true },
  );
}
