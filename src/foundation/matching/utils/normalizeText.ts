const combiningMarks = /\p{M}/gu;

const quotes = /["'`]/gu;

const whitespace = /\s{2,}|[^\S ]/gu;

const nonAscii = /\P{ASCII}/u;

/**
 * `text` lowercased, compatibility-decomposed without combining marks or quote
 * characters, its whitespace collapsed to single spaces and trimmed.
 */
export function normalizeText(text: string) {
  const lowercase = text.toLowerCase();

  const decomposed = nonAscii.test(lowercase)
    ? lowercase.normalize("NFKD").replaceAll(combiningMarks, "")
    : lowercase;

  return decomposed.replaceAll(quotes, "").replaceAll(whitespace, " ").trim();
}
