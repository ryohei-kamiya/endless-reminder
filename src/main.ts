import * as calendar from "./calendar";
import * as sm from "./scheduled_message";
import * as reminder from "./reminder";

declare let global: any;

/**
 * Entry point function
 */
global.main = (): void => {
  const now = new Date();
  const tomorrow = calendar.getTomorrow(now);
  const scheduledMessages = sm.getScheduledMessages(tomorrow);
  for (const scheduledMessage of scheduledMessages) {
    const date = new Date(scheduledMessage.datetime);
    if (tomorrow.getFullYear() !== date.getFullYear()) {
      console.log(`${tomorrow.getFullYear()} !== ${date.getFullYear()}`);
      continue;
    }
    if (tomorrow.getMonth() !== date.getMonth()) {
      console.log(`${tomorrow.getMonth()} !== ${date.getMonth()}`);
      continue;
    }
    if (tomorrow.getDate() !== date.getDate()) {
      console.log(`${tomorrow.getDate()} !== ${date.getDate()}`);
      continue;
    }
    if (date < now) {
      console.log(`${date.toISOString()} < ${now.toISOString()}`);
      continue;
    }
    if (!scheduledMessage.disabled) {
      const triggerDate = calendar.getNextDate(
        new Date(scheduledMessage.datetime),
        0,
        scheduledMessage.exceptHolidays
      );
      scheduledMessage.datetime = triggerDate.getTime();
      reminder.setReminder(scheduledMessage);
    }
  }
};
