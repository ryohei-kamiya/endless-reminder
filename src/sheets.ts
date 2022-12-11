const activeSpreadSheet = () => SpreadsheetApp.getActiveSpreadsheet();

export const mainSheet = () => activeSpreadSheet().getSheetByName("main");
export const holidayCalendarsSheet = () =>
  activeSpreadSheet().getSheetByName("holiday_calendars");
export const completionKeywordsSheet = () =>
  activeSpreadSheet().getSheetByName("completion_keywords");

/**
 * Get the non-empty values from sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {any[][]}
 */
export const getNonEmptyValues = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): any[][] => {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  return range.getValues();
};
