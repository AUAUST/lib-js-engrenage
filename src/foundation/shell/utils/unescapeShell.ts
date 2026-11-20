const escapes = {
  unquoted: /\\(.|\n)/g,
  quoted: /\\([$`"\\\n])/g,
  heredoc: /\\([$`\\\n])/g,
};

export function unescapeShell(text: string, context: keyof typeof escapes) {
  return text.replaceAll(escapes[context], (_, char: string) => {
    return char === "\n" ? "" : char;
  });
}
