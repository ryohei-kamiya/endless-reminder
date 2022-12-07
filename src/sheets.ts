const activeSpreadSheet = () => SpreadsheetApp.getActiveSpreadsheet();

export const mainSheet = () => activeSpreadSheet().getSheetByName("main");
export const holidayCalendarsSheet = () =>
  activeSpreadSheet().getSheetByName("holiday_calendars");
export const completionKeywordsSheet = () =>
  activeSpreadSheet().getSheetByName("completion_keywords");
