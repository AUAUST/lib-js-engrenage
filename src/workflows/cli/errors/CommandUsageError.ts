export class CommandUsageError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "CommandUsageError";
  }
}
