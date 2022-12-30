/**
 * Has some keywords in the text?
 * @param {string} text
 * @param {string[]} keywords
 * @return {boolean}
 */
export const hasSomeKeywordsInText = (
  text: string,
  keywords: string[]
): boolean => {
  for (const keyword of keywords) {
    if (text.indexOf(keyword) !== -1) {
      return true;
    }
  }
  return false;
};
