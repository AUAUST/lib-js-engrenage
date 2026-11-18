import { attributesBlock, gitattributesFile } from "#tools/git/constants";
import type { Step } from "#project/steps/index";

const attributesMarker = "# @attributes";

export function createGitattributesStep(): Step {
  return {
    name: gitattributesFile,
    message: `Add the engrenage attributes block to ${gitattributesFile}?`,
    async isMissing({ filesystem }) {
      const content = await filesystem.read(gitattributesFile);

      return !content
        ?.split("\n")
        .some((line) => line.startsWith(attributesMarker));
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
