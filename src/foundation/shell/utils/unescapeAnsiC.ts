const escapes = /\\(?:([abeEfnrtv\\'"?])|([0-7]{1,3})|x([\dA-Fa-f]{1,2})|u([\dA-Fa-f]{1,4})|U([\dA-Fa-f]{1,8})|c(.))/gs;

const characters: Readonly<Record<string, string>> = {
  a: "\u0007",
  b: "\b",
  e: "\u001B",
  E: "\u001B",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
  v: "\v",
};

function readControl(char: string) {
  return char === "?" ? 0x7f : char.toUpperCase().charCodeAt(0) & 0x1f;
}

function readCodePoint(match: string, codePoint: number) {
  return codePoint > 0x10ffff ? match : String.fromCodePoint(codePoint);
}

/**
 * Decodes the body of an ANSI-C quoted `$'…'` word as Bash does, cutting it at
 * its first NUL character, which no argument can hold.
 */
export function unescapeAnsiC(text: string) {
  const decoded = text.replaceAll(
    escapes,
    (
      match,
      simple?: string,
      octal?: string,
      hex?: string,
      unicode?: string,
      wide?: string,
      control?: string,
    ) => {
      if (simple !== undefined) {
        return characters[simple] ?? simple;
      }

      if (control !== undefined) {
        return String.fromCodePoint(readControl(control));
      }

      const [
        digits,
        radix,
      ] = octal === undefined ? [hex ?? unicode ?? wide ?? "", 16] : [octal, 8];

      return readCodePoint(match, Number.parseInt(digits, radix));
    },
  );

  const end = decoded.indexOf("\0");

  return end === -1 ? decoded : decoded.slice(0, end);
}
