import type { Config } from "@auaust/engrenage/config";

export default {
  agents: {
    preferred: ["claude"],
    instructionFiles: ["INSTRUCTIONS.md"],
    snippetsDir: ".agents/snippets",
  },
} satisfies Config;
