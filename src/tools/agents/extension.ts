import {
  agentLoaderEntry,
  agentLogFiles,
  agentRuntimeEntry,
  agentsTarget,
  agentStatsDirectory,
  markdownBlocks,
  rulesDirectory,
} from "#tools/agents/constants";
import type { Extension, FileLocation } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Owns the `agents` config key, the `agents.runtimes`, `agents.fillers` and
 * `agents.rules` slots, the `debt` line marker, the instruction files, the agent
 * logs, the generated rules, the agent stats directory and the `reference`
 * directive, through which the `blocks` target fills the `@reference` blocks of
 * instruction files, and syncs agent files. Contributes the agent limits filler.
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
      "agents.logs": {
        title: "Agent logs",
        appendOnly: true,
        async locate(config): Promise<FileLocation | undefined> {
          const { preferred } = await config.resolve("agents");

          return (preferred?.length ?? 0) === 0
            ? undefined
            : { globs: agentLogFiles };
        },
      },
      "agents.generatedRules": {
        title: "Agent rules",
        generated: true,
        async locate(config): Promise<FileLocation | undefined> {
          const { preferred } = await config.resolve("agents");

          if ((preferred?.length ?? 0) === 0) {
            return;
          }

          const rules = await config.context.registry.contributions(
            "agents.rules",
            config,
          );

          if (rules.length === 0) {
            return;
          }

          return {
            globs: rules.flatMap(({ entry }) => {
              return [
                `${rulesDirectory}/${entry.name}.md`,
                `${rulesDirectory}/${entry.name}/**/*.md`,
              ];
            }),
          };
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
    "agents.fillers": [
      {
        name: "agent-limits",
        load() {
          return import("#tools/agents/operations/fillAgentLimits");
        },
      },
    ],
    "blocks.syntaxes": [
      {
        name: "markdown",
        files: ["**/*.md"],
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
      {
        name: "backlog-sites",
        stage: "check",
        load() {
          return import("#tools/agents/setup/checkBacklogSites");
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
