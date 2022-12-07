import * as sheets from "./sheets";
import * as calendar from "./calendar";
import * as slack from "./slack";

export type ScheduledMessage = {
  datetime: number;
  channel: string;
  sendTo: string[];
  message: string;
  renotice: string;
  threadTs: string | null;
};

/**
 * Convert the string representation of recerivers to array.
 * @param {string} sendToStr - string representation of recerivers
 * @return {string[]}
 */
export const convertReceiverStringToArray = (sendToStr: string): string[] => {
  const sendTo = [];
  if (sendToStr) {
    sendToStr = sendToStr.replace(/[\!@,<> ]+/g, " ").trim();
    const members = sendToStr.split(" ").map((member) => member.trim());
    for (let member of members) {
      sendTo.push(member);
    }
  }
  return sendTo;
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
  const channels: slack.Channel[] = slack.getChannels();
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
    // get the channel(id or name) to send message(column number === 5) from mainSheet
    const channel = _mainSheet.getRange(i, 5).getValue();
    // get the receivers(column number === 6) from mainSheet
    let sendToStr = String(_mainSheet.getRange(i, 6).getValue());
    const sendTo = convertReceiverStringToArray(sendToStr);
    // get the message(column number === 7) from mainSheet
    const message = _mainSheet.getRange(i, 7).getValue();
    // get the re-notice message(column number === 8) from mainSheet
    const renotice = _mainSheet.getRange(i, 8).getValue();
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
            datetime: date.getTime(),
            channel: slack.convertChannelNameToId(channel, channels),
            sendTo: sendTo,
            message: message,
            renotice: renotice,
            threadTs: null,
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
          datetime: date.getTime(),
          channel: slack.convertChannelNameToId(channel, channels),
          sendTo: sendTo,
          message: message,
          renotice: renotice,
          threadTs: null,
        });
      }
    }
  }
  return results;
};
