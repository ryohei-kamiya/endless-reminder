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
    .at(scheduledMessage.date)
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

global.remind = (scheduledMessage: sm.ScheduledMessage) => {
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
    const allMembers = slack.getMembersFromSlackChannel(
      scheduledMessage.channel
    );
    if (
      scheduledMessage.sendTo.some(
        (member) => member === "channel" || member === "here"
      )
    ) {
      scheduledMessage.sendTo = allMembers;
    } else {
      const sendTo = [];
      const notFoundMembers: string[] = [];
      for (let member of scheduledMessage.sendTo) {
        if (!allMembers.includes(member)) {
          notFoundMembers.push(member);
        } else {
          sendTo.push(member);
        }
      }
      if (notFoundMembers.length > 0) {
        const userGroups = slack.getUserGroups();
        for (let notFoundMember of notFoundMembers) {
          const filteredUserGroups = userGroups.filter(
            (element) => element.handle === notFoundMember
          );
          if (filteredUserGroups.length > 0) {
            const userGroup = filteredUserGroups[0];
            const membersInUserGroup = slack.getMembersInUserGroup(
              userGroup.id
            );
            for (let member of membersInUserGroup) {
              if (!sendTo.includes(member)) {
                sendTo.push(member);
              }
            }
          }
        }
      }
      scheduledMessage.sendTo = sendTo;
    }
    scheduledMessage.date = calendar.getNextWorkingDay(scheduledMessage.date);
    setReminder(scheduledMessage);
  } else {
    const replies = slack.getRepliesFromSlackThread(
      scheduledMessage.channel,
      scheduledMessage.threadTs
    );
    const completionKeywords = getCompletionKeywords();
    const sendTo = [];
    for (let member of scheduledMessage.sendTo) {
      if (
        !isMemberInCompletionMessageSenders(member, replies, completionKeywords)
      ) {
        sendTo.push(member);
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
      scheduledMessage.date = calendar.getNextWorkingDay(scheduledMessage.date);
      setReminder(scheduledMessage);
    }
  }
};
