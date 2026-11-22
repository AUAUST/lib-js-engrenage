import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { syncGeneratedRules } from "#tools/metalbrain/index";

const sheet = ".claude/rules/planning-sheet.md";

function entity(name: string, description: string | null) {
  return {
    id: 1,
    nodeId: "N",
    name,
    description,
  };
}

function field(name: string, options: readonly string[]) {
  return {
    ...entity(name, `${name} field.`),
    dataType: options.length > 0 ? "single_select" : "text",
    options: options.map((option) => {
      return {
        id: 2,
        name: option,
        description: `${option} option.`,
      };
    }),
  };
}

function repository(name: string, labels: readonly [string, string][]) {
  return {
    repository: name,
    id: 3,
    nodeId: "R",
    labels: labels.map(([label, description]) => entity(label, description)),
  };
}

const snapshot = {
  repositories: {
    app: repository("AUAUST/app", [["Tooling", "Scripts and bins."]]),
    toolkit: repository("AUAUST/lib-js-toolkit", [["Tests", "Test suites."]]),
  },
  organizations: {
    AUAUST: {
      types: ["Plan", "Segment", "Task", "Problem", "Resource", "Idea"].map(
        (name) => {
          return {
            ...entity(name, `${name} type.`),
            enabled: true,
            pinnedFields: ["Blockers"],
          };
        },
      ),
      fields: [
        field("Nature", ["Feature", "Improvement", "Chore"]),
        field("Defect", ["Bug", "Debt", "Performance"]),
        field("Priority", ["Urgent", "High priority", "Low priority"]),
        field("Complexity", ["Trivial", "Involved", "Complex"]),
        field("Material", ["Reference", "Specification", "Report", "Archive"]),
        field("Blockers", [
          "Open questions",
          "Outdated",
          "Awaiting others",
          "Delayed",
          "Drafting",
        ]),
        field("Estimate", []),
      ],
    },
  },
};

async function createProject({
  github = {},
  withSnapshot = true,
}: {
  github?: Record<string, unknown>;
  withSnapshot?: boolean;
} = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@auaust/app",
      type: "module",
      repository: "github:AUAUST/app",
    }),
    "engrenage.config.ts": `export default ${JSON.stringify({
      agents: {
        preferred: ["claude"],
      },
      github: {
        repositories: { toolkit: "AUAUST/lib-js-toolkit" },
        ...github,
      },
    })};`,
    ...(withSnapshot
      ? { ".engrenage/github.json": JSON.stringify(snapshot) }
      : {}),
  });

  const reporter = createTestReporter();

  return {
    project,
    reporter,
    config: await loadConfig(project.root, { reporter }),
  };
}

describe("planning sheet", () => {
  test("renders every meaning and each registered repository's labels from the snapshot", async () => {
    const { config } = await createProject();

    await syncGeneratedRules(config);

    const content = await config.context.filesystem.read(sheet);

    expect(content).toMatch(/^---\npaths:\n {2}- \.ai\/issues\/\*\*\n---\n/u);

    expect(content).toContain("| `app` | `AUAUST/app` |");

    expect(content).toContain("| `toolkit` | `AUAUST/lib-js-toolkit` |");

    expect(content).toContain("### `app`\n\n| Label | Description |");
    expect(content).toContain("| Tooling | Scripts and bins. |");
    expect(content).toContain("| Tests | Test suites. |");

    expect(content).toContain(
      "| `problem` | Problem | Problem type. | Blockers |",
    );

    expect(content).toContain("| `blockers` | Blockers | Blockers field. |");

    expect(content).toContain(
      "| `blockers` | `questions` | Open questions | Open questions option. |",
    );

    expect(content).toContain("| `notPlanned` | not planned |");
    expect(content).toContain('- Field "Estimate": Estimate field.');
    expect(content).toContain("`.engrenage/github.json`");
    expect(content).not.toMatch(/"id"|nodeId/u);
  });

  test("removes the stale rules below its own path and keeps the others", async () => {
    const { project, config } = await createProject();

    project.write(".claude/rules/planning-sheet/old/stale.md", "Stale.\n");
    project.write(".claude/rules/handwritten.md", "Kept.\n");

    await syncGeneratedRules(config);

    const { filesystem } = config.context;

    await expect(
      filesystem.read(".claude/rules/planning-sheet/old/stale.md"),
    ).resolves.toBeUndefined();

    await expect(filesystem.read(".claude/rules/handwritten.md")).resolves.toBe(
      "Kept.\n",
    );
  });

  test("fails on a mapped name missing from the snapshot, naming the meaning", async () => {
    const { config } = await createProject({
      github: {
        contract: {
          options: { drafting: "Work in progress" },
        },
      },
    });

    await expect(syncGeneratedRules(config)).rejects.toThrow(
      'option meaning `drafting` maps to "Work in progress"',
    );
  });

  test("loads the contract from `github.contract`", async () => {
    const { config } = await createProject({
      github: {
        contract: {
          types: { plan: "Roadmap" },
        },
      },
    });

    const { contract } = await config.resolve("github");

    expect(contract.types.plan).toBe("Roadmap");
  });

  test("rejects `github.protocol`, naming `contract`", async () => {
    const { config } = await createProject({
      github: {
        protocol: {},
      },
    });

    await expect(config.resolve("github")).rejects.toThrow(
      'renamed "contract"',
    );
  });

  test("warns and renders the nameless sheet without a snapshot", async () => {
    const { config, reporter } = await createProject({ withSnapshot: false });

    await syncGeneratedRules(config);

    const content = await config.context.filesystem.read(sheet);

    expect(reporter.messages).toContainEqual({
      level: "warn",
      text: expect.stringContaining("No GitHub snapshot"),
      data: { fix: "run `metalbrain github fetch`" },
    });

    expect(content).toContain(
      "identify the GitHub type, field, option or label",
    );

    expect(content).toContain(
      "| `problem` | Negative work: something wrong, to fix. |",
    );

    expect(content).not.toContain("Problem type.");
  });
});
