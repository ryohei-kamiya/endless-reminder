import * as calendar from "./calendar";
import * as slack from "./slack";
import * as sm from "./scheduled_message";
import * as triggerManager from "./trigger_manager";
import * as settings from "./settings";

declare let global: any;

/**
 * Set a reminder
 * @param {ScheduledMessage} scheduledMessage
 */
export const setReminder = (scheduledMessage: sm.ScheduledMessage) => {
  const trigger: GoogleAppsScript.Script.Trigger = ScriptApp.newTrigger(
    "remind"
  )
    .timeBased()
    .at(new Date(scheduledMessage.datetime))
    .create();
  triggerManager.setTriggerArguments(trigger, scheduledMessage, false);
};

global.remind = (event: any) => {
  const scheduledMessage: sm.ScheduledMessage = triggerManager.handleTriggered(
    event.triggerUid
  );
  if (scheduledMessage.sentMessageId === null) {
    if (scheduledMessage.disabled) {
      return;
    }
    if (settings.getActiveChatApp() === "slack") {
      const payload = {
        channel: scheduledMessage.channel,
        text: slack.getActualMessageToSlack(
          scheduledMessage.sendTo,
          scheduledMessage.message
        ),
        icon_emoji: settings.getSlackIconEmoji(),
        username: settings.getBotName(),
      };
      scheduledMessage.sentMessageId = slack.sendMessageToSlack(payload);
    }
    const updatedScheduledMessage = sm.updateScheduledMessage(scheduledMessage);
    if (!updatedScheduledMessage.disabled && updatedScheduledMessage.renotice) {
      scheduledMessage.sendTo = updatedScheduledMessage.sendTo;
      scheduledMessage.renotice = updatedScheduledMessage.renotice;
      scheduledMessage.notRenoticeTo = updatedScheduledMessage.notRenoticeTo;
      const date = calendar.getNextWorkingDay(
        new Date(scheduledMessage.datetime)
      );
      scheduledMessage.datetime = date.getTime();
      setReminder(scheduledMessage);
    }
  } else {
    const updatedScheduledMessage = sm.updateScheduledMessage(scheduledMessage);
    if (!updatedScheduledMessage.disabled && updatedScheduledMessage.renotice) {
      scheduledMessage.sendTo = updatedScheduledMessage.sendTo;
      scheduledMessage.renotice = updatedScheduledMessage.renotice;
      scheduledMessage.notRenoticeTo = updatedScheduledMessage.notRenoticeTo;
      if (scheduledMessage.sendTo.length > 0) {
        if (settings.getActiveChatApp() === "slack") {
          const payload = {
            channel: scheduledMessage.channel,
            thread_ts: scheduledMessage.sentMessageId,
            text: slack.getActualMessageToSlack(
              scheduledMessage.sendTo,
              scheduledMessage.renotice
            ),
            icon_emoji: settings.getSlackIconEmoji(),
            username: settings.getBotName(),
          };
          slack.sendMessageToSlack(payload);
        }
        const date = calendar.getNextWorkingDay(
          new Date(scheduledMessage.datetime)
        );
        scheduledMessage.datetime = date.getTime();
        setReminder(scheduledMessage);
      }
    }
  }
};
