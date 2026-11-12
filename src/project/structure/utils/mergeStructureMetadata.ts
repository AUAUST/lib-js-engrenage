import { matchesGlob } from "node:path";

import { entries, freeze, hasOwn, keys, record } from "@auaust/toolkit/object";

import type { DeclaredStructure } from "#project/structure/types/DeclaredStructure";
import type { MetadataField } from "#project/structure/types/MetadataField";
import type { StructureMetadata } from "#project/structure/types/StructureMetadata";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { StructureSource } from "#project/structure/types/StructureSource";

export function mergeStructureMetadata({
  environment,
  declared,
  metadata,
}: {
  environment: string;
  declared: DeclaredStructure;
  metadata: readonly StructureMetadata[];
}): Pick<StructureOptions, "namespaces" | "domains"> {
  const namespaces = new Map<
    string,
    DeclaredStructure["namespaces"][string] & { source: StructureSource }
  >(
    entries(declared.namespaces).map(([path, namespace]) => {
      return [path, { ...namespace, source: "config" }];
    }),
  );

  const domains = new Map<string, StructureOptions["domains"][string]>(
    entries(declared.domains).map(([path, domain]) => {
      return [path, { ...domain, source: "config" }];
    }),
  );

  const globs = keys(declared.domains);

  for (const { path, kind, fields, files } of metadata) {
    const sources = files.join(", ");

    function pick<Value>(
      field: string,
      configured: Value | undefined,
      located: MetadataField<Value> | undefined,
    ): Value | undefined {
      if (configured !== undefined && located !== undefined) {
        throw new Error(
          `${environment}:${path} sets ${field} in both the config and ${located.file}`,
        );
      }

      return configured ?? located?.value;
    }

    const conflicting = kind === "namespace"
      ? hasOwn(declared.domains, path)
      : hasOwn(declared.namespaces, path);

    if (conflicting) {
      throw new Error(
        `${environment}:${path} is declared as a ${kind === "namespace" ? "domain" : "namespace"} by the config and as a ${kind} by ${sources}`,
      );
    }

    if (kind === "namespace") {
      const glob = globs.find((key) => {
        return key !== path && matchesGlob(path, key);
      });

      if (glob !== undefined) {
        throw new Error(
          `${environment}:${path} is declared as a namespace by ${sources}, but the config domain glob ${glob} matches it`,
        );
      }

      const existing = namespaces.get(path);

      namespaces.set(path, {
        layers: pick("layers", existing?.layers, fields.layers),
        relation: pick("relation", existing?.relation, fields.relation),
        children: existing?.children,
        purpose: pick("purpose", existing?.purpose, fields.purpose),
        roles: existing?.roles ?? freeze({ enable: freeze([]) }),
        source: existing?.source ?? "metadata",
      });

      continue;
    }

    const existing = domains.get(path);

    domains.set(path, {
      specifier: pick("specifier", existing?.specifier, fields.specifier),
      purpose: pick("purpose", existing?.purpose, fields.purpose),
      internals: pick("internals", existing?.internals, fields.internals),
      reexport: pick("reexport", existing?.reexport, fields.reexport),
      collects: pick("collects", existing?.collects, fields.collects),
      public: pick("public", existing?.public, fields.public),
      source: existing?.source ?? "metadata",
    });
  }

  const resolvedNamespaces = [...namespaces].map(([path, namespace]) => {
    return [
      path,
      freeze({ ...namespace, relation: namespace.relation ?? "peers" }),
    ] as const;
  });

  const resolvedDomains = [...domains].map(([path, domain]) => {
    return [path, freeze(domain)] as const;
  });

  return freeze({
    namespaces: freeze(record(resolvedNamespaces)),
    domains: freeze(record(resolvedDomains)),
  });
}
