import * as slack from "./slack";
import * as calendar from "./calendar";
import * as scheduledMessage from "./scheduled_message";

declare let global: any;

/**
 * Entry point function
 */
global.main = (): void => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  if (calendar.isHoliday(tomorrow)) {
    console.log("tomorrow is a holiday.");
    return;
  }
  const _scheduledMessages =
    scheduledMessage.getScheduledMessagesFromSpreadSheet(tomorrow);
  for (const _scheduledMessage of _scheduledMessages) {
    if (tomorrow.getFullYear() !== _scheduledMessage.date.getFullYear()) {
      console.log(
        `${tomorrow.getFullYear()} !== ${_scheduledMessage.date.getFullYear()}`
      );
      continue;
    }
    if (tomorrow.getMonth() !== _scheduledMessage.date.getMonth()) {
      console.log(
        `${tomorrow.getMonth()} !== ${_scheduledMessage.date.getMonth()}`
      );
      continue;
    }
    if (tomorrow.getDate() !== _scheduledMessage.date.getDate()) {
      console.log(
        `${tomorrow.getDate()} !== ${_scheduledMessage.date.getDate()}`
      );
      continue;
    }
    const payload = {
      channel: _scheduledMessage.channel,
      text: _scheduledMessage.message,
      icon_emoji: ":spiral_calendar_pad:",
      username: "reminder",
    };
    // Set the trigger the day before.
    slack.setTriggerOfSendMessageToSlack(_scheduledMessage.date, payload);
  }
};
