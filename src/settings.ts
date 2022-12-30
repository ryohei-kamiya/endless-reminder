import * as sheets from "./sheets";
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
  for (let row = 1; row < tableData!.getRows(); row++) {
    const name = tableData!.getValue(row, 0);
    const value = tableData!.getValue(row, 1);
    if (name.toUpperCase() === propertyName) {
      if (typeof value === "string") {
        result = value.trim();
      }
      result = value;
      break;
    }
  }
  if (result !== null && result !== "") {
    return result;
  }
  const conf = new Map(Object.entries(config));
  result = conf.get(propertyName.toLowerCase());
  if (result !== null && result !== "") {
    return result;
  }
  const prop = PropertiesService.getScriptProperties();
  const propertyValue = prop.getProperty(propertyName);
  return propertyValue ?? "";
};

export const getBotName = (): string => {
  return getProperty("BOT_NAME");
};

export const getActiveChatApp = (): string => {
  return getProperty("ACTIVE_CHAT_APP").toLowerCase();
};

export const getSlackAppToken = (): string => {
  return getProperty("SLACK_APP_TOKEN");
};

export const getSlackIconEmoji = (): string => {
  return getProperty("SLACK_ICON_EMOJI");
};

export const getDebug = (): string => {
  return getProperty("DEBUG");
};
