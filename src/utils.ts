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

/**
 * Convert time to string
 * @param {Date|string} time
 * @return {string}
 */
export const convertTimeToString = (time: Date | string): string => {
  let hms = "";
  if (time instanceof Date) {
    const hour = ("00" + time.getHours()).slice(-2);
    const minutes = ("00" + time.getMinutes()).slice(-2);
    const seconds = ("00" + time.getSeconds()).slice(-2);
    hms = `${hour}:${minutes}:${seconds}`;
  } else {
    hms = String(time);
  }
  return hms;
};
