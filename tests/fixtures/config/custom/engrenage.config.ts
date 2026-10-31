import type { Config } from "@auaust/engrenage/config";

export default async function config(): Promise<Config> {
  return {
    presets: ["library"],
    tests: {
      dirs: "test",
    },
    src: {
      generated: ["generated/**"],
    },
  };
}
