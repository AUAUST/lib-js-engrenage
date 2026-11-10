const separatedReferencesPattern = /^(?:Closes|Towards) #\d+\n(?:[ \t]*\n)+(?:Closes|Towards) #\d+$/mu;

export function hasSeparatedIssueReferences(message: string) {
  return separatedReferencesPattern.test(message);
}
