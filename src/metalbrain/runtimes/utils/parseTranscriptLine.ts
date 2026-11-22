/**
 * Parses one transcript line, `null` for one that is not JSON, as a line
 * cut mid-write.
 */
export function parseTranscriptLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}
