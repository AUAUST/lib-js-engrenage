import {
  claudeAgentsDir,
  claudeSkillsDir,
} from "#tools/agents/claude/constants";
import type { Extension } from "#project/config/index";

// @debt registers the Claude runtime apart from the rest of the Claude glue in `tools/metalbrain/claude`, since an extension loads only its own domain's modules: joining them drops the `toolsAgentsClaude` built-in
/**
 * Registers the `claude` agent runtime with its headless dispatcher.
 */
export default {
  name: "tools/agents/claude",
  contributes: {
    "agents.runtimes": [
      {
        name: "claude",
        title: "Claude",
        skills: claudeSkillsDir,
        agents: claudeAgentsDir,
        dispatcher: {
          async load() {
            const {
              dispatchClaudeAgent,
            } = await import("#tools/agents/claude/adapters/dispatchClaudeAgent");

            return dispatchClaudeAgent;
          },
        },
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface AgentRuntimes {
      claude: true;
    }
  }
}
