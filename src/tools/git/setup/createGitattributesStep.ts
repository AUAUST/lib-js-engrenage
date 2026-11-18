import { listBlockMarkers } from "#foundation/blocks/index";
import {
  attributesBlock,
  gitattributesFile,
  hashBlocks,
} from "#tools/git/constants";
import type { Step } from "#project/steps/index";

export function createGitattributesStep(): Step {
  return {
    name: gitattributesFile,
    message: `Add the engrenage attributes block to ${gitattributesFile}?`,
    async isMissing({ filesystem }) {
      const content = await filesystem.read(gitattributesFile);

      return (
        content === undefined ||
        !listBlockMarkers(content, hashBlocks).some(({ directive }) => {
          return directive === "attributes";
        })
      );
    },
    async plan({ filesystem }) {
      const existing = (
        (await filesystem.read(gitattributesFile)) ?? ""
      ).trim();

      await filesystem.write(
        gitattributesFile,
        existing === "" ? attributesBlock : `${attributesBlock}\n${existing}\n`,
      );
    },
  };
}
