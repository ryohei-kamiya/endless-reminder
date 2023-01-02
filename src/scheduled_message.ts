import * as sheets from "./sheets";
import * as calendar from "./calendar";
import * as slack from "./slack";
import * as settings from "./settings";
import * as utils from "./utils";
import { TableData } from "./table_data";

export type ScheduledMessageRecord = {
  id: number;
  years: number[];
  months: number[];
  days: number;
  exceptHolidays: boolean;
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
  // get days from mainSheet
  const days = Number(tableData.getValue(row, col++));
  // get exceptHolidays from mainSheet(days are interpreted as number of business days from the beginning of the month if exceptHolidays is true)
  const exceptHolidays = Boolean(tableData.getValue(row, col++));
  // get the scheduled message sending time from mainSheet
  const hms = utils.convertTimeToString(tableData.getValue(row, col++));
  // get the channel(id or name) to send message from mainSheet
  const channel = String(tableData.getValue(row, col++));
  // get the receivers from mainSheet
  const sendToStr = String(tableData.getValue(row, col++));
  const sendTo = convertReceiverStringToArray(sendToStr);
  // get the message from mainSheet
  const message = String(tableData.getValue(row, col++));
  // get the re-notice message from mainSheet
  const renotice = String(tableData.getValue(row, col++));
  // get the excepted receivers from mainSheet
  const notRenoticeToStr = String(tableData.getValue(row, col++));
  const notRenoticeTo = convertReceiverStringToArray(notRenoticeToStr);
  // get the disabled flag from mainSheet
  const disabled = Boolean(tableData.getValue(row, col++));
  return {
    id: scheduledMessageId,
    years: years,
    months: months,
    days: days,
    exceptHolidays: exceptHolidays,
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
  timeInterval: number;
  exceptHolidays: boolean;
  channel: string;
  sendTo: string[];
  message: string;
  renotice: string;
  notRenoticeTo: string[];
  disabled: boolean;
  repeatCount: number;
  sentMessageId: string | null;
};

/**
 * Convert the string representation of recerivers to array.
 * @param {string} sendToStr - string representation of recerivers
 * @return {string[]}
 */
export const convertReceiverStringToArray = (sendToStr: string): string[] => {
  const sendTo = [];
  if (sendToStr) {
    sendToStr = sendToStr.replace(/[, ]+/g, " ").trim();
    const members = sendToStr.split(" ").map((member) => member.trim());
    for (const member of members) {
      sendTo.push(member);
    }
  }
  return sendTo;
};

/**
 * Convert a ScheduledMessageRecord to the array of ScheduledMessage
 * @param {ScheduledMessageRecord} record
 * @param {string[]} calendarIds
 * @return {ScheduledMessage[]}
 */
export const convertRecordToMessages = (
  record: ScheduledMessageRecord,
  calendarIds: string[],
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
      let date: Date = new Date(
        record.years[j],
        record.months[k] - 1,
        record.days
      );
      if (record.exceptHolidays) {
        date = calendar.convertBusinessDaysToDate(
          record.years[j],
          record.months[k],
          record.days,
          calendarIds
        );
      }
      if (filterByDate !== undefined) {
        if (!filterByDate(date.getDate())) {
          continue;
        }
      }
      calendar.updateDateByTimeString(date, record.hms);
      results.push({
        id: record.id,
        datetime: date.getTime(),
        timeInterval: settings.getTimeInterval(),
        exceptHolidays: record.exceptHolidays,
        channel: record.channel,
        sendTo: record.sendTo,
        message: record.message,
        renotice: record.renotice,
        notRenoticeTo: record.notRenoticeTo,
        disabled: record.disabled,
        repeatCount: 0,
        sentMessageId: null,
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
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const tableData = sheets.getTableData(_mainSheet);
  const slackChannels: slack.Channel[] =
    settings.getActiveChatApp() == "slack" ? slack.getChannels() : [];
  for (let row = 1; row < tableData.getRows(); row++) {
    const record = getScheduledMessageRecord(tableData, row);
    if (!Number.isInteger(record.id)) {
      continue;
    }
    if (record.id < 1) {
      continue;
    }
    if (argDate) {
      if (settings.getActiveChatApp() == "slack") {
        record.channel = slack.convertChannelNameToId(
          record.channel,
          slackChannels
        );
      }
      const messages: ScheduledMessage[] = convertRecordToMessages(
        record,
        calendarIds,
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
      if (settings.getActiveChatApp() == "slack") {
        record.channel = slack.convertChannelNameToId(
          record.channel,
          slackChannels
        );
      }
      const messages: ScheduledMessage[] = convertRecordToMessages(
        record,
        calendarIds
      );
      results = results.concat(messages);
    }
  }
  return results;
};

/**
 * Get array of the completion keyword
 * @return {string[]}
 */
export const getCompletionKeywords = (): string[] => {
  const results: string[] = [];
  const completionKeywordsSheet = sheets.completionKeywordsSheet();
  if (!completionKeywordsSheet) {
    throw Error(
      `The value of completionKeywordsSheet is null but it should not be.`
    );
  }
  const tableData = sheets.getTableData(completionKeywordsSheet);
  for (let row = 1; row < tableData.getRows(); row++) {
    const keyword = tableData.getValue(row, 0);
    results.push(keyword);
  }
  return results;
};

/**
 * Get memberIds on the channel
 * @param {string} channel -
 * @return {string[]}
 */
export const getMemberIdsOnChannel = (channel: string): string[] => {
  if (settings.getActiveChatApp() == "slack") {
    // get memberIds on this channel
    return slack.getMemberIdsOnSlackChannel(channel);
  }
  return [];
};

/**
 * Get actual menberIds of notRenoticeTo
 * @param {ScheduledMessage} message - a scheduled message
 * @param {string[]} allMemberIds
 * @return {string[]}
 */
export const getActualNotRenoticeTo = (
  message: ScheduledMessage,
  allMemberIds: string[]
): string[] => {
  let result: string[] = [];
  if (settings.getActiveChatApp() == "slack") {
    if (
      message.notRenoticeTo.some(
        (memberId) => memberId == "channel" || memberId == "here"
      )
    ) {
      result = allMemberIds;
    } else {
      const notFoundMemberIds: string[] = [];
      for (const memberId of message.notRenoticeTo) {
        if (allMemberIds.includes(memberId)) {
          result.push(memberId);
        } else {
          notFoundMemberIds.push(memberId.replace(/^subteam\^/, ""));
        }
      }
      if (notFoundMemberIds.length > 0) {
        const userGroups = slack.getUserGroups();
        for (const memberId of slack.getMemberIdsInUserGroups(
          notFoundMemberIds,
          userGroups
        )) {
          result.push(memberId);
        }
      }
    }
  }
  return result;
};

/**
 * Get actual menberIds of sendTo
 * @param {ScheduledMessage} message - a scheduled message
 * @param {string[]} allMemberIds
 * @return {string[]}
 */
export const getActualSendTo = (
  message: ScheduledMessage,
  allMemberIds: string[]
): string[] => {
  let result: string[] = [];
  if (settings.getActiveChatApp() == "slack") {
    if (
      message.sendTo.some(
        (memberId) => memberId == "channel" || memberId == "here"
      )
    ) {
      const sendTo = allMemberIds.filter(
        (memberId) =>
          !slack.isBot(memberId) && !message.notRenoticeTo.includes(memberId)
      );
      result = sendTo;
    } else {
      const sendTo = [];
      const notFoundMemberIds: string[] = [];
      for (const memberId of message.sendTo) {
        if (allMemberIds.includes(memberId)) {
          if (!message.notRenoticeTo.includes(memberId)) {
            sendTo.push(memberId);
          }
        } else {
          notFoundMemberIds.push(memberId.replace(/^subteam\^/, ""));
        }
      }
      if (notFoundMemberIds.length > 0) {
        const userGroups = slack.getUserGroups();
        for (const memberId of slack.getMemberIdsInUserGroups(
          notFoundMemberIds,
          userGroups
        )) {
          if (!message.notRenoticeTo.includes(memberId)) {
            sendTo.push(memberId);
          }
        }
      }
      result = sendTo;
    }
    if (message.sentMessageId) {
      const sendTo = [];
      const completionKeywords = getCompletionKeywords();
      const replies = slack.getRepliesFromSlackThread(
        message.channel,
        message.sentMessageId
      );
      for (const memberId of result) {
        if (
          !slack.isMemberInCompletionMessageSenders(
            memberId,
            replies,
            completionKeywords
          )
        ) {
          sendTo.push(memberId);
        }
      }
      result = sendTo;
    }
  }
  return result;
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
    timeInterval: message.timeInterval,
    exceptHolidays: message.exceptHolidays,
    channel: message.channel,
    sendTo: message.sendTo,
    message: message.message,
    renotice: message.renotice,
    notRenoticeTo: message.notRenoticeTo,
    disabled: message.disabled,
    repeatCount: message.repeatCount,
    sentMessageId: message.sentMessageId,
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
    const channelMemberIds = getMemberIdsOnChannel(result.channel);
    result.message = record.message;
    result.renotice = record.renotice;
    result.notRenoticeTo = record.notRenoticeTo;
    result.notRenoticeTo = getActualNotRenoticeTo(result, channelMemberIds);
    result.sendTo = getActualSendTo(result, channelMemberIds);
    result.disabled = record.disabled;
    break;
  }
  return result;
};
