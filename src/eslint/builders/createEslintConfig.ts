import { createBaseRules } from "#eslint/builders/createBaseRules";
import { createImportRules } from "#eslint/builders/createImportRules";
import { createPromiseRules } from "#eslint/builders/createPromiseRules";
import { createRestrictedSyntaxRules } from "#eslint/builders/createRestrictedSyntaxRules";
import { createStylisticRules } from "#eslint/builders/createStylisticRules";
import type { Config } from "#eslint/types/Config";
import type { Conventions } from "#eslint/types/Conventions";
import { defineConfig } from "eslint/config";

export function createEslintConfig(conventions: Conventions): Config[] {
  return defineConfig([
    createBaseRules(conventions),
    createImportRules(conventions),
    createStylisticRules(),
    createRestrictedSyntaxRules(conventions),
    createPromiseRules(conventions),
  ]);
}
