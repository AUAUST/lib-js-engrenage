const conditionFlags = new Set(["--conditions", "-C"]);

/**
 * Whether `NODE_OPTIONS` passes the export `condition` to every Node process
 * the current one starts.
 */
export function hasNodeCondition(
  condition: string,
  nodeOptions: string | undefined = process.env.NODE_OPTIONS,
): boolean {
  const tokens = nodeOptions?.split(/\s+/u) ?? [];

  return tokens.some((token, index) => {
    const separator = token.indexOf("=");

    return separator === -1
      ? conditionFlags.has(token) && tokens[index + 1] === condition
      : (
          conditionFlags.has(token.slice(0, separator)) &&
          token.slice(separator + 1) === condition
        );
  });
}
