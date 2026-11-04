import { basename } from "node:path";

import { startsWith } from "@auaust/primitive-kit/strings";
import { isString } from "@auaust/toolkit/isString";

import { packageJsonFile } from "#constants";
import {
  initialVersion,
  privateLicense,
  publicLicense,
  visibilities,
} from "#project/package/constants";
import type { Step } from "#project/steps/types/Step";
import type { StepContext } from "#project/steps/types/StepContext";
import type { Directory } from "#types/Directory";

import manifest from "#package.json" with { type: "json" };

interface Sections {
  root: Directory;
}

function isUnset(context: StepContext<Sections>, field: string): boolean {
  return context.readPackageJson([field]) === undefined;
}

function hasVisibility(context: StepContext<Sections>): boolean {
  return !isUnset(context, "license") || !isUnset(context, "private");
}

function isScoped(context: StepContext<Sections>): boolean {
  const name = context.readPackageJson(["name"]);

  return isString(name) && startsWith(name, "@");
}

export function createPackageStep(): Step<Sections> {
  return {
    name: `${packageJsonFile} fields`,
    message: `Fill in the missing ${packageJsonFile} fields?`,
    isMissing(context) {
      return (
        isUnset(context, "name") ||
        isUnset(context, "version") ||
        isUnset(context, "author") ||
        !hasVisibility(context)
      );
    },
    async plan(context) {
      const { get, writePackageJson } = context;

      if (isUnset(context, "name")) {
        writePackageJson(
          ["name"],
          await context.text("Package name?", basename(get("root"))),
        );
      }

      if (isUnset(context, "version")) {
        writePackageJson(["version"], initialVersion);
      }

      if (!hasVisibility(context)) {
        const visibility = await context.select(
          "Who can install the package?",
          visibilities,
          context.getTraits().published ? "public" : "private",
        );

        if (visibility === "private") {
          writePackageJson(["private"], true);
        }

        writePackageJson(
          ["license"],
          visibility === "public" ? publicLicense : privateLicense,
        );

        if (visibility === "public" && isScoped(context)) {
          writePackageJson(["publishConfig", "access"], "public");
        }
      }

      if (isUnset(context, "author")) {
        writePackageJson(["author"], manifest.author);
      }
    },
  };
}
