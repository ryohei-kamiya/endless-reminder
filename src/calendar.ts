import * as sheets from "./sheets";

/**
 * Parse years from string to number array
 * @param {string} yearsStr - comma separated years or "*"(=all months)
 * @returns
 */
export const parseYearsString = (yearsStr: string): number[] => {
  if (!yearsStr) {
    return [];
  }
  if (yearsStr.indexOf("*") !== -1) {
    const now = new Date();
    return [now.getFullYear(), now.getFullYear() + 1];
  } else {
    return yearsStr
      .split(",")
      .map((nStr) => Number(nStr))
      .filter(Boolean);
  }
};

/**
 * Parse months from string to number array
 * @param {string} monthsStr - comma separated months or "*"(=all months)
 * @returns
 */
export const parseMonthsString = (monthsStr: string): number[] => {
  if (!monthsStr) {
    return [];
  }
  if (monthsStr.indexOf("*") !== -1) {
    return [...Array(12).keys()].map((n) => n + 1);
  } else {
    return monthsStr
      .split(",")
      .map((nStr) => Number(nStr))
      .filter(Boolean);
  }
};

/**
 * Update date by timeStr
 * @param {Date} date - updating target date
 * @param {string} timeStr - time(HH:mm:ss)
 */
export const updateDateByTimeString = (date: Date, timeStr: string): void => {
  if (!timeStr) {
    return;
  }
  const hms = timeStr
    .split(":")
    .map((t) => Number(t))
    .filter((value) => typeof value === "number");
  if (hms.length > 0) {
    date.setHours(hms[0]);
  }
  if (hms.length > 1) {
    date.setMinutes(hms[1]);
  }
  if (hms.length > 2) {
    date.setSeconds(hms[2]);
  }
};

/**
 * Get array of calender id
 * @return {string[]}
 */
export const getCalendarIds = (): string[] => {
  const results: string[] = [];
  const holidayCalendarsSheet = sheets.holidayCalendarsSheet();
  if (!holidayCalendarsSheet) {
    throw Error(
      `The value of holidayCalendarsSheet is null but it should not be.`
    );
  }
  const lastRow = holidayCalendarsSheet.getLastRow();
  for (let i = 2; i <= lastRow; i++) {
    const calenderId = holidayCalendarsSheet.getRange(i, 1).getValue();
    results.push(calenderId);
  }
  return results;
};

/**
 * Check if there is an event in the calendar for the specified period.
 * @param {string} calenderId - calendar id
 * @param {Date} startDate -  The start time of the period to search for events registered in the calendar
 * @param {Date} endDate - The end time of the period to search for events registered in the calendar
 * @returns
 */
export const existsEventInCalendar = (
  calenderId: string,
  startDate: Date,
  endDate: Date
): boolean => {
  let result: boolean = false;
  const cal = CalendarApp.getCalendarById(calenderId);
  if (cal) {
    const holidays = cal.getEvents(startDate, endDate);
    if (holidays.length > 0) {
      result = true;
    }
  }
  return result;
};

/**
 * Is the specified date a holiday?(exist in holiday calendars?)
 * @param {Date} argDate - specified date
 * @param {string[]|undefined} calendarIds - list of calendar id
 * @return {boolean}
 */
export const isHoliday = (
  argDate: Date,
  calendarIds: string[] | undefined = undefined
): boolean => {
  let result = false;
  if (calendarIds === undefined) {
    calendarIds = getCalendarIds();
  }

  const startDate = new Date(
    argDate.getFullYear(),
    argDate.getMonth(),
    argDate.getDate(),
    0,
    0,
    0
  );
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  for (const calendarId of calendarIds) {
    if (existsEventInCalendar(calendarId, startDate, endDate)) {
      result = true;
      break;
    }
  }
  return result;
};

/**
 * Convert the number of business days in the specified year and month to Date.
 * @param {number} year - year
 * @param {number} month - month of the year
 * @param {number} businessDays - the number of business days in the month
 * @param {string[]|undefined} calendarIds - list of calendar id
 * @returns
 */
export const convertBusinessDaysToDate = (
  year: number,
  month: number,
  businessDays: number,
  calendarIds: string[] | undefined = undefined
): Date => {
  if (calendarIds === undefined) {
    calendarIds = getCalendarIds();
  }

  let result: Date = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const date: Date = new Date(result);
  for (let i = 1; i <= 31 && businessDays > 0; i++) {
    date.setDate(i);
    if (!isHoliday(date, calendarIds)) {
      if (date.getMonth() + 1 === month) {
        result = date;
      }
      businessDays--;
    }
  }
  return result;
};

/**
 * Get a next working day
 * @param {Date} argDate
 * @param {string[]} calendarIds
 * @return {Date}
 */
export const getNextWorkingDay = (
  argDate: Date,
  calendarIds: string[] | undefined = undefined
): Date => {
  const result = new Date(argDate);
  result.setDate(result.getDate() + 1);
  if (calendarIds === undefined) {
    calendarIds = getCalendarIds();
  }
  while (isHoliday(result, calendarIds)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
};
