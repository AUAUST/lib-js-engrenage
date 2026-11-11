import { optional, strictObject, string } from "valibot";

import {
  declare,
  declareSection,
  defineExtension,
  type FileLocation,
  type LoadedConfig,
  type StructureNode,
  type SyncFlags,
  type SyncRun,
} from "@auaust/engrenage/extensions";

interface FixtureInput {
  readonly label?: string;
}

declare global {
  namespace Engrenage {
    interface ConfigInput {
      fixture?: FixtureInput;
    }

    interface Sections {
      fixture: { readonly label: string };
    }

    interface Slots {
      "fixture.entries": { readonly name: string };
    }
  }
}

const fixtureSchema = declare(
  optional(strictObject({ label: optional(string()) })),
);

const fixtureSection = declareSection({
  declaration: fixtureSchema,
  resolve(input) {
    return { label: input?.label ?? "fixture" };
  },
});

async function writeLabel(config: LoadedConfig, flags: SyncFlags) {
  const { label } = await config.resolve("fixture");

  if (flags.write === true) {
    await config.context.filesystem.write("fixture-output/label.txt", label);
  }
}

function listPublicDomains(node: StructureNode): readonly StructureNode[] {
  const nested = node.children.flatMap(listPublicDomains);

  return node.kind === "domain" && node.public === true
    ? [node, ...nested]
    : nested;
}

async function writeDomains(config: LoadedConfig) {
  const structure = await config.resolve("structure");

  const source = structure.src;

  if (source === undefined) {
    return;
  }

  const collected = Object.entries(source.roles)
    .filter(([, role]) => role.contract.collected)
    .map(([name]) => name);

  const domains = listPublicDomains(source.root).map((domain) => {
    return {
      path: domain.path,
      roles: collected.filter((role) => domain.roleFiles?.[role] !== undefined),
    };
  });

  await config.context.filesystem.write(
    "fixture-output/domains.json",
    `${JSON.stringify(domains)}\n`,
  );
}

const input = {
  fixture: { label: "typed" },
} satisfies Engrenage.ConfigInput;

export default defineExtension({
  name: "fixture",
  root: new URL("./", import.meta.url),
  compatibility: {
    engrenage: ">=0",
  },
  owns: {
    keys: {
      fixture: {
        input: "fixture",
        load: () => fixtureSection,
      },
    },
    slots: {
      "fixture.entries": {},
    },
    files: {
      "fixture.output": {
        committed: false,
        locate: (): FileLocation => ({ directory: "fixture-output" }),
      },
    },
  },
  contributes: {
    "fixture.entries": [
      {
        name: input.fixture.label,
      },
    ],
    "sync.targets": [
      {
        name: "fixture",
        stage: "write",
        flags: { write: "write fixture-output/label.txt" },
        produces: ["fixture.output"],
        load: async (): Promise<SyncRun> => writeLabel,
      },
      {
        name: "fixture-structure",
        stage: "write",
        produces: ["fixture.output"],
        load: async (): Promise<SyncRun> => writeDomains,
      },
    ],
  },
});
