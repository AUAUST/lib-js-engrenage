import {
  array,
  exactOptional,
  is,
  number,
  object,
  picklist,
  string,
  union,
} from "valibot";

import { isNumber, isString } from "@auaust/toolkit";
import { compose } from "@auaust/toolkit/composer";
import { once } from "@auaust/toolkit/function";
import { freeze, record } from "@auaust/toolkit/object";

import { resolveRegisteredEnvironments } from "#batiment/environments/index";
import { declareSection } from "#foundation/options/index";
import { apiGroups } from "#project/baseline/constants";
import {
  resolveBaselineRuntime,
  resolveNodeRuntime,
  type Runtime,
} from "#project/baseline/index";
import {
  executionGlobals,
  moduleFormats,
} from "#project/environments/constants";
import { listNamespaceEnvironments } from "#project/environments/operations/listNamespaceEnvironments";
import type { Reporter } from "#foundation/reports/index";
import type { ConfigResolver } from "#project/config/index";
import type { Execution } from "#project/environments/types/Execution";
import type { ResolvedExecution } from "#project/environments/types/ResolvedExecution";

const execution = object({
  globals: exactOptional(picklist(executionGlobals)),
  apis: exactOptional(array(picklist(apiGroups))),
  syntax: exactOptional(union([number(), string()])),
  module: exactOptional(picklist(moduleFormats)),
});

// @debt a second definition of the execution shape beside `executionSchema.ts`, kept because extension presets bypass the config schema; the two can drift apart
function readExecution(name: string, value: unknown): Execution {
  if (!is(execution, value)) {
    throw new Error(
      `The environment ${name} states an execution engrenage does not know: \`globals\` takes ${executionGlobals.join(", ")}, \`module\` takes ${moduleFormats.join(", ")} and \`apis\` takes API group names`,
    );
  }

  return value;
}

function assertExecution(
  name: string,
  { globals, apis, syntax }: Execution,
): void {
  const path = `environments.${name}.execution`;

  if (globals === "node" && isString(syntax)) {
    throw new Error(
      `${path}.syntax is the baseline snapshot ${syntax}, but its globals are Node's: set it to a Node major`,
    );
  }

  if (globals !== "node" && isNumber(syntax)) {
    throw new Error(
      `${path}.syntax is the Node major ${syntax}, but its globals are not Node's: set globals to "node" or syntax to a baseline snapshot`,
    );
  }

  if (apis === undefined) {
    return;
  }

  if (globals !== "isomorphic") {
    throw new Error(
      `${path}.apis only applies to isomorphic globals: the ${globals ?? "unset"} globals already provide or lack these APIs; unset ${path}.apis`,
    );
  }

  if (syntax === undefined) {
    throw new Error(
      `${path}.apis only applies to a baseline runtime: set ${path}.syntax to a baseline snapshot`,
    );
  }
}

function resolveRuntime(
  name: string,
  { globals, syntax }: Execution,
  node: number,
  reporter: Reporter,
): Runtime | undefined {
  if (globals === undefined) {
    return;
  }

  const subject = `environments.${name}.execution.syntax`;

  if (globals === "node") {
    return resolveNodeRuntime(
      isNumber(syntax) ? syntax : node,
      isNumber(syntax) ? subject : "runtime.node",
    );
  }

  return resolveBaselineRuntime(
    isString(syntax) ? syntax : undefined,
    subject,
    reporter,
  );
}

export const executionSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, ResolvedExecution>>> {
    const [registrations, presets, { node }, entries] = await Promise.all([
      config.resolve("environments"),
      config.context.registry.contributions("environmentPresets", config),
      config.resolve("runtime"),
      listNamespaceEnvironments(config, (kind) => kind.entries === true),
    ]);

    const registered = resolveRegisteredEnvironments(
      presets.map(({ entry }) => entry),
      registrations,
      config.context.scopeDir,
    );

    // @debt `build.tool` is read structurally because `environments` sits below `build`; the bundling capability could live in a lower shared domain
    async function readToolBundled(): Promise<boolean> {
      const tool = await config.resolve("build.tool");

      return tool === false ? false : (tool.bundled ?? false);
    }

    const toolBundled = (
      registered.some(({ registration, bundled }) => {
        return bundled === undefined && entries.includes(registration.name);
      })
    )
      ? await readToolBundled()
      : false;

    return freeze(
      record(
        registered.map(
          ({ registration: { name }, execution: stated, bundled }) => {
            const resolved = readExecution(name, stated);

            assertExecution(name, resolved);

            return [
              name,
              freeze(
                compose(
                  {
                    globals: resolved.globals,
                    apis: resolved.apis ?? [],
                    module: resolved.module,
                    bundled: bundled ?? (entries.includes(name) && toolBundled),
                  },
                  compose.getters({
                    runtime: once(() => {
                      return resolveRuntime(
                        name,
                        resolved,
                        node,
                        config.context.reporter,
                      );
                    }),
                  }),
                ),
              ),
            ] as const;
          },
        ),
      ),
    );
  },
});
