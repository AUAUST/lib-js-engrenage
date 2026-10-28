import { basename } from "node:path";

import { includes } from "@auaust/primitive-kit/arrays";
import { startsWith } from "@auaust/primitive-kit/strings";
import { isString } from "@auaust/toolkit/isString";

import { packageJsonFile } from "#constants";
import {
  initialVersion,
  privateLicense,
  publicLicense,
  visibilities,
} from "#support/packageJson/constants";
import type { Step } from "#support/scaffold/types/Step";
import type { StepContext } from "#support/scaffold/types/StepContext";

import manifest from "#package.json" with { type: "json" };

function isUnset(context: StepContext, field: string): boolean {
  return context.readPackageJson([field]) === undefined;
}

function hasVisibility(context: StepContext): boolean {
  return !isUnset(context, "license") || !isUnset(context, "private");
}

function isScoped(context: StepContext): boolean {
  const name = context.readPackageJson(["name"]);

  return isString(name) && startsWith(name, "@");
}

export function createPackageStep(): Step {
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
      const { config, writePackageJson } = context;

      if (isUnset(context, "name")) {
        writePackageJson(
          ["name"],
          await context.text("Package name?", basename(config.root)),
        );
      }

      if (isUnset(context, "version")) {
        writePackageJson(["version"], initialVersion);
      }

      if (!hasVisibility(context)) {
        const visibility = await context.select(
          "Who can install the package?",
          visibilities,
          includes(context.getPresets(), "library") ? "public" : "private",
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
