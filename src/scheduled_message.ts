import * as sheets from "./sheets";
import * as calendar from "./calendar";
import * as slack from "./slack";

export type ScheduledMessage = {
  id: number;
  datetime: number;
  channel: string;
  sendTo: string[];
  message: string;
  renotice: string;
  notRenoticeTo: string[];
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
export const getScheduledMessages = (
  argDate: Date | undefined = undefined
): ScheduledMessage[] => {
  const results: ScheduledMessage[] = [];
  const calenderIds = calendar.getCalendarIds();
  const channels: slack.Channel[] = slack.getChannels();
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const lastRow = _mainSheet.getLastRow();
  for (let i = 1; i <= lastRow; i++) {
    let cols = 1;
    // get a scheduled message id from mainSheet
    const scheduledMessageId = Number(
      _mainSheet.getRange(i, cols++).getValue()
    );
    if (scheduledMessageId < 1) {
      break;
    }
    if (!Number.isInteger(scheduledMessageId)) {
      continue;
    }
    // get years from mainSheet
    const years = calendar.parseYearsString(
      String(_mainSheet.getRange(i, cols++).getValue())
    );
    // get months from mainSheet
    const months = calendar.parseMonthsString(
      String(_mainSheet.getRange(i, cols++).getValue())
    );
    // get number of business days from the beginning of the month from mainSheet
    const numOfBizDays = _mainSheet.getRange(i, cols++).getValue();
    // get the scheduled message sending time from mainSheet
    const time = _mainSheet.getRange(i, cols++).getValue();
    let t = "";
    if (time instanceof Date) {
      const hour = ("00" + time.getHours()).slice(-2);
      const minutes = ("00" + time.getMinutes()).slice(-2);
      const seconds = ("00" + time.getSeconds()).slice(-2);
      t = `${hour}:${minutes}:${seconds}`;
    } else {
      t = String(time);
    }
    // get the channel(id or name) to send message from mainSheet
    const channel = _mainSheet.getRange(i, cols++).getValue();
    // get the receivers from mainSheet
    let sendToStr = String(_mainSheet.getRange(i, cols++).getValue());
    const sendTo = convertReceiverStringToArray(sendToStr);
    // get the message from mainSheet
    const message = _mainSheet.getRange(i, cols++).getValue();
    // get the re-notice message from mainSheet
    const renotice = _mainSheet.getRange(i, cols++).getValue();
    // get the excepted receivers from mainSheet
    let notRenoticeToStr = String(_mainSheet.getRange(i, cols++).getValue());
    const notRenoticeTo = convertReceiverStringToArray(notRenoticeToStr);
    if (argDate) {
      for (let j = 0; j < years.length; j++) {
        if (argDate.getFullYear() !== years[j]) {
          continue;
        }
        for (let k = 0; k < months.length; k++) {
          if (argDate.getMonth() + 1 !== months[k]) {
            continue;
          }
          const date: Date = calendar.convertBusinessDaysToDate(
            years[j],
            months[k],
            +numOfBizDays,
            calenderIds
          );
          if (argDate.getDate() !== date.getDate()) {
            continue;
          }
          calendar.updateDateByTimeString(date, t);
          results.push({
            id: scheduledMessageId,
            datetime: date.getTime(),
            channel: slack.convertChannelNameToId(channel, channels),
            sendTo: sendTo,
            message: message,
            renotice: renotice,
            notRenoticeTo: notRenoticeTo,
            threadTs: null,
          });
        }
      }
    } else {
      for (let j = 0; j < years.length; j++) {
        for (let k = 0; k < months.length; k++) {
          const date: Date = calendar.convertBusinessDaysToDate(
            years[j],
            months[k],
            +numOfBizDays,
            calenderIds
          );
          calendar.updateDateByTimeString(date, t);
          results.push({
            id: scheduledMessageId,
            datetime: date.getTime(),
            channel: slack.convertChannelNameToId(channel, channels),
            sendTo: sendTo,
            message: message,
            renotice: renotice,
            notRenoticeTo: notRenoticeTo,
            threadTs: null,
          });
        }
      }
    }
  }
  return results;
};

/**
 * Get a scheduled message by id
 * @param {number} id - scheduled message id
 * @returns {ScheduledMessage[]} - Scheduled messages
 */
export const getScheduledMessagesById = (id: number): ScheduledMessage[] => {
  const results: ScheduledMessage[] = [];
  const calenderIds = calendar.getCalendarIds();
  const channels: slack.Channel[] = slack.getChannels();
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const lastRow = _mainSheet.getLastRow();
  for (let i = 1; i <= lastRow; i++) {
    let cols = 1;
    // get a scheduled message id from mainSheet
    const scheduledMessageId = Number(
      _mainSheet.getRange(i, cols++).getValue()
    );
    if (scheduledMessageId < 1) {
      break;
    }
    if (!Number.isInteger(scheduledMessageId)) {
      continue;
    }
    if (id !== scheduledMessageId) {
      continue;
    }
    // get years from mainSheet
    const years = calendar.parseYearsString(
      String(_mainSheet.getRange(i, cols++).getValue())
    );
    // get months from mainSheet
    const months = calendar.parseMonthsString(
      String(_mainSheet.getRange(i, cols++).getValue())
    );
    // get number of business days from the beginning of the month from mainSheet
    const numOfBizDays = _mainSheet.getRange(i, cols++).getValue();
    // get the scheduled message sending time from mainSheet
    const time = _mainSheet.getRange(i, cols++).getValue();
    let t = "";
    if (time instanceof Date) {
      const hour = ("00" + time.getHours()).slice(-2);
      const minutes = ("00" + time.getMinutes()).slice(-2);
      const seconds = ("00" + time.getSeconds()).slice(-2);
      t = `${hour}:${minutes}:${seconds}`;
    } else {
      t = String(time);
    }
    // get the channel(id or name) to send message from mainSheet
    const channel = _mainSheet.getRange(i, cols++).getValue();
    // get the receivers from mainSheet
    let sendToStr = String(_mainSheet.getRange(i, cols++).getValue());
    const sendTo = convertReceiverStringToArray(sendToStr);
    // get the message from mainSheet
    const message = _mainSheet.getRange(i, cols++).getValue();
    // get the re-notice message from mainSheet
    const renotice = _mainSheet.getRange(i, cols++).getValue();
    // get the excepted receivers from mainSheet
    let notRenoticeToStr = String(_mainSheet.getRange(i, cols++).getValue());
    const notRenoticeTo = convertReceiverStringToArray(notRenoticeToStr);
    for (let j = 0; j < years.length; j++) {
      for (let k = 0; k < months.length; k++) {
        const date: Date = calendar.convertBusinessDaysToDate(
          years[j],
          months[k],
          +numOfBizDays,
          calenderIds
        );
        calendar.updateDateByTimeString(date, t);
        results.push({
          id: scheduledMessageId,
          datetime: date.getTime(),
          channel: slack.convertChannelNameToId(channel, channels),
          sendTo: sendTo,
          message: message,
          renotice: renotice,
          notRenoticeTo: notRenoticeTo,
          threadTs: null,
        });
      }
    }
  }
  return results;
};
