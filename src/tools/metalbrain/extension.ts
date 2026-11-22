import {
  agentLoaderEntry,
  agentLogFiles,
  agentRuntimeEntry,
  agentsTarget,
  markdownBlocks,
  rulesDirectory,
  statsDirectory,
} from "#tools/metalbrain/constants";
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
  name: "tools/metalbrain",
  owns: {
    slots: {
      "agents.runtimes": { entry: agentRuntimeEntry },
      "agents.fillers": { entry: agentLoaderEntry },
      "agents.rules": { entry: agentLoaderEntry },
    },
    keys: {
      agents: {
        input: "agents",
        async load() {
          const {
            agentsSection,
          } = await import("#tools/metalbrain/config/sections/agentsSection");

          return agentsSection;
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
          return { directory: statsDirectory };
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
          const {
            listAgentReferenceFiles,
          } = await import("#tools/metalbrain/operations/listAgentReferenceFiles");

          return listAgentReferenceFiles(config);
        },
        async load() {
          const {
            fillReferenceBlock,
          } = await import("#tools/metalbrain/operations/fillReferenceBlock");

          return fillReferenceBlock;
        },
      },
    },
  },
  contributes: {
    "agents.fillers": [
      {
        name: "agent-limits",
        async load() {
          const {
            fillAgentLimits,
          } = await import("#tools/metalbrain/operations/fillAgentLimits");

          return fillAgentLimits;
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
        async load() {
          const {
            syncAgents,
          } = await import("#tools/metalbrain/setup/syncAgents");

          return syncAgents;
        },
      },
      {
        name: "backlog",
        stage: "check",
        async load() {
          const {
            checkBacklog,
          } = await import("#tools/metalbrain/setup/checkBacklog");

          return checkBacklog;
        },
      },
      {
        name: "table-cells",
        stage: "check",
        reads: ["agents.instructions"],
        async load() {
          const {
            checkTableCells,
          } = await import("#tools/metalbrain/setup/checkTableCells");

          return checkTableCells;
        },
      },
      {
        name: "fragment-files",
        stage: "check",
        reads: ["agents.instructions"],
        async load() {
          const {
            checkFragmentFiles,
          } = await import("#tools/metalbrain/setup/checkFragmentFiles");

          return checkFragmentFiles;
        },
      },
    ],
    "sync.done": [
      {
        async load() {
          const {
            reportSyncedAgentChecks,
          } = await import("#tools/metalbrain/operations/reportSyncedAgentChecks");

          return reportSyncedAgentChecks;
        },
      },
      {
        async load() {
          const {
            reportMissingExtensionRules,
          } = await import("#tools/metalbrain/operations/reportMissingExtensionRules");

          return reportMissingExtensionRules;
        },
      },
    ],
  },
} satisfies Extension;
