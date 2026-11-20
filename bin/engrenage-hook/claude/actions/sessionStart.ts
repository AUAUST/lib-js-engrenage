import { writeClaudeShellOptions } from "#tools/agents/index";

export default function (): Promise<void> {
  return writeClaudeShellOptions();
}
