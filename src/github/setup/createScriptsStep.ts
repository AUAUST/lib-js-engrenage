import { workflowSets } from "#github/constants";
import { resolveWorkflowSet } from "#github/utils/resolveWorkflowSet";
import type { Step } from "#support/scaffold/types/Step";
import type { StepContext } from "#support/scaffold/types/StepContext";

function findMissingScripts({
  config,
  getPresets,
  hasDependency,
  readPackageJson,
}: StepContext): ReadonlyArray<string> {
  const name = resolveWorkflowSet({
    workflows: config.github.workflows,
    presets: getPresets(),
    hasDependency,
  });

  if (name === undefined) {
    return [];
  }

  return workflowSets[name].scripts.filter((script) => {
    return readPackageJson(["scripts", script]) === undefined;
  });
}

export function createScriptsStep(): Step {
  return {
    name: "workflow scripts",
    message: "Add placeholder scripts for the scripts the workflows run?",
    isMissing(context) {
      return findMissingScripts(context).length > 0;
    },
    plan(context) {
      for (const script of findMissingScripts(context)) {
        context.writePackageJson(
          ["scripts", script],
          `echo "Configure the ${script} script" >&2 && exit 1`,
        );
      }
    },
  };
}
