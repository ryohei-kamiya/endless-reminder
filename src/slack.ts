import * as settings from "./settings";
import * as utils from "./utils";

export type SlackMessageRequest = {
  channel: string;
  text: string;
  icon_emoji?: string;
  username?: string;
  thread_ts?: string;
};

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

export type Channel = {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  created?: number;
  creator?: string;
  is_archived?: boolean;
  is_general?: boolean;
  unlinked?: number;
  name_normalized?: string;
  is_shared?: boolean;
  is_ext_shared?: boolean;
  is_org_shared?: boolean;
  pending_shared?: string[];
  is_pending_ext_shared?: boolean;
  is_member?: boolean;
  is_private: boolean;
  is_mpim: boolean;
  topic?: {
    value?: string;
    creator?: string;
    last_set?: number;
  };
  purpose?: {
    value?: string;
    creator?: string;
    last_set?: number;
  };
  previous_names?: string[];
  num_members?: number;
};

export type Member = {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color?: string;
  real_name?: string;
  tz?: string;
  tz_label?: string;
  tz_offset: number;
  profile?: {
    avatar_hash?: string;
    status_text?: string;
    status_emoji?: string;
    real_name?: string;
    display_name?: string;
    real_name_normalized?: string;
    display_name_normalized?: string;
    email?: string;
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
    team?: string;
  };
  is_admin?: boolean;
  is_owner?: boolean;
  is_primary_owner?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_bot: boolean;
  updated?: number;
  is_app_user: boolean;
  has_2fa?: boolean;
};

/**
 * Send a message to slack.
 *
 * @param {*} payload
 */
export const sendMessageToSlack = (payload: any): string => {
  try {
    const slackAppToken = settings.getSlackAppToken();
    if (!slackAppToken) {
      throw Error(`The value of slackAppToken is null but it should not be.`);
    }
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
  return "";
};

/**
 * Get the list of member's id on the Slack chennel.
 * @param {string} channel
 * @return {string[]}
 */
export const getMemberIdsOnSlackChannel = (channel: string): string[] => {
  const slackAppToken = settings.getSlackAppToken();
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
  const baseQueryString = `?channel=${channel}&limit=100`;
  let queryString: string = "";
  let nextCursor: string = "";
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
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
      for (let memberId of json["members"]) {
        if (results.includes(memberId)) {
          continue;
        }
        results.push(memberId);
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
  const slackAppToken = settings.getSlackAppToken();
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
 * Get the list of member's id in the UserGroup
 * @param {string} usergroup - The encoded ID of the User Group
 * @return {string[]}
 */
export const getMemberIdsInUserGroup = (usergroup: string): string[] => {
  const slackAppToken = settings.getSlackAppToken();
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
  const slackAppToken = settings.getSlackAppToken();
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
  const baseQueryString = `?channel=${channel}&ts=${threadTs}&limit=100`;
  let queryString: string = "";
  let nextCursor: string = "";
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
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
        if (reply.ts === threadTs) {
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

/**
 * Get array of Channel
 * @return {Channel[]}
 */
export const getChannels = (): Channel[] => {
  const slackAppToken = settings.getSlackAppToken();
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
  const results: Channel[] = [];
  const baseQueryString = `?exclude_archived=true&types=public_channel%2Cprivate_channel%2Cmpim%2Cim&limit=100`;
  let queryString: string = "";
  let nextCursor: string = "";
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      if (nextCursor) {
        queryString = `${baseQueryString}&cursor=${nextCursor}`;
      } else {
        queryString = `${baseQueryString}`;
      }
      const url = `https://slack.com/api/conversations.list${queryString}`;
      const res = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(res.getContentText());
      if (!json || !json["ok"]) {
        return results;
      }
      let existsNewChannel = false;
      for (let channel of json["channels"]) {
        if (results.some((result) => result.id === channel.id)) {
          continue;
        }
        results.push(channel);
        existsNewChannel = true;
      }
      if (
        existsNewChannel &&
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
 * Convert the channel name to id.
 * @param {string} name
 * @param {Channel[]} channels
 * @return {string}
 */
export const convertChannelNameToId = (
  name: string,
  channels: Channel[] | undefined
): string => {
  if (channels === undefined) {
    channels = getChannels();
  }
  for (let channel of channels) {
    if (channel.name === name) {
      return channel.id;
    }
  }
  return name;
};

/**
 * Get all members in this Slack team
 * @return {Member[]}
 */
export const getAllMembers = (): Member[] => {
  const slackAppToken = settings.getSlackAppToken();
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
  const results: Member[] = [];
  const baseQueryString = `?limit=100`;
  let queryString: string = "";
  let nextCursor: string = "";
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      if (nextCursor) {
        queryString = `${baseQueryString}&cursor=${nextCursor}`;
      } else {
        queryString = `${baseQueryString}`;
      }
      const url = `https://slack.com/api/users.list${queryString}`;
      const res = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(res.getContentText());
      if (!json || !json["ok"]) {
        return results;
      }
      let existsNewMember = false;
      for (let member of json["members"]) {
        if (results.some((result) => result.id === member.id)) {
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
 * Get the member
 * @param {string} memberId
 * @return {Member|null}
 */
export const getMember = (memberId: string): Member | null => {
  const slackAppToken = settings.getSlackAppToken();
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
  let result: Member | null = null;
  try {
    const url = `https://slack.com/api/users.info?user=${memberId}`;
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());
    if (!json || !json["ok"]) {
      return result;
    }
    result = json["user"];
  } catch (e) {
    console.log(e);
  }
  return result;
};

/**
 * Is bot user?
 * @param {string} memberId
 * @return {boolean}
 */
export const isBot = (memberId: string): boolean => {
  const member = getMember(memberId);
  if (member) {
    if (member.id === memberId) {
      if (member.is_bot) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
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
 * Is member in senders of completion message?
 * @param {string} member
 * @param {SlackMessage[]} messages
 * @return {boolean}
 */
export const isMemberInCompletionMessageSenders = (
  member: string,
  messages: SlackMessage[],
  completionKeywords: string[]
): boolean => {
  for (let message of messages) {
    if (message.user === member) {
      if (utils.hasSomeKeywordsInText(message.text, completionKeywords)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Get the array of member's id in any one of allUserGroups.
 * @param {string[]} targetUserGroupIds
 * @param {UserGroup[]} allUserGroups
 */
export const getMemberIdsInUserGroups = (
  targetUserGroupIds: string[],
  allUserGroups: UserGroup[]
) => {
  const results: string[] = [];
  for (let userGroupId of targetUserGroupIds) {
    const filteredUserGroups = allUserGroups.filter(
      (element) => element.id === userGroupId || element.handle === userGroupId
    );
    if (filteredUserGroups.length > 0) {
      const userGroup = filteredUserGroups[0];
      const memberIdsInUserGroup = getMemberIdsInUserGroup(userGroup.id);
      for (let memberIdInUG of memberIdsInUserGroup) {
        if (isBot(memberIdInUG)) {
          continue;
        }
        if (!results.includes(memberIdInUG)) {
          results.push(memberIdInUG);
        }
      }
    }
  }
  return results;
};
