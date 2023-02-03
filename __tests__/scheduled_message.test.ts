import * as sm from "../src/scheduled_message";
import * as calendar from "../src/calendar";
import { TableData } from "../src/table_data";

const mockDate = new Date(2022, 0, 4, 0, 0, 0, 0);
const testTableData: TableData = new TableData([
  [
    1,
    "*",
    "*",
    1,
    true,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    2,
    "2023,2024",
    "1,2,3",
    2,
    true,
    "01:00:02",
    "random",
    "channel",
    "Hello world!",
    10,
    "Hello world again!",
    "dummy_user_id1, dummy_user_id2",
    null,
  ],
  [
    3,
    "2023,2024,2025",
    "4, 5, 6",
    3,
    true,
    "00:01:02",
    "random",
    "channel",
    "Hello world!",
    15,
    "Hello world again!",
    "dummy_user_id1, dummy_user_id2, dummy_user_id3",
    true,
  ],
  [
    4,
    "2022,2025",
    "1,2,3,*",
    4,
    false,
    "15:30:00",
    "random",
    "channel",
    "Hello world!",
    20,
    "Hello world again!",
    "dummy_user_id1, dummy_user_id2, dummy_user_id3",
    "",
  ],
  [
    5,
    "",
    "*",
    5,
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    25,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    6,
    "*",
    "",
    6,
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    30,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    7,
    "*",
    "*",
    "sun",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    8,
    "*",
    "*",
    "mon",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    9,
    "*",
    "*",
    "tue",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    10,
    "*",
    "*",
    "wed",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    11,
    "*",
    "*",
    "thu",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    12,
    "*",
    "*",
    "fri",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    13,
    "*",
    "*",
    "sat",
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    14,
    "*",
    "*",
    "wed",
    true,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
  [
    15,
    "*",
    "*",
    32,
    false,
    mockDate,
    "random",
    "channel",
    "Hello world!",
    5,
    "Hello world again!",
    "dummy_user_id1",
    false,
  ],
]);

const trueRecord1: sm.ScheduledMessageRecord = {
  id: 1,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 1,
  exceptHolidays: true,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord2: sm.ScheduledMessageRecord = {
  id: 2,
  years: [2023, 2024],
  months: [1, 2, 3],
  days: 2,
  exceptHolidays: true,
  hms: "01:00:02",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 10,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1", "dummy_user_id2"],
  disabled: false,
};

const trueRecord3: sm.ScheduledMessageRecord = {
  id: 3,
  years: [2023, 2024, 2025],
  months: [4, 5, 6],
  days: 3,
  exceptHolidays: true,
  hms: "00:01:02",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 15,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1", "dummy_user_id2", "dummy_user_id3"],
  disabled: true,
};

const trueRecord4: sm.ScheduledMessageRecord = {
  id: 4,
  years: [2022, 2025],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 4,
  exceptHolidays: false,
  hms: "15:30:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 20,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1", "dummy_user_id2", "dummy_user_id3"],
  disabled: false,
};

const trueRecord5: sm.ScheduledMessageRecord = {
  id: 5,
  years: [],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 5,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 25,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord6: sm.ScheduledMessageRecord = {
  id: 6,
  years: [2022, 2023],
  months: [],
  days: 6,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 30,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord7: sm.ScheduledMessageRecord = {
  id: 7,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 9,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord8: sm.ScheduledMessageRecord = {
  id: 8,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 10,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord9: sm.ScheduledMessageRecord = {
  id: 9,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 11,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord10: sm.ScheduledMessageRecord = {
  id: 10,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 5,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord11: sm.ScheduledMessageRecord = {
  id: 11,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 6,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord12: sm.ScheduledMessageRecord = {
  id: 12,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 7,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord13: sm.ScheduledMessageRecord = {
  id: 13,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 8,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord14: sm.ScheduledMessageRecord = {
  id: 14,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 5,
  exceptHolidays: true,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

const trueRecord15: sm.ScheduledMessageRecord = {
  id: 15,
  years: [2022, 2023],
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  days: 31,
  exceptHolidays: false,
  hms: "00:00:00",
  channel: "random",
  sendTo: ["channel"],
  message: "Hello world!",
  waitingMinutes: 5,
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
  const tomorrow = new Date(mockDate.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  jest.spyOn(calendar, "getTomorrow").mockReset().mockReturnValue(tomorrow);
});

describe("unit tests for convertReceiverStringToArray()", () => {
  it("if args is 'channel, dummy' then return ['channel', 'dummy']", () => {
    expect(sm.convertReceiverStringToArray("channel, dummy")).toEqual([
      "channel",
      "dummy",
    ]);
  });
});

describe("unit tests for getScheduledMessageRecord()", () => {
  it("if tableData is testTableData and row == 0 then return trueRecord1", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 0)).toEqual(trueRecord1);
  });
  it("if tableData is testTableData and row == 1 then return trueRecord2", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 1)).toEqual(trueRecord2);
  });
  it("if tableData is testTableData and row == 2 then return trueRecord3", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 2)).toEqual(trueRecord3);
  });
  it("if tableData is testTableData and row == 3 then return trueRecord4", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 3)).toEqual(trueRecord4);
  });
  it("if tableData is testTableData and row == 4 then return trueRecord5", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 4)).toEqual(trueRecord5);
  });
  it("if tableData is testTableData and row == 5 then return trueRecord6", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 5)).toEqual(trueRecord6);
  });
  it("if tableData is testTableData and row == 6 then return trueRecord7", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(true);
    expect(sm.getScheduledMessageRecord(testTableData, 6)).toEqual(trueRecord7);
  });
  it("if tableData is testTableData and row == 7 then return trueRecord8", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(false);
    expect(sm.getScheduledMessageRecord(testTableData, 7)).toEqual(trueRecord8);
  });
  it("if tableData is testTableData and row == 8 then return trueRecord9", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(false);
    expect(sm.getScheduledMessageRecord(testTableData, 8)).toEqual(trueRecord9);
  });
  it("if tableData is testTableData and row == 9 then return trueRecord10", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(false);
    expect(sm.getScheduledMessageRecord(testTableData, 9)).toEqual(
      trueRecord10
    );
  });
  it("if tableData is testTableData and row == 10 then return trueRecord11", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(false);
    expect(sm.getScheduledMessageRecord(testTableData, 10)).toEqual(
      trueRecord11
    );
  });
  it("if tableData is testTableData and row == 11 then return trueRecord12", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(false);
    expect(sm.getScheduledMessageRecord(testTableData, 11)).toEqual(
      trueRecord12
    );
  });
  it("if tableData is testTableData and row == 12 then return trueRecord13", () => {
    jest.spyOn(calendar, "isHoliday").mockReset().mockReturnValueOnce(true);
    expect(sm.getScheduledMessageRecord(testTableData, 12)).toEqual(
      trueRecord13
    );
  });
  it("if tableData is testTableData and row == 13 and tomorrow is holiday and today is not holiday then return trueRecord14", () => {
    jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    expect(sm.getScheduledMessageRecord(testTableData, 13, ["dummy"])).toEqual(
      trueRecord14
    );
  });
  it("if tableData is testTableData and row == 14 then return trueRecord15", () => {
    expect(sm.getScheduledMessageRecord(testTableData, 14)).toEqual(
      trueRecord15
    );
  });
});
