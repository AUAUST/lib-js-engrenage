export class ShellSyntaxError extends SyntaxError {
  readonly line: number;

  readonly column: number;

  constructor(message: string, line: number, column: number) {
    super(`${message} (line ${line}, column ${column})`);

    this.name = "ShellSyntaxError";
    this.line = line;
    this.column = column;
  }
}
