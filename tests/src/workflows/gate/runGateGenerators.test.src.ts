import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createGateRepository } from "#tests/utils/createGateRepository";
import { runGate } from "#workflows/gate/operations/runGate";

const appendingGenerator = {
  command: "echo generated >> .runs-generated",
  inputs: "schema/**",
  outputs: ".runs-generated",
};

async function createGeneratorRepository(
  generator: typeof appendingGenerator = appendingGenerator,
) {
  const repository = await createGateRepository();

  const { project, commit } = repository;

  project.write(
    "engrenage.config.ts",
    `export default {
  environments: { src: { execution: { syntax: "2026-10" } } },
  src: { structure: { purpose: "The code." } },
  tooling: { structure: { purpose: "The config." } },
  agents: { gate: { commands: [] } },
  generators: { schema: ${JSON.stringify(generator)} },
};
`,
  );

  project.write("schema/a.graphql", "type Query { a: Int }\n");
  project.write(".runs-generated", "");

  commit("generators");

  loadConfig.refresh(project.root);

  return repository;
}

describe("runGate generators", { timeout: binaryTimeout }, () => {
  test("runs no generator when the staged files match no input and every output exists", async () => {
    const { project, git } = await createGeneratorRepository();

    project.write("src/index.ts", "export const value: number = 2;\n");

    git("add", "src/index.ts");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "staged",
    });

    expect(failures).toEqual([]);

    expect(project.read(".runs-generated")).toBe("");
  });

  test("runs the generator whose input a staged deletion matches", async () => {
    const { project, git } = await createGeneratorRepository();

    git("rm", "--quiet", "schema/a.graphql");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "staged",
    });

    expect(failures).toEqual([]);

    expect(project.read(".runs-generated")).toBe("generated\n");
  });

  test("runs every generator under --all", async () => {
    const { project } = await createGeneratorRepository();

    await runGate(await loadConfig(project.root), { mode: "all" });

    expect(project.read(".runs-generated")).toBe("generated\n");
  });

  test("fails --all under the name of a generator changing a tracked output", async () => {
    const { project, commit } = await createGeneratorRepository({
      command: "cp schema/a.graphql src/schema.txt",
      inputs: "schema/**",
      outputs: "src/schema.txt",
    });

    project.write("src/schema.txt", "type Query { b: Int }\n");

    commit("stale output");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "all",
    });

    expect(failures).toContainEqual({
      step: "schema",
      output: "Outputs out of date with their inputs, regenerated; commit them:\nsrc/schema.txt",
    });
  });

  test("restages the tracked output a staged run regenerates", async () => {
    const { project, git, commit } = await createGeneratorRepository({
      command: "cp schema/a.graphql src/schema.txt",
      inputs: "schema/**",
      outputs: "src/schema.txt",
    });

    project.write("src/schema.txt", "type Query { a: Int }\n");

    commit("output");

    project.write("schema/a.graphql", "type Query { b: Int }\n");

    git("add", "schema/a.graphql");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "staged",
    });

    expect(failures).toEqual([]);

    expect(git("show", ":src/schema.txt")).toBe("type Query { b: Int }\n");

    expect(git("diff", "--name-only")).toBe("");
  });

  test("fails the gate under the name of a failing generator", async () => {
    const { project, git } = await createGeneratorRepository({
      command: "echo broken; exit 1",
      inputs: "schema/**",
      outputs: ".runs-generated",
    });

    git("rm", "--quiet", "schema/a.graphql");

    const { failures } = await runGate(await loadConfig(project.root), {
      mode: "staged",
    });

    expect(failures).toEqual([{ step: "schema", output: "broken\n" }]);
  });

  test("ends the run at a failing generator without running the other steps", async () => {
    const { project } = await createGeneratorRepository({
      command: "echo broken; exit 1",
      inputs: "schema/**",
      outputs: ".runs-generated",
    });

    project.write("src/index.ts", 'export const value: number = "text";\n');
    project.write("schema/a.graphql", "type Query { b: Int }\n");

    const config = await loadConfig(project.root);

    const worktree = await runGate(config, { mode: "worktree" });

    const all = await runGate(config, { mode: "all" });

    expect(worktree.failures).toEqual([{ step: "schema", output: "broken\n" }]);

    expect(all.failures).toEqual([{ step: "schema", output: "broken\n" }]);
  });
});
