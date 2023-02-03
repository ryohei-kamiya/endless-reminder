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
 * Cast an any type data to a number safety
 * @param {any} data - required
 * @param {number} minValue - required: minimum value of the number
 * @param {number} maxValue - required: maximum value of the number
 * @param {number} defaultValue - optional: default is 0
 * @return {number}
 */
export const getSafeNumber = (
  data: any,
  minValue: number,
  maxValue: number,
  defaultValue = 0
): number => {
  const num = Number(data);
  if (Number.isNaN(num)) {
    return defaultValue;
  }
  if (num < minValue) {
    return minValue;
  } else if (num > maxValue) {
    return maxValue;
  }
  return num;
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

/**
 * Merge arrays
 * @param {any[]} arr1
 * @param {any[]} arr2
 * @param {boolean} uniq
 * @return {any[]}
 */
export const mergeArrays = (arr1: any[], arr2: any[], uniq = false): any[] => {
  if (!arr1 && !arr2) {
    return [];
  }
  if (!uniq) {
    if (!arr1) {
      return arr2;
    } else if (!arr2) {
      return arr1;
    } else {
      return [...arr1, ...arr2];
    }
  }
  if (!arr1) {
    return Array.from(new Set(arr2));
  } else if (!arr2) {
    return Array.from(new Set(arr1));
  } else {
    return Array.from(new Set([...arr1, ...arr2]));
  }
};
