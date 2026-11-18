import {
  agentLoaderEntry,
  agentRuntimeEntry,
  agentsTarget,
  agentStatsDirectory,
  markdownBlocks,
} from "#tools/agents/constants";
import type { Extension, FileLocation } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Owns the `agents` config key, the `agents.runtimes`, `agents.fillers` and
 * `agents.rules` slots, the `debt` line marker, the instruction files and
 * the agent stats directory and the `reference` directive, through which
 * the `blocks` target fills the `@reference` blocks of instruction files,
 * and syncs agent files.
 */
export default {
  name: "tools/agents",
  owns: {
    slots: {
      "agents.runtimes": { entry: agentRuntimeEntry },
      "agents.fillers": { entry: agentLoaderEntry },
      "agents.rules": { entry: agentLoaderEntry },
    },
    keys: {
      agents: {
        input: "agents",
        load() {
          return import("#tools/agents/config/sections/agentsSection");
        },
      },
    },
    markers: {
      debt: true,
    },
    files: {
      "agents.stats": {
        title: "Agent stats",
        committed: false,
        locate(): FileLocation {
          return { directory: agentStatsDirectory };
        },
      },
      "agents.instructions": {
        async locate(config): Promise<FileLocation | undefined> {
          const { instructionFiles } = await config.resolve("agents");

          return { globs: instructionFiles };
        },
      },
    },
    directives: {
      reference: {
        async files(config): Promise<readonly File[]> {
          const agents = await config.resolve("agents");

          if ((agents.preferred?.length ?? 0) === 0) {
            return [];
          }

          const { codexFile } = await import("#tools/agents/codex/constants");

          const files = await config.context.filesystem.glob(
            agents.instructionFiles,
          );

          return files.filter((file) => file !== codexFile);
        },
        load() {
          return import("#tools/agents/operations/fillReferenceBlock");
        },
      },
    },
  },
  contributes: {
    "blocks.syntaxes": [
      {
        name: "markdown",
        // @debt the dot-directory glob works around `matchesGlob` in syncDirectiveBlocks skipping dot directories; matching syntaxes there would serve every syntax, `**/.gitignore` and `**/.prettierignore` included
        files: ["**/*.md", "**/.*/**/*.md"],
        ...markdownBlocks,
      },
    ],
    "sync.targets": [
      {
        name: agentsTarget,
        stage: "write",
        reads: ["tsconfig"],
        produces: ["agents.instructions"],
        load() {
          return import("#tools/agents/setup/syncAgents");
        },
      },
    ],
    "sync.done": [
      {
        load() {
          return import("#tools/agents/operations/reportSyncedAgentChecks");
        },
      },
    ],
  },
} satisfies Extension;
