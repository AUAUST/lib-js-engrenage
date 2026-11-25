import { matchesGlob, posix } from "node:path";

import {
  entries,
  freeze,
  getOwn,
  hasOwn,
  keys,
  record,
} from "@auaust/toolkit/object";

import type { StructureDiagnostic } from "#batiment/report/index";
import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";
import type { MetadataField } from "#batiment/structure/types/MetadataField";
import type { StructureMetadata } from "#batiment/structure/types/StructureMetadata";
import type { StructureOptions } from "#batiment/structure/types/StructureOptions";
import type { StructureSource } from "#batiment/structure/types/StructureSource";
import type { ValueOrigin } from "#foundation/options/index";
import type { Directory } from "#types/Directory";

const namespaceRoot = ".";

const sourcedFields = freeze(["collects", "publicRoles"] as const);

type Finding = Pick<StructureDiagnostic, "code" | "message" | "files">;

export function mergeStructureMetadata({
  namespaceName,
  key,
  declared,
  metadata,
  optionPaths,
  origins,
}: {
  namespaceName: string;
  key: string;
  declared: DeclaredStructure;
  metadata: readonly StructureMetadata[];
  optionPaths: Readonly<Record<Directory, string>>;
  origins: ReadonlyMap<string, ValueOrigin>;
}): Pick<StructureOptions, "namespaces" | "domains"> & {
  readonly diagnostics: readonly StructureDiagnostic[];
} {
  function optionPath(path: string): string {
    const option = getOwn(optionPaths, path);

    if (option === undefined) {
      throw new Error(`${namespaceName}:${path} has no declared option path`);
    }

    return option;
  }

  const namespaces = new Map<
    string,
    DeclaredStructure["namespaces"][string] & {
      source: StructureSource;
    }
  >(
    entries(declared.namespaces).map(([path, namespace]) => {
      return [path, { ...namespace, source: "config" }];
    }),
  );

  const domains = new Map<string, StructureOptions["domains"][string]>(
    entries(declared.domains).map(([path, domain]) => {
      return [
        path,
        {
          ...domain,
          source: "config",
          sources: freeze(
            record(
              sourcedFields
                .filter((field) => domain[field] !== undefined)
                .map((field) => {
                  return [
                    field,
                    freeze({
                      files: freeze([]),
                      config: freeze({
                        key,
                        path: `${optionPath(path)}.${field}`,
                      }),
                    }),
                  ] as const;
                }),
            ),
          ),
        },
      ];
    }),
  );

  const globs = keys(declared.domains);
  const diagnostics: StructureDiagnostic[] = [];

  function addDiagnostic(
    finding: Finding,
    config?: StructureDiagnostic["config"],
  ) {
    diagnostics.push(
      freeze({
        severity: "error",
        blocking: true,
        namespace: namespaceName,
        ...finding,
        files: freeze(finding.files),
        ...(config === undefined ? {} : { config: freeze(config) }),
      }),
    );
  }

  function reportInput(finding: Finding, option: string) {
    const origin = origins.get(option);

    if (origin === undefined) {
      throw new Error(`The origin of ${key} option ${option} was not read`);
    }

    if (origin.layer === "input") {
      addDiagnostic(finding, {
        key,
        path: option,
        origin,
      });
    }
  }

  for (const { path, kind, fields, files } of metadata) {
    const sources = files.join(", ");

    function pick<Value>(
      field: string,
      configured: Value | undefined,
      located: MetadataField<Value> | undefined,
    ): Value | undefined {
      if (located === undefined) {
        return configured;
      }

      if (configured !== undefined) {
        reportInput(
          {
            code: "config-metafile-conflict",
            message: `${namespaceName}:${path} sets ${field} in both the config and ${located.file}; keeping the value of ${located.file}`,
            files: [located.file],
          },
          `${optionPath(path)}.${field}`,
        );
      }

      return located.value;
    }

    const other = kind === "namespace" ? "domain" : "namespace";

    const conflicting = kind === "namespace"
      ? hasOwn(declared.domains, path)
      : hasOwn(declared.namespaces, path);

    if (conflicting) {
      reportInput(
        {
          code: "config-metafile-kind",
          message: `${namespaceName}:${path} is declared as a ${other} by the config and as a ${kind} by ${sources}; keeping the ${kind} and dropping the config's ${other}`,
          files,
        },
        optionPath(path),
      );

      if (kind === "namespace") {
        domains.delete(path);
      } else {
        namespaces.delete(path);
      }
    }

    if (kind === "namespace") {
      const matching = globs.filter((glob) => {
        return glob !== path && matchesGlob(path, glob);
      });

      for (const glob of matching) {
        reportInput(
          {
            code: "domain-glob-namespace",
            message: `${namespaceName}:${path} is declared as a namespace by ${sources}, but the config domain glob ${glob} matches it; keeping the namespace`,
            files,
          },
          optionPath(glob),
        );
      }

      const existing = namespaces.get(path);

      namespaces.set(path, {
        layers: pick("layers", existing?.layers, fields.layers),
        relation: pick("relation", existing?.relation, fields.relation),
        children: pick("children", existing?.children, fields.children),
        purpose: pick("purpose", existing?.purpose, fields.purpose),
        debt: pick("debt", existing?.debt, fields.debt),
        roles: existing?.roles ?? freeze({ enable: freeze([]) }),
        source: existing?.source ?? "metadata",
      });

      continue;
    }

    const existing = domains.get(path);

    domains.set(path, {
      specifier: pick("specifier", existing?.specifier, fields.specifier),
      purpose: pick("purpose", existing?.purpose, fields.purpose),
      debt: pick("debt", existing?.debt, fields.debt),
      internals: pick("internals", existing?.internals, fields.internals),
      reexport: pick("reexport", existing?.reexport, fields.reexport),
      collects: pick("collects", existing?.collects, fields.collects),
      publicRoles: pick(
        "publicRoles",
        existing?.publicRoles,
        fields.publicRoles,
      ),
      public: pick("public", existing?.public, fields.public),
      source: existing?.source ?? "metadata",
      sources: freeze({
        ...existing?.sources,
        ...record(
          sourcedFields.flatMap((field) => {
            const located = fields[field];

            return located === undefined
              ? []
              : [[field, freeze({ files: freeze([located.file]) })] as const];
          }),
        ),
      }),
    });
  }

  const metadataAt = new Map(
    metadata.map((located) => {
      return [located.path, located] as const;
    }),
  );

  for (const { path, kind, files } of metadata) {
    if (kind !== "namespace" || path === namespaceRoot) {
      continue;
    }

    const parent = posix.dirname(path);

    if (namespaces.get(parent)?.children !== "domains") {
      continue;
    }

    const finding = {
      code: "children-domains-namespace" as const,
      message: `${namespaceName}:${path} is declared as a namespace by ${files.join(", ")}, but ${parent}'s children are domains; keeping the namespace`,
    };

    const declaring = metadataAt.get(parent)?.fields.children;

    if (declaring === undefined) {
      reportInput({ ...finding, files }, `${optionPath(parent)}.children`);
    } else {
      addDiagnostic({ ...finding, files: [declaring.file, ...files] });
    }
  }

  const resolvedNamespaces = [...namespaces].map(([path, namespace]) => {
    return [
      path,
      freeze({
        ...namespace,
        relation: namespace.relation ?? "peers",
      }),
    ] as const;
  });

  const resolvedDomains = [...domains].map(([path, domain]) => {
    return [path, freeze(domain)] as const;
  });

  return freeze({
    namespaces: freeze(record(resolvedNamespaces)),
    domains: freeze(record(resolvedDomains)),
    diagnostics: freeze(diagnostics),
  });
}
