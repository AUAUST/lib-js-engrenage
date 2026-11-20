import type { ModelFact } from "#tools/agents/metalbrain/types/ModelFact";
import type { ModelFacts } from "#tools/agents/metalbrain/types/ModelFacts";

const dateSuffix = /-\d{8}$/u;

function findExact(facts: ModelFacts, model: string): ModelFact | undefined {
  return Object.hasOwn(facts.models, model)
    ? facts.models[model]
    : Object.values(facts.models).find(({ aliases }) => {
        return aliases.includes(model);
      });
}

/**
 * Finds the facts of a model by its id or one of its aliases, then, for a dated
 * id, by the id without its date.
 */
export function findModelFact(
  facts: ModelFacts,
  model: string,
): ModelFact | undefined {
  return (
    findExact(facts, model) ??
    (dateSuffix.test(model)
      ? findExact(facts, model.replace(dateSuffix, ""))
      : undefined)
  );
}
