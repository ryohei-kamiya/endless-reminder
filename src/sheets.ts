import { TableData } from "./table_data";
import config from "./config.json";

const activeSpreadSheet = () => SpreadsheetApp.getActiveSpreadsheet();

export const mainSheet = () =>
  activeSpreadSheet().getSheetByName(config.spread_sheet_name_1);
export const holidayCalendarsSheet = () =>
  activeSpreadSheet().getSheetByName(config.spread_sheet_name_2);
export const completionKeywordsSheet = () =>
  activeSpreadSheet().getSheetByName(config.spread_sheet_name_3);
export const settingsSheet = () =>
  activeSpreadSheet().getSheetByName(config.spread_sheet_name_4);

/**
 * Get the table data from sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {TableData}
 */
export const getTableData = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet | null
): TableData => {
  if (sheet === null) {
    return new TableData([]);
  }
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  return new TableData(range.getValues());
};
