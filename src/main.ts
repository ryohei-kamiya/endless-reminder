import * as sheets from "./sheets";
import * as triggerManager from "./trigger-manager";

declare let global: any;

/**
 * Entry point function
 */
global.main = (): void => {
  const today = new Date();
  if (!isHoliday(today)) {
    const todayBizDay = countBusinessDays(today);

    const prop = PropertiesService.getScriptProperties();
    const slackAppToken = prop.getProperty("slackAppToken");

    const mainSheet = sheets.mainSheet();
    if (!mainSheet) {
      throw Error(`The value of mainSheet is null but it should not be.`);
    }

    const lastRow = mainSheet.getLastRow();
    for (let i = 1; i <= lastRow; i++) {
      // get remindSettingNumber(column number === 1) from mainSheet
      const remindSettingNumber = mainSheet.getRange(i, 1).getValue();
      if (remindSettingNumber === "") {
        break;
      }
      if (!Number.isInteger(remindSettingNumber)) {
        continue;
      }
      // get months(column number === 2) from mainSheet
      const months = String(mainSheet.getRange(i, 2).getValue()).split(",");
      // get number of business days(column number === 3) from the beginning of the month from mainSheet
      const bizDate = mainSheet.getRange(i, 3).getValue();
      // get the scheduled message sending time(column number === 4) from mainSheet
      const t = mainSheet.getRange(i, 4).getValue();
      // get the channel(id or name) to send message(column number === 5) from mainSheet
      const channel = mainSheet.getRange(i, 5).getValue();
      // get the message(column number === 6) from mainSheet
      const message = mainSheet.getRange(i, 6).getValue();

      for (let j = 0; j < months.length; j++) {
        if (months[j] === `${today.getMonth() + 1}` || months[j] == "*") {
          if (bizDate == todayBizDay) {
            const triggerDate = new Date();
            const sendTime = new Date(t);
            triggerDate.setHours(sendTime.getHours());
            triggerDate.setMinutes(sendTime.getMinutes());

            const payload = {
              token: slackAppToken,
              channel: channel,
              text: message,
              icon_emoji: ":spiral_calendar_pad:",
              username: "reminder",
            };
            setTriggerOfSendMessageToSlack(triggerDate, payload);
            break;
          }
        }
      }
    }
  }
};

/**
 * Get the number of business days from the beginning of the month to the specified date.
 *
 * @param {Date} argDate - specified date
 * @return {number}
 */
export const countBusinessDays = (argDate: Date): number => {
  let results = 0;
  let totalDays: number = argDate.getDate();
  const date = new Date(argDate);
  while (totalDays > 0) {
    date.setDate(totalDays);
    if (!isHoliday(date)) {
      results++;
    }
    totalDays--;
  }
  return results;
};

/**
 * Is the specified date a holiday?(exist in holiday calendars?)
 * @param {Date} argDate - specified date
 * @return {boolean}
 */
export const isHoliday = (argDate: Date): boolean => {
  let result = false;

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

  const holidayCalendarsSheet = sheets.holidayCalendarsSheet();
  if (!holidayCalendarsSheet) {
    throw Error(
      `The value of holidayCalendarsSheet is null but it should not be.`
    );
  }

  const lastRow = holidayCalendarsSheet.getLastRow();
  for (let i = 1; i <= lastRow; i++) {
    const id = holidayCalendarsSheet.getRange(i, 1).getValue();
    if (id === "calendar id") {
      continue;
    }
    const cal = CalendarApp.getCalendarById(id);
    if (!cal) {
      continue;
    }
    const holidays = cal.getEvents(startDate, endDate);
    if (holidays.length > 0) {
      result = true;
      break;
    }
  }
  return result;
};

/**
 * This function is called by trigger for sending message to slack.
 *
 * @param {*} event
 */
export const sendMessageToSlack = (event: any): void => {
  console.log("[sendMessageToSlack]: called", event);
  if (event) {
    const payload = triggerManager.handleTriggered(event.triggerUid);
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "post",
      payload: payload,
    };
    const url = "https://slack.com/api/chat.postMessage";
    UrlFetchApp.fetch(url, options);
  }
};

/**
 * Set a trigger of sendMessageToSlack()
 * @param {Date} triggeredDate - Triggered date
 * @param {*} payload - Payload of the sending message
 */
export const setTriggerOfSendMessageToSlack = (
  triggeredDate: Date,
  payload: any
) => {
  const trigger: GoogleAppsScript.Script.Trigger = ScriptApp.newTrigger(
    "sendMessageToSlack"
  )
    .timeBased()
    .at(triggeredDate)
    .create();
  triggerManager.setTriggerArguments(trigger, payload, false);
};
