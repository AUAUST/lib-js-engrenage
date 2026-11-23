import { describe, expect, test } from "vitest";

import { resolveEnvironmentGrants } from "#batiment/structure/index";
import type { EnvironmentInstance } from "#batiment/environments/index";
import type { NamespaceKind } from "#batiment/scopes/index";

import environments from "#project/environments/extension";

const kinds = environments.contributes.namespaceKinds;

function getKind(name: string): NamespaceKind {
  const kind = kinds.find((candidate) => candidate.name === name);

  if (kind === undefined) {
    throw new Error(`No built-in kind ${name}`);
  }

  return kind;
}

function createInstance(
  name: string,
  namespace: NamespaceKind,
  scope = ".",
): EnvironmentInstance {
  return {
    name,
    scope,
    title: name,
    kind: { name: namespace.name },
    namespace,
  };
}

const root = kinds.map((kind) => createInstance(kind.name, kind));

describe("resolveEnvironmentGrants", () => {
  test("derives the built-in kinds' grants over the root environments", () => {
    const grants = resolveEnvironmentGrants(true, root);

    expect(grants.environments.bin).toEqual(
      expect.arrayContaining(["tests", "scripts", "tooling", "data"]),
    );

    expect(grants.surface.bin).toEqual(["src"]);

    expect(grants.environments.scripts).not.toContain("data");

    expect(grants.environments.tests).toEqual(["static"]);

    expect(grants.environments.src).toEqual([
      "tests",
      "bin",
      "scripts",
      "tooling",
      "static",
    ]);
  });

  test("caps a whole grant into a surface-inward kind as surface", () => {
    const library = createInstance("lib", {
      name: "lib",
      level: "enforced",
      inward: "surface",
    });

    const app = createInstance("app", {
      name: "app",
      level: "enforced",
      imports: { lib: "whole", static: "whole" },
    });

    const grants = resolveEnvironmentGrants(false, [
      library,
      app,
      createInstance("static", getKind("static")),
    ]);

    expect(grants.surface.app).toEqual(["lib"]);

    expect(grants.environments.app).toEqual(["static"]);
  });

  test("grants nothing across scopes", () => {
    const grants = resolveEnvironmentGrants(false, [
      createInstance("src", getKind("src")),
      createInstance("bin", getKind("bin")),
      createInstance("theme/src", getKind("src"), "theme"),
    ]);

    expect(grants.environments.src).toContain("theme/src");

    expect(grants.environments.bin).toContain("theme/src");
  });
});
