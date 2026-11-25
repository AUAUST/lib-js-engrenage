import { freeze } from "@auaust/toolkit/object";

import { listMirrorRoots } from "#batiment/structure/utils/listMirrorRoots";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { MirrorRoot } from "#batiment/structure/types/MirrorRoot";
import type { TestsContext } from "#batiment/structure/types/TestsContext";

function describeRoot({ key, namespace }: MirrorRoot): string {
  return key === namespace
    ? `the ${namespace} namespace`
    : `the ${key} directory of the ${namespace} namespace`;
}

export function listTestsRootDiagnostics(
  namespace: string,
  tests: Pick<TestsContext, "namespaces">,
): readonly StructureDiagnostic[] {
  const shared = [
    ...Map.groupBy(listMirrorRoots(tests), ({ key }) => key),
  ].filter(([, roots]) => roots.length > 1);

  return freeze(
    shared.map(([key, roots]) => {
      return freeze({
        severity: "error" as const,
        code: "shared-tests-root-key" as const,
        message: `${namespace} root key ${key} names ${roots.map(describeRoot).join(" and ")}, each mirrored under its own root key: rename one`,
        blocking: true as const,
        namespace,
        files: freeze(roots.flatMap(({ dirs }) => dirs)),
      });
    }),
  );
}
