import * as sheets from "./sheets";
import * as utils from "./utils";
import config from "./config.json";
import { TableData } from "./table_data";

let tableData: TableData | null = null;

export const initSettings = () => {
  tableData = sheets.getTableData(sheets.settingsSheet());
};

export const getProperty = (propertyName: string): any => {
  if (tableData === null) {
    initSettings();
  }
  let result: any = null;
  if (tableData !== null) {
    for (let row = 1; row < tableData.getRows(); row++) {
      const name = tableData.getValue(row, 0);
      const value = tableData.getValue(row, 1);
      if (name.toUpperCase() == propertyName) {
        if (typeof value == "string") {
          result = value.trim();
        }
        result = value;
        break;
      }
    }
  }
  if (result !== null && result !== "") {
    return result;
  }
  const prop = PropertiesService.getScriptProperties();
  result = prop.getProperty(propertyName);
  if (result !== null && result !== "") {
    return result;
  }
  const conf = new Map(Object.entries(config));
  result = conf.get(propertyName.toLowerCase());
  if (result !== null && result !== "") {
    return result;
  }
  return "";
};

export const getBotName = (): string => {
  return getProperty("BOT_NAME");
};

export const getActiveChatApp = (): string => {
  return getProperty("ACTIVE_CHAT_APP").toLowerCase();
};

export const getSlackBotUserOAuthToken = (): string => {
  return getProperty("SLACK_BOT_USER_OAUTH_TOKEN");
};

export const getSlackIconEmoji = (): string => {
  return getProperty("SLACK_ICON_EMOJI");
};

export const getTimeInterval = (): number => {
  const result = Number(getProperty("TIME_INTERVAL"));
  if (Number.isNaN(result)) {
    return 1440; // default TIME_INTERVAL is 1 day
  } else {
    if (result < 1) {
      return 1; // minimum value of TIME_INTERVAL is 1
    }
    return result;
  }
};

export const getTimeIntervalDecay = (): number => {
  const result = Number(getProperty("TIME_INTERVAL_DECAY"));
  if (Number.isNaN(result)) {
    return 1; // default TIME_INTERVAL_DECAY is 1
  } else {
    return result;
  }
};

export const getTimeIntervalMin = (): number => {
  const result = Number(getProperty("TIME_INTERVAL_MIN"));
  const timeInterval = getTimeInterval();
  if (Number.isNaN(result)) {
    return timeInterval; // default TIME_INTERVAL_MIN is TIME_INTERVAL
  } else {
    if (result < 1) {
      return 1; // minimum value of TIME_INTERVAL_MIN is 1
    }
    if (timeInterval < result) {
      return timeInterval; // maximum value of TIME_INTERVAL_MIN is TIME_INTERVAL
    }
    return result;
  }
};

export const getMaxRepeatCount = (): number => {
  const result = Number(getProperty("MAX_REPEAT_COUNT"));
  if (Number.isNaN(result)) {
    return 0; // default MAX_REPEAT_COUNT is 0 (unlimited)
  } else {
    if (result < 1) {
      return 0; // minimum value of MAX_REPEAT_COUNT is 0
    }
    return result;
  }
};

export const getOpeningTime = (): string => {
  const time = getProperty("OPENING_TIME");
  return utils.convertTimeToString(time);
};

export const getClosingTime = (): string => {
  const openingTime = getOpeningTime();
  const time = getProperty("CLOSING_TIME");
  const result = utils.convertTimeToString(time);
  if (result < openingTime) {
    return openingTime; // CLOSING_TIME must be greater or equal OPENING_TIME
  }
  return result;
};

export const getDebug = (): boolean => {
  return getProperty("DEBUG");
};
