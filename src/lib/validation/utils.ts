export function isTagMatched(targetTagList: string[], objectTagList: string[]) {
  return targetTagList.some((tag) => objectTagList.includes(tag));
}
