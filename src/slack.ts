import * as triggerManager from "./trigger-manager";

export type SlackMessage = {
  type: string;
  user: string;
  text: string;
  thread_ts: string;
  ts: string;
  reply_count?: number;
  subscribed?: boolean;
  last_read?: string;
  unread_count?: number;
  parent_user_id?: string;
};

export type UserGroup = {
  id: string;
  team_id?: string;
  is_usergroup?: boolean;
  name?: string;
  description?: string;
  handle: string;
  is_external?: boolean;
  date_create?: number;
  date_update?: number;
  date_delete?: number;
  auto_type?: string;
  created_by?: string;
  updated_by?: string | null;
  deleted_by?: string | null;
  prefs?: {
    channels?: string[];
    groups?: string[];
  };
  users?: string[];
  user_count?: string;
};

export const getSlackAppToken = (): string => {
  const prop = PropertiesService.getScriptProperties();
  const slackAppToken = prop.getProperty("slackAppToken");
  return slackAppToken ?? "";
};

/**
 * This function is called by trigger for sending message to slack.
 *
 * @param {*} event
 */
export const sendMessageToSlack = (event: any): string => {
  console.log("[sendMessageToSlack]: called", event);
  if (event) {
    try {
      const slackAppToken = getSlackAppToken();
      if (!slackAppToken) {
        throw Error(`The value of slackAppToken is null but it should not be.`);
      }
      const payload = triggerManager.handleTriggered(event.triggerUid);
      const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${slackAppToken}`,
        },
        payload: payload,
      };
      const url = "https://slack.com/api/chat.postMessage";
      const res = UrlFetchApp.fetch(url, options);
      const resBody = JSON.parse(res.getContentText());
      if (resBody["ok"]) {
        return resBody["ts"];
      } else {
        return "";
      }
    } catch (e) {
      console.log(e);
    }
  }
  return "";
};

/**
 *
 * @param {string} channel
 * @return {string[]}
 */
export const getMembersFromSlackChannel = (channel: string): string[] => {
  const slackAppToken = getSlackAppToken();
  if (!slackAppToken) {
    throw Error(`The value of slackAppToken is null but it should not be.`);
  }
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "get",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${slackAppToken}`,
    },
  };
  const results: string[] = [];
  const baseQueryString = `?channel=${channel}&limit=10`;
  let queryString: string = "";
  let nextCursor: string = "";
  for (let retryCnt = 0; retryCnt < 5; retryCnt++) {
    try {
      if (nextCursor) {
        queryString = `${baseQueryString}&cursor=${nextCursor}`;
      } else {
        queryString = `${baseQueryString}`;
      }
      const url = `https://slack.com/api/conversations.members${queryString}`;
      const res = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(res.getContentText());
      if (!json || !json["ok"]) {
        return results;
      }
      let existsNewMember = false;
      for (let member of json["members"]) {
        if (results.includes(member)) {
          continue;
        }
        results.push(member);
        existsNewMember = true;
      }
      if (
        existsNewMember &&
        json["response_metadata"] &&
        json["response_metadata"]["next_cursor"]
      ) {
        nextCursor = json["response_metadata"]["next_cursor"];
      } else {
        break;
      }
    } catch (e) {
      console.log(e);
    }
  }
  return results;
};

/**
 * Get array of UserGroup
 * @return {UserGroup[]}
 */
export const getUserGroups = (): UserGroup[] => {
  const slackAppToken = getSlackAppToken();
  if (!slackAppToken) {
    throw Error(`The value of slackAppToken is null but it should not be.`);
  }
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "get",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${slackAppToken}`,
    },
  };
  const results: UserGroup[] = [];
  try {
    const url = `https://slack.com/api/usergroups.list`;
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());
    if (!json || !json["ok"]) {
      return results;
    }
    for (let usergroup of json["usergroups"]) {
      results.push(usergroup);
    }
  } catch (e) {
    console.log(e);
  }
  return results;
};

/**
 * Get members in the UserGroup
 * @param {string} usergroup - The encoded ID of the User Group
 * @return {string[]}
 */
export const getMembersInUserGroup = (usergroup: string): string[] => {
  const slackAppToken = getSlackAppToken();
  if (!slackAppToken) {
    throw Error(`The value of slackAppToken is null but it should not be.`);
  }
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "get",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${slackAppToken}`,
    },
  };
  const results: string[] = [];
  try {
    const url = `https://slack.com/api/usergroups.users.list?usergroup=${usergroup}`;
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());
    if (!json || !json["ok"]) {
      return results;
    }
    for (let user of json["users"]) {
      results.push(user);
    }
  } catch (e) {
    console.log(e);
  }
  return results;
};

/**
 * Get reply messages from the thread in the Slack channel.
 * @param {string} channel
 * @param {string} threadTs
 * @return {SlackMessage[]}
 */
export const getRepliesFromSlackThread = (
  channel: string,
  threadTs: string
): SlackMessage[] => {
  const slackAppToken = getSlackAppToken();
  if (!slackAppToken) {
    throw Error(`The value of slackAppToken is null but it should not be.`);
  }
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "get",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${slackAppToken}`,
    },
  };
  const results: SlackMessage[] = [];
  const baseQueryString = `?channel=${channel}&ts=${threadTs}&limit=10`;
  let queryString: string = "";
  let nextCursor: string = "";
  for (let retryCnt = 0; retryCnt < 5; retryCnt++) {
    try {
      if (nextCursor) {
        queryString = `${baseQueryString}&cursor=${nextCursor}`;
      } else {
        queryString = `${baseQueryString}`;
      }
      const url = `https://slack.com/api/conversations.replies${queryString}`;
      const res = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(res.getContentText());
      if (!json || !json["ok"]) {
        return results;
      }
      let existsNewReply = false;
      for (let reply of json["messages"]) {
        if (reply.thread_ts === reply.ts) {
          continue;
        }
        if (results.some((result) => result.ts === reply.ts)) {
          continue;
        }
        results.push(reply);
        existsNewReply = true;
      }
      if (
        existsNewReply &&
        json["has_more"] &&
        json["response_metadata"] &&
        json["response_metadata"]["next_cursor"]
      ) {
        nextCursor = json["response_metadata"]["next_cursor"];
      } else {
        break;
      }
    } catch (e) {
      console.log(e);
    }
  }
  return results;
};
