import * as sm from "../src/scheduled_message";
import { TableData } from "../src/table_data";

const mockDate = new Date(2022, 0, 1, 0, 0, 0, 0);
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
  renotice: "Hello world again!",
  notRenoticeTo: ["dummy_user_id1"],
  disabled: false,
};

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
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
});
