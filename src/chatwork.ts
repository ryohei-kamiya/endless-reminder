import * as settings from "./settings";
import { HttpClient } from "./http_client";

export type Room = {
  room_id: number;
  name: string;
  type: string;
  role: string;
  sticky: boolean;
  unread_num: number;
  mention_num: number;
  mytask_num: number;
  message_num: number;
  file_num: number;
  task_num: number;
  icon_path: string;
  last_update_time: number;
};

export type Member = {
  account_id: number;
  role: string;
  name: string;
  chatwork_id: string;
  organization_id: number;
  organization_name: string;
  department: string;
  avatar_image_url: string;
};

export type Message = {
  message_id: string;
  account: {
    account_id: number;
    name: string;
    avatar_image_url: string;
  };
  body: string;
  send_time: number;
  update_time: number;
};

export type Task = {
  task_id: number;
  account: {
    account_id: number;
    name: string;
    avatar_image_url: string;
  };
  assigned_by_account: {
    account_id: number;
    name: string;
    avatar_image_url: string;
  };
  message_id: string;
  body: string;
  limit_time: number;
  status: string;
  limit_type: string;
};

/**
 * Get array of Room
 * @return {Room[]}
 */
export const getRooms = (): Room[] => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const httpClient = new HttpClient();
  const results: Room[] = [];
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.get(url, null, headers);
      const json = res.getContentJson();
      if (!json || !Array.isArray(json) || json.length === 0) {
        return results;
      }
      for (const room of json) {
        results.push(room);
      }
      break;
    } catch (e) {
      console.log(e);
    }
  }
  return results;
};

/**
 * Get array of Member in a Room
 * @param {string} roomId
 * @return {Member[]}
 */
export const getMembersInRoom = (roomId: string): Member[] => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms/${roomId}/members`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const httpClient = new HttpClient();
  const results: Member[] = [];
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.get(url, null, headers);
      const json = res.getContentJson();
      if (!json || !Array.isArray(json) || json.length === 0) {
        return results;
      }
      for (const room of json) {
        results.push(room);
      }
      break;
    } catch (e) {
      console.log(e);
    }
  }
  return results;
};

/**
 * Get a Message in a Room
 * @param {string} roomId
 * @param {string} messageId
 * @return {Message|null}
 */
export const getMessageInRoom = (
  roomId: string,
  messageId: string
): Message | null => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms/${roomId}/messages/${messageId}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const httpClient = new HttpClient();
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.get(url, null, headers);
      const json = res.getContentJson();
      if (!json) {
        return null;
      }
      return json;
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

/**
 * Get array of Task in a Room
 * @param {string} roomId
 * @param {string|null} status
 * @return {Task|null}
 */
export const getTasksInRoom = (
  roomId: string,
  status: string | null = null
): Task[] | null => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms/${roomId}/tasks`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const httpClient = new HttpClient();
  const params: { status?: string } = {};
  if (status !== null) {
    params.status = status;
  }
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.get(url, params, headers);
      const json = res.getContentJson();
      if (!json) {
        return null;
      }
      return json;
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

/**
 * Get a Task in a Room
 * @param {string} roomId
 * @param {string} taskId
 * @return {Task|null}
 */
export const getTaskInRoom = (roomId: string, taskId: string): Task | null => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms/${roomId}/tasks/${taskId}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const httpClient = new HttpClient();
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.get(url, null, headers);
      const json = res.getContentJson();
      if (!json) {
        return null;
      }
      return json;
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

/**
 * Post a Task in a Room
 * @param {string} roomId - required
 * @param {string} text - required
 * @param {string[]} memberIds - required
 * @param {number|null} limitUnixTimeSec - optional
 * @return {string[]|null}
 */
export const postTaskInRoom = (
  roomId: string,
  text: string,
  memberIds: string[],
  limitUnixTimeSec: number | null = null
): number[] | null => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms/${roomId}/tasks`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const limitType = limitUnixTimeSec === null ? "none" : "time";
  const httpClient = new HttpClient();
  const body = {
    body: text,
    to_ids: memberIds.join(","),
    limit: limitUnixTimeSec,
    limit_type: limitType,
  };
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.post(url, body, headers);
      const json = res.getContentJson();
      if (!json || !json["task_ids"] || json["task_ids"].length === 0) {
        return null;
      }
      return json["task_ids"];
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

/**
 * Post a Message in a Room
 * @param {string} roomId - required
 * @param {string} text - required
 * @param {number} self_unread - optional
 * @return {string|null}
 */
export const postMessageInRoom = (
  roomId: string,
  text: string,
  self_unread: number = 0
): string | null => {
  const chatworkAPIToken = settings.getChatworkAPIToken();
  if (!chatworkAPIToken) {
    throw Error(`The value of chatworkAPIToken is null but it should not be.`);
  }
  const url = `https://api.chatwork.com/v2/rooms/${roomId}/messages`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "x-chatworktoken": chatworkAPIToken,
  };
  const httpClient = new HttpClient();
  const body = {
    body: text,
    self_unread: self_unread,
  };
  for (let retryCnt = 0; retryCnt < 10; retryCnt++) {
    try {
      const res = httpClient.post(url, body, headers);
      const json = res.getContentJson();
      if (!json || !json["message_id"]) {
        return null;
      }
      return json["message_id"];
    } catch (e) {
      console.log(e);
    }
  }
  return null;
};

/**
 * Convert the room name to id.
 * @param {string} name
 * @param {Room[]} rooms
 * @return {string}
 */
export const convertRoomlNameToId = (
  name: string,
  rooms: Room[] | undefined
): string => {
  if (rooms === undefined) {
    rooms = getRooms();
  }
  for (const room of rooms) {
    if (room.name == name) {
      return String(room.room_id);
    }
  }
  return name;
};
