import type { Config } from "@auaust/engrenage/config";

export default async function config(): Promise<Config> {
  return {
    preset: "library",
    tests: {
      dirs: "test",
    },
    src: {
      generated: ["generated/**"],
    },
  };
}
