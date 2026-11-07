import { createImportRule } from "#project/structure/utils/createImportRule";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";

function category(name: ImportCategory): ImportRuleTarget {
  return { kind: "category", category: name };
}

export function resolveEnvironmentImportRules({
  active,
  published,
}: {
  active: Readonly<Record<StructureEnvironmentName, boolean>>;
  published: boolean;
}): ImportRule[] {
  const rules: ImportRule[] = [];

  function environment(name: StructureEnvironmentName) {
    return { kind: "environment", environment: name } as const;
  }

  /** @debt most environment-sourced rules are labelled with the `test-variant` relation instead of `environment`, so the project map derives its matrix from the source kind */
  function variant(name: "plain" | "src" | "dist") {
    return { kind: "test-variant", variant: name } as const;
  }

  if (active.src) {
    const source = environment("src");

    rules.push(
      ...createImportRule(
        source,
        [category("bin")],
        "test-variant",
        "forbid",
        "src never imports bin",
      ),
      ...createImportRule(
        source,
        [category("scripts")],
        "test-variant",
        "forbid",
        "src never imports scripts",
      ),
      ...createImportRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
      ...(published
        ? [
            ...createImportRule(
              source,
              [category("data")],
              "test-variant",
              "forbid",
              "a library's src never imports data/",
            ),
            ...createImportRule(
              source,
              [category("data")],
              "test-variant",
              "allow",
              "a library's src reads data/ at runtime through the public specifier",
              { enforceable: false },
            ),
          ]
        : createImportRule(
            source,
            [category("data")],
            "test-variant",
            "allow",
            "an app's src imports data/ statically through #data",
          )),
    );
  }

  if (active.bin) {
    const source = environment("bin");

    rules.push(
      ...createImportRule(
        source,
        [category("public-entries"), category("internal-aliases")],
        "test-variant",
        "allow",
        "bin commands are thin and use all of src",
      ),
      ...createImportRule(
        source,
        [category("bin")],
        "test-variant",
        "allow",
        "bin imports its own command tree",
      ),
      ...createImportRule(
        source,
        [category("scripts")],
        "test-variant",
        "forbid",
        "bin never imports scripts",
      ),
      ...createImportRule(
        source,
        [category("data")],
        "test-variant",
        "forbid",
        "bin never reads data/ directly",
      ),
      ...createImportRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
    );
  }

  if (active.scripts) {
    const source = environment("scripts");

    rules.push(
      ...createImportRule(
        source,
        [category("public-entries"), category("internal-aliases")],
        "test-variant",
        "allow",
        "scripts use all of src",
      ),
      ...createImportRule(
        source,
        [category("scripts")],
        "test-variant",
        "allow",
        "scripts import their own modules",
      ),
      ...createImportRule(
        source,
        [category("bin")],
        "test-variant",
        "forbid",
        "scripts never import bin",
      ),
      ...createImportRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
      ...createImportRule(
        source,
        [category("data")],
        "test-variant",
        "allow",
        "scripts read and write data/ by path (generated files)",
        { enforceable: false },
      ),
    );
  }

  if (active.tooling) {
    const source = environment("tooling");

    rules.push(
      ...createImportRule(
        source,
        [category("public-entries"), category("internal-aliases")],
        "test-variant",
        "allow",
        "tooling uses all of src",
      ),
      ...createImportRule(
        source,
        [category("bin"), category("scripts"), category("data")],
        "test-variant",
        "forbid",
        "tooling never imports bin, scripts or data/",
      ),
      ...createImportRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
    );
  }

  if (active.tests) {
    const spawn = createImportRule(
      environment("tests"),
      [category("bin")],
      "environment",
      "allow",
      "tests spawn bin commands",
      { enforceable: false },
    );

    if (published) {
      const plain = variant("plain");
      const source = variant("src");
      const dist = variant("dist");

      rules.push(
        ...spawn,
        ...createImportRule(
          environment("tests"),
          [category("data")],
          "environment",
          "allow",
          "a library's tests read data/ at runtime through the public specifier",
          { enforceable: false },
        ),
        ...createImportRule(
          plain,
          [category("public-entries"), category("tests"), category("scripts")],
          "test-variant",
          "allow",
          "x.test.ts runs in source and dist mode, so it imports the package name",
        ),
        ...createImportRule(
          plain,
          [category("internal-aliases"), category("bin")],
          "test-variant",
          "forbid",
          "x.test.ts never imports internals or bin modules; those belong to x.test.src.ts",
        ),
        ...createImportRule(
          source,
          [
            category("internal-aliases"),
            category("bin"),
            category("tests"),
            category("scripts"),
          ],
          "test-variant",
          "allow",
          "x.test.src.ts runs in source mode only and reaches internals through #… aliases",
        ),
        ...createImportRule(
          source,
          [category("public-entries")],
          "test-variant",
          "forbid",
          "x.test.src.ts never imports the package name",
        ),
        ...createImportRule(
          dist,
          [
            category("public-entries"),
            category("tests"),
            category("scripts"),
            category("dist-artefacts"),
          ],
          "test-variant",
          "allow",
          "x.test.dist.ts runs in dist mode only and may reach dist-only artefacts",
        ),
        ...createImportRule(
          dist,
          [category("internal-aliases"), category("bin")],
          "test-variant",
          "forbid",
          "x.test.dist.ts never imports internals or bin modules",
        ),
      );
    } else {
      rules.push(
        ...spawn,
        ...createImportRule(
          environment("tests"),
          [
            category("internal-aliases"),
            category("bin"),
            category("scripts"),
            category("tests"),
            category("data"),
          ],
          "environment",
          "allow",
          "an app's tests import everything through #… aliases",
        ),
      );
    }
  }

  return rules;
}
