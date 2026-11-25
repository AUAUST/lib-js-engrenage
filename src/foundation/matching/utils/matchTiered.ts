import { abs } from "@auaust/toolkit/math";

import { prepareText } from "#foundation/matching/utils/prepareText";
import type { PreparedText } from "#foundation/matching/types/PreparedText";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";
import type { TextWord } from "#foundation/matching/types/TextWord";

const exactScore = 1;
const wordScore = 0.8;
const regexScore = 0.8;
const stemScore = 0.6;
const prefixScore = 0.4;
const prefixLength = 3;
const stemLength = 3;
const stemHeadLength = 2;
const stemLengthGap = 3;

const punctuation = /[^\p{L}\p{N} ]/u;

interface LeafWord {
  readonly value: string;
  readonly head: string;
  readonly stems: readonly string[];
}

interface LiteralLeaf {
  readonly punctuated: boolean;
  readonly words: readonly LeafWord[];
}

const literalLeaves = new WeakMap<QueryLeaf, LiteralLeaf>();

function listStems(word: string) {
  const stems = [word];

  if (word.endsWith("ies")) {
    stems.push(`${word.slice(0, -3)}y`);
  }

  if (word.endsWith("es")) {
    stems.push(word.slice(0, -2));
  }

  if (word.endsWith("s") && !word.endsWith("ss")) {
    stems.push(word.slice(0, -1));
  }

  for (const suffix of ["ing", "ed"]) {
    if (!word.endsWith(suffix)) {
      continue;
    }

    const base = word.slice(0, -suffix.length);

    stems.push(base, `${base}e`);
  }

  return stems.filter((stem) => {
    return stem.length >= stemLength;
  });
}

function readLiteralLeaf(leaf: QueryLeaf) {
  const known = literalLeaves.get(leaf);

  if (known != null) {
    return known;
  }

  const words = prepareText(leaf.value).words.map(({ value }) => {
    return {
      value,
      head: value.slice(0, stemHeadLength),
      stems: listStems(value),
    };
  });

  const literal = { punctuated: punctuation.test(leaf.value), words };

  literalLeaves.set(leaf, literal);

  return literal;
}

function isInsideWord(words: readonly TextWord[], index: number) {
  return words.some(({ start, end }) => {
    return start < index && index < end;
  });
}

function hasOccurrence(field: PreparedText, value: string) {
  let index = field.text.indexOf(value);

  while (index !== -1) {
    if (
      !isInsideWord(field.words, index) &&
      !isInsideWord(field.words, index + value.length)
    ) {
      return true;
    }

    index = field.text.indexOf(value, index + 1);
  }

  return false;
}

function isSameWord(word: string, leafWord: LeafWord) {
  return word === leafWord.value;
}

function sharesStem(word: string, leafWord: LeafWord) {
  if (
    leafWord.stems.length === 0 ||
    abs(word.length - leafWord.value.length) > stemLengthGap ||
    !word.startsWith(leafWord.head)
  ) {
    return false;
  }

  return listStems(word).some((stem) => {
    return leafWord.stems.includes(stem);
  });
}

function hasSequence(
  field: PreparedText,
  literal: LiteralLeaf,
  matches: (word: string, leafWord: LeafWord) => boolean,
) {
  const { words } = field;
  const length = literal.words.length;

  for (let position = 0; position + length <= words.length; position++) {
    let offset = 0;

    while (offset < length) {
      const word = words[position + offset];
      const leafWord = literal.words[offset];

      if (word == null || leafWord == null || !matches(word.value, leafWord)) {
        break;
      }

      offset++;
    }

    if (offset === length) {
      return true;
    }
  }

  return false;
}

function matchWord(field: PreparedText, leafWord: LeafWord) {
  if (!field.text.includes(leafWord.head)) {
    return 0;
  }

  const prefixable = leafWord.value.length >= prefixLength;

  let best = 0;

  for (const { value } of field.words) {
    if (value === leafWord.value) {
      return wordScore;
    }

    if (best < stemScore && sharesStem(value, leafWord)) {
      best = stemScore;
    } else if (
      best < prefixScore &&
      prefixable &&
      value.startsWith(leafWord.value)
    ) {
      best = prefixScore;
    }
  }

  return best;
}

/**
 * The default matcher: scores `leaf` in `field` at the best of the exact, word,
 * regex, stem and prefix tiers, `0` when none matches. Leaves holding punctuation
 * match only at the exact and word tiers, and no tier matches inside a word.
 */
export function matchTiered(leaf: QueryLeaf, field: PreparedText) {
  if (leaf.kind === "regex") {
    return leaf.pattern.test(field.source) ? regexScore : 0;
  }

  if (field.text === leaf.value) {
    return exactScore;
  }

  const literal = readLiteralLeaf(leaf);

  if (literal.punctuated) {
    return hasOccurrence(field, leaf.value) ? wordScore : 0;
  }

  const [only] = literal.words;

  if (literal.words.length === 1 && only != null) {
    return matchWord(field, only);
  }

  if (hasSequence(field, literal, isSameWord)) {
    return wordScore;
  }

  return hasSequence(field, literal, sharesStem) ? stemScore : 0;
}
