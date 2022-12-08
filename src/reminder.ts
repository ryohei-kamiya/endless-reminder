import * as calendar from "./calendar";
import * as sheets from "./sheets";
import * as slack from "./slack";
import * as sm from "./scheduled_message";
import * as triggerManager from "./trigger-manager";

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
 * Get the actual message sending to Slack
 * @param {string[]} sendTo
 * @param {string} text
 * @returns
 */
export const getActualMessageToSlack = (
  sendTo: string[],
  text: string
): string => {
  let message = "";
  for (let member of sendTo) {
    if (member.toLowerCase() === "channel" || member.toLowerCase() === "here") {
      message = `${message} <!${member}>`;
    } else {
      message = `${message} <@${member}>`;
    }
  }
  message = message.trim();
  if (message.length > 0) {
    message += "\n";
  }
  message += text;
  return message;
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
  const lastRow = completionKeywordsSheet.getLastRow();
  for (let i = 2; i <= lastRow; i++) {
    const keyword = completionKeywordsSheet.getRange(i, 1).getValue();
    results.push(keyword);
  }
  return results;
};

/**
 * Has some keywords in the text?
 * @param {string} text
 * @param {string[]} keywords
 * @return {boolean}
 */
export const hasSomeKeywordsInText = (
  text: string,
  keywords: string[]
): boolean => {
  for (let keyword of keywords) {
    if (text.indexOf(keyword) !== -1) {
      return true;
    }
  }
  return false;
};

/**
 * Is member in senders of completion message?
 * @param {string} member
 * @param {slack.SlackMessage[]} messages
 * @return {boolean}
 */
export const isMemberInCompletionMessageSenders = (
  member: string,
  messages: slack.SlackMessage[],
  completionKeywords: string[]
): boolean => {
  for (let message of messages) {
    if (message.user === member) {
      if (hasSomeKeywordsInText(message.text, completionKeywords)) {
        return true;
      }
    }
  }
  return false;
};

global.remind = (event: any) => {
  const scheduledMessage: sm.ScheduledMessage = triggerManager.handleTriggered(
    event.triggerUid
  );
  if (scheduledMessage.threadTs === null) {
    const payload = {
      channel: scheduledMessage.channel,
      text: getActualMessageToSlack(
        scheduledMessage.sendTo,
        scheduledMessage.message
      ),
      icon_emoji: ":spiral_calendar_pad:",
      username: "reminder",
    };
    scheduledMessage.threadTs = slack.sendMessageToSlack(payload);
    const channelMemberIds = slack.getMemberIdsOnSlackChannel(
      scheduledMessage.channel
    );
    if (
      scheduledMessage.sendTo.some(
        (memberId) => memberId === "channel" || memberId === "here"
      )
    ) {
      scheduledMessage.sendTo = channelMemberIds.filter(
        (memberId) => !slack.isBot(memberId)
      );
    } else {
      const sendTo = [];
      const notFoundMemberIds: string[] = [];
      for (let memberId of scheduledMessage.sendTo) {
        if (!channelMemberIds.includes(memberId)) {
          notFoundMemberIds.push(memberId.replace(/^subteam\^/, ""));
        } else {
          sendTo.push(memberId);
        }
      }
      if (notFoundMemberIds.length > 0) {
        const userGroups = slack.getUserGroups();
        for (let notFoundMemberId of notFoundMemberIds) {
          const filteredUserGroups = userGroups.filter(
            (element) =>
              element.id === notFoundMemberId ||
              element.handle === notFoundMemberId
          );
          if (filteredUserGroups.length > 0) {
            const userGroup = filteredUserGroups[0];
            const memberIdsInUserGroup = slack.getMemberIdsInUserGroup(
              userGroup.id
            );
            for (let memberId of memberIdsInUserGroup) {
              if (slack.isBot(memberId)) {
                continue;
              }
              if (!sendTo.includes(memberId)) {
                sendTo.push(memberId);
              }
            }
          }
        }
      }
      scheduledMessage.sendTo = sendTo;
    }
    const date = calendar.getNextWorkingDay(
      new Date(scheduledMessage.datetime)
    );
    scheduledMessage.datetime = date.getTime();
    setReminder(scheduledMessage);
  } else {
    if (scheduledMessage.renotice) {
      const replies = slack.getRepliesFromSlackThread(
        scheduledMessage.channel,
        scheduledMessage.threadTs
      );
      const completionKeywords = getCompletionKeywords();
      const sendTo = [];
      for (let memberId of scheduledMessage.sendTo) {
        if (
          !isMemberInCompletionMessageSenders(
            memberId,
            replies,
            completionKeywords
          )
        ) {
          sendTo.push(memberId);
        }
      }
      if (sendTo.length > 0) {
        scheduledMessage.sendTo = sendTo;
        const payload = {
          channel: scheduledMessage.channel,
          thread_ts: scheduledMessage.threadTs,
          text: getActualMessageToSlack(
            scheduledMessage.sendTo,
            scheduledMessage.renotice
          ),
          icon_emoji: ":spiral_calendar_pad:",
          username: "reminder",
        };
        slack.sendMessageToSlack(payload);
        const date = calendar.getNextWorkingDay(
          new Date(scheduledMessage.datetime)
        );
        scheduledMessage.datetime = date.getTime();
        setReminder(scheduledMessage);
      }
    }
  }
};
