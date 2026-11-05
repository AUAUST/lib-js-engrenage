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
import type { Step, StepContext } from "#project/steps/index";

import manifest from "#package.json" with { type: "json" };

async function isUnset(context: StepContext, field: string): Promise<boolean> {
  return (await context.readPackageJson([field])) === undefined;
}

async function hasVisibility(context: StepContext): Promise<boolean> {
  return (
    !(await isUnset(context, "license")) || !(await isUnset(context, "private"))
  );
}

async function isScoped(context: StepContext): Promise<boolean> {
  const name = await context.readPackageJson(["name"]);

  return isString(name) && startsWith(name, "@");
}

export function createPackageStep(): Step {
  return {
    name: `${packageJsonFile} fields`,
    message: `Fill in the missing ${packageJsonFile} fields?`,
    async isMissing(context) {
      return (
        (await isUnset(context, "name")) ||
        (await isUnset(context, "version")) ||
        (await isUnset(context, "author")) ||
        !(await hasVisibility(context))
      );
    },
    async plan(context) {
      const { writePackageJson } = context;

      if (await isUnset(context, "name")) {
        await writePackageJson(
          ["name"],
          await context.text("Package name?", basename(context.context.root)),
        );
      }

      if (await isUnset(context, "version")) {
        await writePackageJson(["version"], initialVersion);
      }

      if (!(await hasVisibility(context))) {
        const traits = await context.getTraits();

        const visibility = await context.select(
          "Who can install the package?",
          visibilities,
          traits.published ? "public" : "private",
        );

        if (visibility === "private") {
          await writePackageJson(["private"], true);
        }

        await writePackageJson(
          ["license"],
          visibility === "public" ? publicLicense : privateLicense,
        );

        if (visibility === "public" && (await isScoped(context))) {
          await writePackageJson(["publishConfig", "access"], "public");
        }
      }

      if (await isUnset(context, "author")) {
        await writePackageJson(["author"], manifest.author);
      }
    },
  };
}
