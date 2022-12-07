import * as calendar from "./calendar";
import * as sm from "./scheduled_message";
import * as reminder from "./reminder";

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
  const scheduledMessages = sm.getScheduledMessagesFromSpreadSheet(tomorrow);
  for (const scheduledMessage of scheduledMessages) {
    if (tomorrow.getFullYear() !== scheduledMessage.date.getFullYear()) {
      console.log(
        `${tomorrow.getFullYear()} !== ${scheduledMessage.date.getFullYear()}`
      );
      continue;
    }
    if (tomorrow.getMonth() !== scheduledMessage.date.getMonth()) {
      console.log(
        `${tomorrow.getMonth()} !== ${scheduledMessage.date.getMonth()}`
      );
      continue;
    }
    if (tomorrow.getDate() !== scheduledMessage.date.getDate()) {
      console.log(
        `${tomorrow.getDate()} !== ${scheduledMessage.date.getDate()}`
      );
      continue;
    }
    reminder.setReminder(scheduledMessage);
  }
};
