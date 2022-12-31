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
  const triggerDate = new Date(scheduledMessage.datetime);
  const now = new Date();
  if (triggerDate < now) {
    return;
  }
  const trigger: GoogleAppsScript.Script.Trigger = ScriptApp.newTrigger(
    "remind"
  )
    .timeBased()
    .at(triggerDate)
    .create();
  triggerManager.setTriggerArguments(trigger, scheduledMessage, false);
};

/**
 * Send a message to the chat app.
 * @param {sm.ScheduledMessage} message
 * @return {string}
 */
export const sendMessage = (message: sm.ScheduledMessage): string => {
  if (settings.getActiveChatApp() === "slack") {
    const payload: slack.SlackMessageRequest = {
      channel: message.channel,
      text: slack.getActualMessageToSlack(message.sendTo, message.message),
      icon_emoji: settings.getSlackIconEmoji(),
      username: settings.getBotName(),
    };
    if (message.sentMessageId) {
      payload.thread_ts = message.sentMessageId;
      payload.text = message.renotice;
    }
    return slack.sendMessageToSlack(payload);
  }
  return "";
};

global.remind = (event: any) => {
  const scheduledMessage: sm.ScheduledMessage = triggerManager.handleTriggered(
    event.triggerUid
  );
  if (scheduledMessage.sentMessageId === null) {
    if (scheduledMessage.disabled) {
      return;
    }
    scheduledMessage.sentMessageId = sendMessage(scheduledMessage);
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
        sendMessage(scheduledMessage);
        const date = calendar.getNextWorkingDay(
          new Date(scheduledMessage.datetime)
        );
        scheduledMessage.datetime = date.getTime();
        setReminder(scheduledMessage);
      }
    }
  }
};
