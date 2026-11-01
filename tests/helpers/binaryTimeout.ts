// A cold TypeScript compiler run takes seconds on CI runners, beyond Vitest's default 5s timeout.
export const binaryTimeout = 30_000;
