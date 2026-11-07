import { basename } from "node:path";

import { packageJsonFile } from "#constants";
import { visibilitySection } from "#project/package/config/sections/visibilitySection";
import {
  initialVersion,
  privateLicense,
  publicLicense,
} from "#project/package/constants";
import type { Step, StepContext } from "#project/steps/index";

import manifest from "#package.json" with { type: "json" };

async function isUnset(context: StepContext, field: string): Promise<boolean> {
  return (await context.readPackageJson([field])) === undefined;
}

async function isPublic(context: StepContext): Promise<boolean> {
  const { published } = await context.getTraits();

  return published && (await context.resolve(visibilitySection)) === "public";
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
        (await isUnset(context, "license"))
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

      if (await isUnset(context, "license")) {
        await writePackageJson(
          ["license"],
          (await isPublic(context)) ? publicLicense : privateLicense,
        );
      }

      if (await isUnset(context, "author")) {
        await writePackageJson(["author"], manifest.author);
      }
    },
  };
}
