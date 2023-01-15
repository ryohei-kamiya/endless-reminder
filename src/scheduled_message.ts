import * as sheets from "./sheets";
import * as calendar from "./calendar";
import * as slack from "./slack";
import * as chatwork from "./chatwork";
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
  waitingMinutes: number;
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
  const days = utils.getSafeNumber(tableData.getValue(row, col++), 1, 31, 1);
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
  // get the waitingMinutes from mainSheet
  const waitingMinutes = utils.getSafeNumber(
    tableData.getValue(row, col++),
    1,
    525960,
    1
  );
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
    waitingMinutes: waitingMinutes,
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
  waitingMinutes: number;
  renotice: string;
  notRenoticeTo: string[];
  disabled: boolean;
  repeatCount: number;
  sentMessageId: string | null;
  taskIds: string[] | null;
};

/**
 * Convert the string representation of recerivers to array.
 * @param {string} sendToStr - string representation of recerivers
 * @return {string[]}
 */
export const convertReceiverStringToArray = (sendToStr: string): string[] => {
  const sendTo = [];
  if (sendToStr) {
    const members = sendToStr.split(",").map((member) => member.trim());
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
        waitingMinutes: record.waitingMinutes,
        renotice: record.renotice,
        notRenoticeTo: record.notRenoticeTo,
        disabled: record.disabled,
        repeatCount: 0,
        sentMessageId: null,
        taskIds: null,
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
  if (settings.getActiveChatApp() == "slack") {
    const slackChannels: slack.Channel[] = slack.getChannels();
    for (let row = 1; row < tableData.getRows(); row++) {
      const record = getScheduledMessageRecord(tableData, row);
      if (!Number.isInteger(record.id)) {
        continue;
      }
      if (record.id < 1) {
        continue;
      }
      if (record.disabled) {
        continue;
      }
      if (argDate) {
        record.channel = slack.convertChannelNameToId(
          record.channel,
          slackChannels
        );
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
        record.channel = slack.convertChannelNameToId(
          record.channel,
          slackChannels
        );
        const messages: ScheduledMessage[] = convertRecordToMessages(
          record,
          calendarIds
        );
        results = results.concat(messages);
      }
    }
  } else if (settings.getActiveChatApp() == "chatwork") {
    const rooms: chatwork.Room[] = chatwork.getRooms();
    const me: chatwork.Me = chatwork.getMe();
    for (let row = 1; row < tableData.getRows(); row++) {
      const record = getScheduledMessageRecord(tableData, row);
      if (!Number.isInteger(record.id)) {
        continue;
      }
      if (record.id < 1) {
        continue;
      }
      if (record.disabled) {
        continue;
      }
      if (argDate) {
        record.channel = chatwork.convertRoomNameToId(record.channel, rooms);
        const members: chatwork.Member[] = chatwork.getMembersInRoom(
          record.channel
        );
        record.notRenoticeTo = chatwork.getActualNotRenoticeTo(
          record.notRenoticeTo,
          members
        );
        record.notRenoticeTo = utils.mergeArrays(
          record.notRenoticeTo,
          [String(me.account_id)],
          true
        );
        record.sendTo = chatwork.getActualSendTo(
          record.sendTo,
          record.notRenoticeTo,
          members
        );
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
        record.channel = chatwork.convertRoomNameToId(record.channel, rooms);
        const members: chatwork.Member[] = chatwork.getMembersInRoom(
          record.channel
        );
        record.notRenoticeTo = chatwork.getActualNotRenoticeTo(
          record.notRenoticeTo,
          members
        );
        record.notRenoticeTo = utils.mergeArrays(
          record.notRenoticeTo,
          [String(me.account_id)],
          true
        );
        record.sendTo = chatwork.getActualSendTo(
          record.sendTo,
          record.notRenoticeTo,
          members
        );
        const messages: ScheduledMessage[] = convertRecordToMessages(
          record,
          calendarIds
        );
        results = results.concat(messages);
      }
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
    waitingMinutes: message.waitingMinutes,
    renotice: message.renotice,
    notRenoticeTo: message.notRenoticeTo,
    disabled: message.disabled,
    repeatCount: message.repeatCount,
    sentMessageId: message.sentMessageId,
    taskIds: message.taskIds,
  };
  const _mainSheet = sheets.mainSheet();
  if (!_mainSheet) {
    throw Error(`The value of mainSheet is null but it should not be.`);
  }
  const tableData = sheets.getTableData(_mainSheet);
  const completionKeywords = getCompletionKeywords();
  if (settings.getActiveChatApp() == "slack") {
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
      const channelMemberIds = slack.getMemberIdsOnSlackChannel(result.channel);
      const taskCompletedMemberIds = slack.getTaskCompletedMemberIds(
        result.channel,
        result.sentMessageId,
        completionKeywords
      );
      result.message = record.message;
      result.waitingMinutes = record.waitingMinutes;
      result.renotice = record.renotice;
      result.notRenoticeTo = slack.getActualNotRenoticeTo(
        utils.mergeArrays(result.notRenoticeTo, taskCompletedMemberIds),
        channelMemberIds
      );
      result.sendTo = slack.getActualSendTo(
        result.sendTo,
        result.notRenoticeTo,
        channelMemberIds
      );
      result.disabled = record.disabled;
      break;
    }
  } else if (settings.getActiveChatApp() == "chatwork") {
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
      const roomMembers = chatwork.getMembersInRoom(result.channel);
      const roomTasks = chatwork.getTasksInRoom(result.channel, "open");
      if (roomTasks && Array.isArray(roomTasks) && result.taskIds) {
        result.taskIds = result.taskIds.filter((taskId) => {
          for (const roomTask of roomTasks) {
            if (String(roomTask.task_id) === taskId) {
              return true;
            }
          }
          return false;
        });
        result.sendTo = result.sendTo.filter((memberId) => {
          for (const roomTask of roomTasks) {
            if (String(roomTask.account.account_id) === memberId) {
              return true;
            }
          }
          return false;
        });
      } else {
        result.taskIds = [];
        result.sendTo = [];
      }
      result.message = record.message;
      result.waitingMinutes = record.waitingMinutes;
      result.notRenoticeTo = chatwork.getActualNotRenoticeTo(
        result.notRenoticeTo,
        roomMembers
      );
      result.sendTo = chatwork.getActualSendTo(
        result.sendTo,
        result.notRenoticeTo,
        roomMembers
      );
      let sentMessage = null;
      if (result.sentMessageId) {
        sentMessage = chatwork.getMessageInRoom(
          result.channel,
          result.sentMessageId
        );
      }
      result.renotice = chatwork.getActualMessage(
        result.sendTo,
        record.renotice,
        roomMembers,
        sentMessage
      );
      result.disabled = record.disabled;
      break;
    }
  }
  return result;
};
