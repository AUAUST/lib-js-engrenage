import { freeze } from "@auaust/toolkit/object";

import type { NamespaceKind } from "#batiment/scopes/index";
import type {
  EnvironmentPresetEntry,
  LanguageEntry,
} from "#project/environments/index";
import type { Glob } from "#types/Glob";

export const themeLayoutGlob = "layout/theme.liquid" satisfies Glob;

export const liquidThemeKind = freeze({
  name: "liquid-theme",
  level: "described",
} as const) satisfies NamespaceKind;

export const liquidLanguage = freeze({
  name: "liquid",
  extensions: freeze([".liquid"] as const),
} as const) satisfies LanguageEntry;

export const liquidEnvironmentPreset = freeze({
  name: "liquid-theme",
  languages: freeze([liquidLanguage.name, "json"] as const),
  bundled: false,
} as const) satisfies EnvironmentPresetEntry;

export const themeNamespaces = freeze([
  freeze({
    name: "layout",
    title: "the theme's layouts",
    kind: liquidThemeKind.name,
    preset: liquidEnvironmentPreset.name,
  } as const),
  freeze({
    name: "templates",
    title: "the theme's templates",
    kind: liquidThemeKind.name,
    preset: liquidEnvironmentPreset.name,
  } as const),
  freeze({
    name: "sections",
    title: "the theme's sections and section groups",
    kind: liquidThemeKind.name,
    preset: liquidEnvironmentPreset.name,
  } as const),
  freeze({
    name: "snippets",
    title: "the theme's snippets",
    kind: liquidThemeKind.name,
    preset: liquidEnvironmentPreset.name,
  } as const),
  freeze({
    name: "blocks",
    title: "the theme's blocks",
    kind: liquidThemeKind.name,
    preset: liquidEnvironmentPreset.name,
  } as const),
  freeze({
    name: "locales",
    title: "the theme's locales",
    kind: "data",
    preset: "data",
  } as const),
  freeze({
    name: "config",
    title: "the theme's settings",
    kind: "data",
    preset: "data",
  } as const),
  freeze({
    name: "assets",
    title: "the theme's assets",
    kind: "static",
    preset: "static",
  } as const),
] as const);
