import * as sheets from "./sheets";
import * as settings from "./settings";

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
    .filter((value) => typeof value == "number");
  if (hms.length > 0) {
    date.setHours(hms[0]);
  } else {
    date.setHours(0);
  }
  if (hms.length > 1) {
    date.setMinutes(hms[1]);
  } else {
    date.setMinutes(0);
  }
  if (hms.length > 2) {
    date.setSeconds(hms[2]);
  } else {
    date.setSeconds(0);
  }
  if (hms.length > 3) {
    date.setMilliseconds(hms[3]);
  } else {
    date.setMilliseconds(0);
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
  const tableData = sheets.getTableData(holidayCalendarsSheet);
  for (let row = 1; row < tableData.getRows(); row++) {
    const calenderId = tableData.getValue(row, 0);
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
  let result = false;
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
 * Get a next date
 * @param {Date} argDate
 * @param {number} timeInterval
 * @param {boolean} exceptHolidays
 * @param {string[]} calendarIds
 * @return {Date}
 */
export const getNextDate = (
  argDate: Date,
  timeInterval: number,
  exceptHolidays: boolean,
  calendarIds: string[] | undefined = undefined
): Date => {
  const result = new Date(argDate);
  result.setMinutes(result.getMinutes() + timeInterval);
  const openingDate = new Date(argDate);
  updateDateByTimeString(openingDate, settings.getOpeningTime());
  if (result < openingDate) {
    result.setDate(openingDate.getDate());
    result.setHours(openingDate.getHours());
    result.setMinutes(openingDate.getMinutes());
    result.setSeconds(openingDate.getSeconds());
    result.setMilliseconds(0);
  }
  const nextOpeningDate = new Date(openingDate);
  nextOpeningDate.setDate(openingDate.getDate() + 1);
  const closingDate = new Date(argDate);
  updateDateByTimeString(closingDate, settings.getClosingTime());
  if (closingDate < result && result < nextOpeningDate) {
    result.setTime(nextOpeningDate.getTime());
  }
  if (exceptHolidays) {
    if (calendarIds === undefined) {
      calendarIds = getCalendarIds();
    }
    while (isHoliday(result, calendarIds)) {
      result.setDate(result.getDate() + 1);
    }
  }
  return result;
};

/**
 * Get a next timeInterval
 * @param {number} timeInterval
 * @return {number}
 */
export const getNextTimeInterval = (timeInterval: number): number => {
  const timeIntervalMin = settings.getTimeIntervalMin();
  const result = timeInterval / settings.getTimeIntervalDecay();
  if (result < timeIntervalMin) {
    return timeIntervalMin;
  }
  return result;
};
