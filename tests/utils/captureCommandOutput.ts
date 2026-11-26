import type { CommandUnknownOpts } from "@commander-js/extra-typings";

export function captureCommandOutput(
  command: CommandUnknownOpts,
  output: string[],
): void {
  command.exitOverride().configureOutput({
    writeOut(text) {
      output.push(text);
    },
    writeErr(text) {
      output.push(text);
    },
  });

  for (const subcommand of command.commands) {
    captureCommandOutput(subcommand, output);
  }
}
