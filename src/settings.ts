import * as sheets from "./sheets";
import config from "./config.json";

const settingsSheet: GoogleAppsScript.Spreadsheet.Sheet | null =
  sheets.settingsSheet();
const tableData = sheets.getTableData(settingsSheet);

export const getProperty = (propertyName: string): any => {
  for (let row = 1; row < tableData.getRows(); row++) {
    const name = tableData.getValue(row, 0);
    const value = tableData.getValue(row, 1);
    if (name.toUpperCase() === propertyName) {
      if (typeof value === "string") {
        return value.trim();
      }
      return value;
    }
  }
  const conf = new Map(Object.entries(config));
  const configValue = conf.get(propertyName.toLowerCase());
  if (configValue) {
    return configValue;
  }
  const prop = PropertiesService.getScriptProperties();
  const propertyValue = prop.getProperty(propertyName);
  return propertyValue ?? "";
};

export const getBotName = (): string => {
  return getProperty("BOT_NAME");
};

export const getActiveChatApp = (): string => {
  return getProperty("ACTIVE_CHAT_APP");
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
