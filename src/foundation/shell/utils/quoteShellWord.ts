const plainWord = /^[\w./:@%+,-]+$/u;

/**
 * `word` as a POSIX shell word reading back as `word`: as written when it holds
 * only characters no shell treats specially, otherwise in single quotes, each
 * single quote inside written `'\''`.
 */
export function quoteShellWord(word: string): string {
  return plainWord.test(word) ? word : `'${word.replaceAll("'", "'\\''")}'`;
}
