import {
  array,
  boolean,
  description,
  optional,
  picklist,
  pipe,
  record,
  strictObject,
  string,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { globSchema } from "#config/config/schemas/values/globsSchema";
import { roleKeySchema } from "#project/structure/config/schemas/roleKeySchema";

export const structureOptions = {
  namespaces: optional(
    pipe(
      record(
        directorySchema,
        strictObject({
          layers: optional(
            pipe(
              array(string()),
              description(
                "Order of the namespace's children, lowest first, with `*` for every child not listed. Unset, the children are unordered peers.",
              ),
            ),
          ),
          prefix: optional(
            pipe(
              string(),
              description(
                "Alias prefix of the domains the namespace holds, consumed by the alias generation. An empty prefix gives them `#<domain>`.",
              ),
            ),
          ),
          roles: optional(
            strictObject({
              enable: pipe(
                array(roleKeySchema),
                description(
                  "Scoped roles to turn on for the whole subtree of the namespace.",
                ),
              ),
            }),
          ),
        }),
      ),
      description(
        join(
          [
            "Grouping directories, by path relative to the environment directory (`.` is the environment directory itself).",
            "A namespace has no `index.ts` and no roles, holds domains and namespaces, and orders them with `layers`.",
            "@default none, so namespaces are inferred",
          ],
          "\n",
        ),
      ),
    ),
  ),
  domains: optional(
    pipe(
      record(
        globSchema,
        strictObject({
          public: optional(
            pipe(
              boolean(),
              description(
                join(
                  [
                    "Whether the domain is part of the package's public API.",
                    "@default `false`",
                  ],
                  "\n",
                ),
              ),
            ),
          ),
          specifier: optional(
            pipe(
              string(),
              description(
                "Public specifier of the domain, overriding the one derived from its path.",
              ),
            ),
          ),
          purpose: optional(
            pipe(
              string(),
              description("One line stating the domain's concern."),
            ),
          ),
        }),
      ),
      description(
        join(
          [
            "Metadata of domains, by path or glob relative to the environment directory.",
            "A path declaration also makes a directory a domain, even a role-named one; a glob only adds metadata.",
            "@default none",
          ],
          "\n",
        ),
      ),
    ),
  ),
  optOut: optional(
    pipe(
      array(directorySchema),
      description(
        join(
          [
            "Directories, relative to the environment directory, that are never read as roles even though their name is one.",
            "@default none",
          ],
          "\n",
        ),
      ),
    ),
  ),
  strictness: optional(
    pipe(
      picklist(["strict", "loose"]),
      description(
        join(
          [
            "`strict` expects every directory to be classified; under `loose`, unclassified directories count as plain domains.",
            "@default `strict`",
          ],
          "\n",
        ),
      ),
    ),
  ),
};
