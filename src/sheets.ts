import { TableData } from "./table_data";

const activeSpreadSheet = () => SpreadsheetApp.getActiveSpreadsheet();

export const mainSheet = () => activeSpreadSheet().getSheetByName("main");
export const holidayCalendarsSheet = () =>
  activeSpreadSheet().getSheetByName("holiday_calendars");
export const completionKeywordsSheet = () =>
  activeSpreadSheet().getSheetByName("completion_keywords");

/**
 * Get the table data from sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {TableData}
 */
export const getTableData = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): TableData => {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  return new TableData(range.getValues());
};
