import { describe, expect, test } from "vitest";

import { resolveNamespaceGrants } from "#batiment/structure/index";
import type { NamespaceInstance, NamespaceKind } from "#batiment/scopes/index";

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
  id: string,
  kind: NamespaceKind,
  scope = ".",
): NamespaceInstance {
  return {
    id,
    scope,
    name: id,
    title: id,
    kind,
    dirs: [id],
  };
}

const root = kinds.map((kind) => createInstance(kind.name, kind));

describe("resolveNamespaceGrants", () => {
  test("derives the built-in kinds' grants over the root environments", () => {
    const grants = resolveNamespaceGrants(true, root);

    expect(grants.namespaces.bin).toEqual(
      expect.arrayContaining(["tests", "scripts", "tooling", "data"]),
    );

    expect(grants.surface.bin).toEqual(["src"]);

    expect(grants.namespaces.scripts).not.toContain("data");

    expect(grants.namespaces.tests).toEqual(["static"]);

    expect(grants.namespaces.src).toEqual([
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

    const grants = resolveNamespaceGrants(false, [
      library,
      app,
      createInstance("static", getKind("static")),
    ]);

    expect(grants.surface.app).toEqual(["lib"]);

    expect(grants.namespaces.app).toEqual(["static"]);
  });

  test("grants nothing across scopes", () => {
    const grants = resolveNamespaceGrants(false, [
      createInstance("src", getKind("src")),
      createInstance("bin", getKind("bin")),
      createInstance("theme/src", getKind("src"), "theme"),
    ]);

    expect(grants.namespaces.src).toContain("theme/src");

    expect(grants.namespaces.bin).toContain("theme/src");
  });

  test("keeps the stronger of a kind relation and an opt-in", () => {
    const grants = resolveNamespaceGrants(false, [
      {
        ...createInstance("bin", getKind("bin")),
        imports: { src: "whole" },
      },
      {
        ...createInstance("scripts", getKind("scripts")),
        imports: { data: "surface" },
      },
      createInstance("src", getKind("src")),
      createInstance("data", getKind("data")),
    ]);

    expect(grants.surface.bin).toBeUndefined();

    expect(grants.namespaces.bin).not.toContain("src");

    expect(grants.surface.scripts).toEqual(["src"]);
  });
});
