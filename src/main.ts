import { sheets } from "./sheets";
import { triggerManager } from "./trigger-manager";

/**
 * Entry point function
 */
function main() {
  var today = new Date();
  if (!isHoliday(today)) {
    var todayBizDay = countBusinessDays(today);

    const prop = PropertiesService.getScriptProperties();
    const slackAppToken = prop.getProperty("slackAppToken");

    var mainSheet = sheets.mainSheet();
    var lastRow = mainSheet.getLastRow();
    for (var i = 1; i <= lastRow; i++) {
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
              text: escapeMessage(message),
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
}

/**
 * Get the number of business days from the beginning of the month to the specified date.
 *
 * @param {Date} argDate - specified date
 * @return {number}
 */
function countBusinessDays(argDate: Date): number {
  let results: number = 0;
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
}

/**
 * Is the specified date a holiday?(exist in holiday calendars?)
 * @param {Date} argDate - specified date
 * @return {boolean}
 */
function isHoliday(argDate: Date): boolean {
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
}

/**
 * This function is called by trigger for sending message to slack.
 *
 * @param {*} event
 */
function sendMessageToSlack(event: any) {
  var payload = triggerManager.handleTriggered(event.triggerUid);
  let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    payload: payload,
  };
  var url = "https://slack.com/api/chat.postMessage";
  UrlFetchApp.fetch(url, options);
}

/**
 * Set a trigger of sendMessageToSlack()
 * @param {Date} triggeredDate - Triggered date
 * @param {*} payload - Payload of the sending message
 */
function setTriggerOfSendMessageToSlack(triggeredDate: Date, payload: any) {
  const trigger: GoogleAppsScript.Script.Trigger = ScriptApp.newTrigger(
    "sendMessageToSlack"
  )
    .timeBased()
    .at(triggeredDate)
    .create();
  triggerManager.setTriggerArguments(trigger, payload, false);
}

/**
 * Escape line break codes and tab in message.
 * @param {string} message
 * @return {string}
 */
function escapeMessage(message: string): string {
  let result = message.replace(/(\r\n|\n|\r)/gm, "\\n");
  return result.replace(/\t/g, "\\t");
}
