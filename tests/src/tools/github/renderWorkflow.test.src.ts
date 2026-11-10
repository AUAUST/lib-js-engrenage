import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { values } from "@auaust/toolkit/object";

import { renderWorkflow } from "#tools/github/operations/renderWorkflow";

interface WorkflowStep {
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
}

interface WorkflowJob {
  name: string;
  needs?: readonly string[];
  strategy?: { matrix: { shard: readonly number[] } };
  steps: readonly WorkflowStep[];
}

interface Workflow {
  defaults?: { run: { "working-directory": string } };
  jobs: Record<string, WorkflowJob>;
}

async function render(
  file: string,
  options: { directory?: string; testShards?: number } = {},
): Promise<Workflow> {
  const content = await renderWorkflow("library", file, {
    directory: options.directory ?? ".",
    testShards: options.testShards ?? 1,
  });

  return parse(content) as Workflow;
}

function listTokenSteps(workflow: Workflow): readonly string[] {
  return values(workflow.jobs).flatMap(({ steps }) => {
    return steps
      .filter((step) => step.env?.NODE_AUTH_TOKEN !== undefined)
      .map((step) => {
        return step.name ?? "";
      });
  });
}

describe("renderWorkflow", () => {
  test.each([
    ["ci.yml", ["Install dependencies"]],
    [
      "publish.yml",
      ["Install dependencies", "Create Release Pull Request or Publish to npm"],
    ],
  ])(
    "gives the read-only token only to the steps of %s reading the registry",
    async (file, steps) => {
      const workflow = await render(file);

      expect(new Set(listTokenSteps(workflow))).toEqual(new Set(steps));
    },
  );

  test("releases only after every check job, with the build job's output", async () => {
    const { jobs } = await render("publish.yml", { directory: "packages/app" });

    expect(jobs.release?.needs).toEqual(["check", "test", "build"]);

    const artifacts = values(jobs).flatMap(({ steps }) => {
      return steps
        .filter((step) => step.uses?.includes("-artifact@") === true)
        .map((step) => {
          return step.with?.name;
        });
    });

    expect(artifacts).toEqual(["build-output", "build-output"]);
  });

  test("splits the tests into the configured shards", async () => {
    const { jobs } = await render("ci.yml", { testShards: 3 });

    expect(jobs.test?.strategy?.matrix.shard).toEqual([1, 2, 3]);

    expect(jobs.test?.steps.at(-1)?.run).toBe(
      "pnpm run ci:test --shard=${{ matrix.shard }}/${{ strategy.job-total }}",
    );
  });

  test("runs the tests in one job without --shard by default", async () => {
    const { jobs } = await render("ci.yml");

    expect(jobs.test?.strategy).toBeUndefined();
    expect(jobs.test?.steps.at(-1)?.run).toBe("pnpm run ci:test");
  });

  test("relocates a nested project's commands and files", async () => {
    const workflow = await render("publish.yml", { directory: "packages/app" });

    expect(workflow.defaults?.run["working-directory"]).toBe("packages/app");

    const setup = workflow.jobs.release?.steps.find((step) => {
      return step.name === "Set up Node.js";
    });

    expect(setup?.with).toMatchObject({
      "node-version-file": "packages/app/package.json",
      "cache-dependency-path": "packages/app/pnpm-lock.yaml",
    });
  });
});
