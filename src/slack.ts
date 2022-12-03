import * as triggerManager from "./trigger-manager";

declare let global: any;

/**
 * This function is called by trigger for sending message to slack.
 *
 * @param {*} event
 */
global.sendMessageToSlack = (event: any): void => {
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

export const getSlackAppToken = (): string => {
  const prop = PropertiesService.getScriptProperties();
  const slackAppToken = prop.getProperty("slackAppToken");
  return slackAppToken ?? "";
};

/**
 * Set a trigger of sendMessageToSlack()
 * @param {Date} triggeredDate - Triggered date
 * @param {*} argPayload - Payload of the sending message
 */
export const setTriggerOfSendMessageToSlack = (
  triggeredDate: Date,
  argPayload: any
) => {
  const slackAppToken = getSlackAppToken();
  if (!slackAppToken) {
    throw Error(`The value of slackAppToken is null but it should not be.`);
  }
  const payload = { token: slackAppToken, ...argPayload };
  const trigger: GoogleAppsScript.Script.Trigger = ScriptApp.newTrigger(
    "sendMessageToSlack"
  )
    .timeBased()
    .at(triggeredDate)
    .create();
  triggerManager.setTriggerArguments(trigger, payload, false);
};
