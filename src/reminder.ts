import * as calendar from "./calendar";
import * as slack from "./slack";
import * as chatwork from "./chatwork";
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

/**
 * Send a message to the chat app.
 * @param {sm.ScheduledMessage} message
 * @return {string}
 */
export const sendMessage = (message: sm.ScheduledMessage): string => {
  if (settings.getActiveChatApp() == "slack") {
    const payload: slack.SlackMessageRequest = {
      channel: message.channel,
      text: "",
      icon_emoji: settings.getSlackIconEmoji(),
      username: settings.getBotName(),
    };
    if (message.sentMessageId) {
      payload.thread_ts = message.sentMessageId;
      payload.text = slack.getActualMessage(message.sendTo, message.renotice);
    } else {
      payload.text = slack.getActualMessage(message.sendTo, message.message);
    }
    return slack.postMessage(payload);
  } else if (settings.getActiveChatApp() == "chatwork") {
    if (message.sentMessageId) {
      return chatwork.postMessageInRoom(message.channel, message.renotice);
    } else {
      const taskIds = chatwork.postTaskInRoom(
        message.channel,
        message.message,
        message.sendTo,
        message.datetime / 1000 + message.waitingMinutes * 60
      );
      if (taskIds && taskIds.length > 0) {
        message.taskIds = taskIds.map((taskId) => String(taskId));
        const task = chatwork.getTaskInRoom(
          message.channel,
          String(taskIds[0])
        );
        if (task) {
          return task.message_id;
        }
      }
    }
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
      scheduledMessage.repeatCount++;
      scheduledMessage.sendTo = updatedScheduledMessage.sendTo;
      scheduledMessage.renotice = updatedScheduledMessage.renotice;
      scheduledMessage.notRenoticeTo = updatedScheduledMessage.notRenoticeTo;
      const date = calendar.getNextDate(
        new Date(scheduledMessage.datetime),
        scheduledMessage.waitingMinutes,
        scheduledMessage.exceptHolidays
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
        scheduledMessage.repeatCount++;
        const maxRepeatCount = settings.getMaxRepeatCount();
        if (
          maxRepeatCount > 0 &&
          scheduledMessage.repeatCount > maxRepeatCount
        ) {
          return;
        }
        const date = calendar.getNextDate(
          new Date(scheduledMessage.datetime),
          scheduledMessage.timeInterval,
          scheduledMessage.exceptHolidays
        );
        scheduledMessage.datetime = date.getTime();
        scheduledMessage.timeInterval = calendar.getNextTimeInterval(
          scheduledMessage.timeInterval
        );
        setReminder(scheduledMessage);
      }
    }
  }
};
