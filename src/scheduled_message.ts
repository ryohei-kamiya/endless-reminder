import * as sheets from "./sheets";
import * as calendar from "./calendar";
import * as slack from "./slack";
import { TableData } from "./table_data";

export type ScheduledMessageRecord = {
  id: number;
  years: number[];
  months: number[];
  numOfBizDays: number;
  hms: string;
  channel: string;
  sendTo: string[];
  message: string;
  renotice: string;
  notRenoticeTo: string[];
  disabled: boolean;
};

/**
 * Get scheduled message record from tableData
 * @param {TableData} tableData
 * @param {number} row
 * @return {ScheduledMessageRecord}
 */
export const getScheduledMessageRecord = (
  tableData: TableData,
  row: number
): ScheduledMessageRecord => {
  let col = 0;
  // get a scheduled message id from mainSheet
  const scheduledMessageId = Number(tableData.getValue(row, col++));
  // get years from mainSheet
  const years = calendar.parseYearsString(tableData.getValue(row, col++));
  // get months from mainSheet
  const months = calendar.parseMonthsString(tableData.getValue(row, col++));
  // get number of business days from the beginning of the month from mainSheet
  const numOfBizDays = Number(tableData.getValue(row, col++));
  // get the scheduled message sending time from mainSheet
  const time = tableData.getValue(row, col++);
  let hms = "";
  if (time instanceof Date) {
    const hour = ("00" + time.getHours()).slice(-2);
    const minutes = ("00" + time.getMinutes()).slice(-2);
    const seconds = ("00" + time.getSeconds()).slice(-2);
    hms = `${hour}:${minutes}:${seconds}`;
  } else {
    hms = String(time);
  }
  // get the channel(id or name) to send message from mainSheet
  const channel = String(tableData.getValue(row, col++));
  // get the receivers from mainSheet
  let sendToStr = String(tableData.getValue(row, col++));
  const sendTo = convertReceiverStringToArray(sendToStr);
  // get the message from mainSheet
  const message = String(tableData.getValue(row, col++));
  // get the re-notice message from mainSheet
  const renotice = String(tableData.getValue(row, col++));
  // get the excepted receivers from mainSheet
  let notRenoticeToStr = String(tableData.getValue(row, col++));
  const notRenoticeTo = convertReceiverStringToArray(notRenoticeToStr);
  // get the disabled flag from mainSheet
  const disabled = Boolean(tableData.getValue(row, col++));
  return {
    id: scheduledMessageId,
    years: years,
    months: months,
    numOfBizDays: numOfBizDays,
    hms: hms,
    channel: channel,
    sendTo: sendTo,
    message: message,
    renotice: renotice,
    notRenoticeTo: notRenoticeTo,
    disabled: disabled,
  };
};

export type ScheduledMessage = {
  id: number;
  datetime: number;
  channel: string;
  sendTo: string[];
  message: string;
  renotice: string;
  notRenoticeTo: string[];
  disabled: boolean;
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
 * Convert a ScheduledMessageRecord to the array of ScheduledMessage
 * @param {ScheduledMessageRecord} record
 * @param {string[]} calendarIds
 * @param {slack.Channel[]} channels
 * @return {ScheduledMessage[]}
 */
export const convertRecordToMessages = (
  record: ScheduledMessageRecord,
  calendarIds: string[],
  channels: slack.Channel[],
  filterByYear: ((year: number) => boolean) | undefined = undefined,
  filterByMonth: ((month: number) => boolean) | undefined = undefined,
  filterByDate: ((date: number) => boolean) | undefined = undefined
): ScheduledMessage[] => {
  const results: ScheduledMessage[] = [];
  for (let j = 0; j < record.years.length; j++) {
    if (filterByYear !== undefined) {
      if (!filterByYear(record.years[j])) {
        continue;
      }
    }
    for (let k = 0; k < record.months.length; k++) {
      if (filterByMonth !== undefined) {
        if (!filterByMonth(record.months[k])) {
          continue;
        }
      }
      const date: Date = calendar.convertBusinessDaysToDate(
        record.years[j],
        record.months[k],
        record.numOfBizDays,
        calendarIds
      );
      if (filterByDate !== undefined) {
        if (!filterByDate(date.getDate())) {
          continue;
        }
      }
      calendar.updateDateByTimeString(date, record.hms);
      results.push({
        id: record.id,
        datetime: date.getTime(),
        channel: slack.convertChannelNameToId(record.channel, channels),
        sendTo: record.sendTo,
        message: record.message,
        renotice: record.renotice,
        notRenoticeTo: record.notRenoticeTo,
        disabled: record.disabled,
        threadTs: null,
      });
    }
  }
  return results;
};

/**
 * Get scheduled messages from SpreadSheet
 * @param {Date} argDate - specified date
 * @returns {ScheduledMessage[]} - Scheduled messages
 */
export const getScheduledMessages = (
  argDate: Date | undefined = undefined
): ScheduledMessage[] => {
  let results: ScheduledMessage[] = [];
  const calendarIds = calendar.getCalendarIds();
  const channels: slack.Channel[] = slack.getChannels();
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const tableData = sheets.getTableData(_mainSheet);
  for (let row = 1; row < tableData.getRows(); row++) {
    const record = getScheduledMessageRecord(tableData, row);
    if (!Number.isInteger(record.id)) {
      continue;
    }
    if (record.id < 1) {
      continue;
    }
    if (argDate) {
      const messages: ScheduledMessage[] = convertRecordToMessages(
        record,
        calendarIds,
        channels,
        (year: number): boolean => {
          return argDate.getFullYear() === year;
        },
        (month: number): boolean => {
          return argDate.getMonth() + 1 === month;
        },
        (date: number): boolean => {
          return argDate.getDate() === date;
        }
      );
      results = results.concat(messages);
    } else {
      const messages: ScheduledMessage[] = convertRecordToMessages(
        record,
        calendarIds,
        channels
      );
      results = results.concat(messages);
    }
  }
  return results;
};

/**
 * Update a scheduled message
 * @param {ScheduledMessage} message - a scheduled message
 * @returns {ScheduledMessage} - an updated scheduled message
 */
export const updateScheduledMessage = (
  message: ScheduledMessage
): ScheduledMessage => {
  const result: ScheduledMessage = {
    id: message.id,
    datetime: message.datetime,
    channel: message.channel,
    sendTo: message.sendTo,
    message: message.message,
    renotice: message.renotice,
    notRenoticeTo: message.notRenoticeTo,
    disabled: message.disabled,
    threadTs: message.threadTs,
  };
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const tableData = sheets.getTableData(_mainSheet);
  for (let row = 1; row < tableData.getRows(); row++) {
    const record = getScheduledMessageRecord(tableData, row);
    if (!Number.isInteger(record.id)) {
      continue;
    }
    if (record.id < 1) {
      continue;
    }
    if (message.id !== record.id) {
      continue;
    }
    result.channel = record.channel;
    result.sendTo = record.sendTo;
    result.message = record.message;
    result.renotice = record.renotice;
    result.notRenoticeTo = record.notRenoticeTo;
    result.disabled = record.disabled;
    break;
  }
  return result;
};
