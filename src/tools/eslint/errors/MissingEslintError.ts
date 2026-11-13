import { eslint } from "#constants";

export class MissingEslintError extends Error {
  constructor() {
    super(
      `Running ESLint requires the ${eslint} dependency. Install it, then retry.`,
    );

    this.name = "MissingEslintError";
  }
}
