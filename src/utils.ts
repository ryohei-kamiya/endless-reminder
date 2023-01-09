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
    if (text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
      return true;
    }
  }
  return false;
};

/**
 * Get hours or minutes or seconds value from array
 * @param {any[]} arr
 * @param {number} index
 * @return {number}
 */
export const getSafeTimeNumberFromArray = (
  arr: any[],
  index: number
): number => {
  if (!arr || arr.length === 0) {
    return 0;
  }
  if (arr.length <= index) {
    return 0;
  }
  if (index === 0) {
    // get hours safety
    const hours = Number(arr[index]);
    if (Number.isNaN(hours)) {
      return 0;
    } else if (hours < 0) {
      return 0;
    } else if (hours > 23) {
      return 23;
    }
    return hours;
  } else if (index === 1) {
    // get minutes safety
    const minutes = Number(arr[index]);
    if (Number.isNaN(minutes)) {
      return 0;
    } else if (minutes < 0) {
      return 0;
    } else if (minutes > 59) {
      return 59;
    }
    return minutes;
  } else if (index === 2) {
    // get seconds safety
    const seconds = Number(arr[index]);
    if (Number.isNaN(seconds)) {
      return 0;
    } else if (seconds < 0) {
      return 0;
    } else if (seconds > 59) {
      return 59;
    }
    return seconds;
  }
  return 0;
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
  } else if (typeof time == "string") {
    const separatedTime = time.split(":");
    const hour = (
      "00" + getSafeTimeNumberFromArray(separatedTime, 0).toString()
    ).slice(-2);
    const minutes = (
      "00" + getSafeTimeNumberFromArray(separatedTime, 1).toString()
    ).slice(-2);
    const seconds = (
      "00" + getSafeTimeNumberFromArray(separatedTime, 2).toString()
    ).slice(-2);
    hms = `${hour}:${minutes}:${seconds}`;
  } else {
    hms = "00:00:00";
  }
  return hms;
};
