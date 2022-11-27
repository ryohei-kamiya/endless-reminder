const activeSpreadSheet = () => SpreadsheetApp.getActiveSpreadsheet();

export const mainSheet = () => activeSpreadSheet().getSheetByName("main");
export const holidayCalendarsSheet = () =>
  activeSpreadSheet().getSheetByName("holiday_calendars");
