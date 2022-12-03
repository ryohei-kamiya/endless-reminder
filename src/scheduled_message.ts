import * as sheets from "./sheets";
import * as calendar from "./calendar";

type ScheduledMessage = {
  date: Date;
  channel: string;
  message: string;
};

/**
 * Get scheduled messages from SpreadSheet
 * @param {Date} argDate - specified date
 * @returns {ScheduledMessage[]} - Scheduled messages
 */
export const getScheduledMessagesFromSpreadSheet = (
  argDate: Date | undefined = undefined
): ScheduledMessage[] => {
  const results: ScheduledMessage[] = [];
  const now = new Date();
  const calenderIds = calendar.getCalendarIds();
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const lastRow = _mainSheet.getLastRow();
  for (let i = 1; i <= lastRow; i++) {
    // get remindSettingNumber(column number === 1) from mainSheet
    const remindSettingNumber = _mainSheet.getRange(i, 1).getValue();
    if (remindSettingNumber === "") {
      break;
    }
    if (!Number.isInteger(remindSettingNumber)) {
      continue;
    }
    // get months(column number === 2) from mainSheet
    const months = calendar.parseMonthsString(
      String(_mainSheet.getRange(i, 2).getValue())
    );
    // get number of business days(column number === 3) from the beginning of the month from mainSheet
    const numOfBizDays = _mainSheet.getRange(i, 3).getValue();
    // get the scheduled message sending time(column number === 4) from mainSheet
    const col4 = _mainSheet.getRange(i, 4).getValue();
    let t = "";
    if (col4 instanceof Date) {
      const hour = ("00" + col4.getHours()).slice(-2);
      const minutes = ("00" + col4.getMinutes()).slice(-2);
      const seconds = ("00" + col4.getSeconds()).slice(-2);
      t = `${hour}:${minutes}:${seconds}`;
    } else {
      t = String(col4);
    }
    console.log(t);
    // get the channel(id or name) to send message(column number === 5) from mainSheet
    const channel = _mainSheet.getRange(i, 5).getValue();
    // get the message(column number === 6) from mainSheet
    const message = _mainSheet.getRange(i, 6).getValue();
    for (let j = 0; j < months.length; j++) {
      if (argDate) {
        if (argDate.getMonth() + 1 === months[j]) {
          const date: Date = calendar.convertBusinessDaysToDate(
            argDate.getFullYear(),
            months[j],
            +numOfBizDays,
            calenderIds
          );
          if (argDate.getDate() !== date.getDate()) {
            continue;
          }
          calendar.updateDateByTimeString(date, t);
          results.push({
            date: date,
            channel: channel,
            message: message,
          });
        }
      } else {
        const date: Date = calendar.convertBusinessDaysToDate(
          now.getFullYear(),
          months[j],
          +numOfBizDays,
          calenderIds
        );
        calendar.updateDateByTimeString(date, t);
        results.push({
          date: date,
          channel: channel,
          message: message,
        });
      }
    }
  }
  return results;
};
