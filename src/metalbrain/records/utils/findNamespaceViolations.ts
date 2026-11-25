import type { RecordKind } from "#metalbrain/records/types/RecordKind";

const namespacePattern = /^[A-Z]+$/u;

/**
 * Each departure of `kinds` from the namespace contract: a namespace of other
 * characters than uppercase letters, and one an earlier kind already declares.
 */
export function findNamespaceViolations(
  kinds: readonly Pick<RecordKind, "name" | "namespace">[],
): string[] {
  const violations: string[] = [];

  const owners = new Map<string, string>();

  for (const { name, namespace } of kinds) {
    if (!namespacePattern.test(namespace)) {
      violations.push(
        `The ${name} kind's namespace "${namespace}" holds other characters than uppercase letters`,
      );
    }

    const owner = owners.get(namespace);

    if (owner === undefined) {
      owners.set(namespace, name);
    } else {
      violations.push(
        `The ${name} kind's namespace ${namespace} is already the ${owner} kind's`,
      );
    }
  }

  return violations;
}
