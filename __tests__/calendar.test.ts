import * as calendar from "../src/calendar";
import * as settings from "../src/settings";

describe("unit tests for parseMonthsString()", () => {
  it("if '*' in args then return [1,2,...,12]", () => {
    expect(calendar.parseMonthsString("1,2,*,3")).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });
  it("if args === '2,4,6,8,10,12' then return [2,4,6,8,10,12]", () => {
    expect(calendar.parseMonthsString("2,4,6,8,10,12")).toEqual([
      2, 4, 6, 8, 10, 12,
    ]);
  });
  it("if args === '2,x,.,8,y,z' then return [2,8]", () => {
    expect(calendar.parseMonthsString("2,x,.,8,y,z")).toEqual([2, 8]);
  });
  it("if args === '' then return []", () => {
    expect(calendar.parseMonthsString("")).toEqual([]);
  });
});

describe("unit tests for updateDateByTimeString()", () => {
  it("if date === '2022-11-27T23:15:30+0900' and timeStr === '12:00:00' then returned date === '2022-11-27T12:00:00+0900'", () => {
    const date = new Date("2022-11-27T23:00:00+0900");
    const updatedDate = new Date(date);
    calendar.updateDateByTimeString(updatedDate, "12:00:00");
    expect(updatedDate).toEqual(new Date("2022-11-27T12:00:00+0900"));
  });
  it("if date === '2022-11-27T23:00:00+0900' and timeStr === '12:30' then returned date === '2022-11-27T12:30:00+0900'", () => {
    const date = new Date("2022-11-27T23:00:00+0900");
    const updatedDate = new Date(date);
    calendar.updateDateByTimeString(updatedDate, "12:30");
    expect(updatedDate).toEqual(new Date("2022-11-27T12:30:00+0900"));
  });
  it("if date === '2022-11-27T23:00:00+0900' and timeStr === '12' then returned date === '2022-11-27T12:00:00+0900'", () => {
    const date = new Date("2022-11-27T23:00:00+0900");
    const updatedDate = new Date(date);
    calendar.updateDateByTimeString(updatedDate, "12");
    expect(updatedDate).toEqual(new Date("2022-11-27T12:00:00+0900"));
  });
  it("if date === '2022-11-27T23:00:00+0900' and timeStr === '' then returned date === '2022-11-27T23:00:00+0900'", () => {
    const date = new Date("2022-11-27T23:00:00+0900");
    const updatedDate = new Date(date);
    calendar.updateDateByTimeString(updatedDate, "");
    expect(updatedDate).toEqual(new Date("2022-11-27T23:00:00+0900"));
  });
});

describe("unit tests for isHoliday()", () => {
  it("if argDate === '2022-11-27T12:00:00+0900' then returned true", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const existsEventInCalendarMock = jest
      .spyOn(calendar, "existsEventInCalendar")
      .mockReset()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    expect(calendar.isHoliday(new Date("2022-11-27T12:00:00+0900"))).toBe(true);
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(1);
    expect(existsEventInCalendarMock).toHaveBeenCalledTimes(2);
  });
  it("if argDate === '2022-11-27T12:00:00+0900' and calendarIds === ['dummy_calendar_id_1'] then returned false", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const existsEventInCalendarMock = jest
      .spyOn(calendar, "existsEventInCalendar")
      .mockReset()
      .mockReturnValueOnce(false);
    expect(
      calendar.isHoliday(new Date("2022-11-27T12:00:00+0900"), [
        "dummy_calendar_id_1",
      ])
    ).toBe(false);
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(0);
    expect(existsEventInCalendarMock).toHaveBeenCalledTimes(1);
  });
  it("if argDate === '2022-11-27T12:00:00+0900' and calendarIds === ['dummy_calendar_id_2'] then returned true", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const existsEventInCalendarMock = jest
      .spyOn(calendar, "existsEventInCalendar")
      .mockReset()
      .mockReturnValueOnce(true);
    expect(
      calendar.isHoliday(new Date("2022-11-27T12:00:00+0900"), [
        "dummy_calendar_id_2",
      ])
    ).toBe(true);
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(0);
    expect(existsEventInCalendarMock).toHaveBeenCalledTimes(1);
  });
});

describe("unit tests for convertBusinessDaysToDate()", () => {
  it("if year === 2022 and month === 12 and businessDays === 3 then returned Date('2022-12-05T00:00:00+0900')", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const isHolidayMock = jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    expect(calendar.convertBusinessDaysToDate(2022, 12, 3)).toEqual(
      new Date("2022-12-05T00:00:00+0900")
    );
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(1);
    expect(isHolidayMock).toHaveBeenCalledTimes(5);
  });
  it("if year === 2022 and month === 12 and businessDays === 4 and calendarIds === ['dummy_calendar_id_1'] then returned Date('2022-12-04T00:00:00+0900')", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const isHolidayMock = jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    expect(
      calendar.convertBusinessDaysToDate(2022, 12, 4, ["dummy_calendar_id_1"])
    ).toEqual(new Date("2022-12-04T00:00:00+0900"));
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(0);
    expect(isHolidayMock).toHaveBeenCalledTimes(4);
  });
  it("if year === 2022 and month === 12 and businessDays === 4 and calendarIds === ['dummy_calendar_id_2'] then returned Date('2022-12-06T00:00:00+0900')", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const isHolidayMock = jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    expect(
      calendar.convertBusinessDaysToDate(2022, 12, 4, ["dummy_calendar_id_2"])
    ).toEqual(new Date("2022-12-06T00:00:00+0900"));
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(0);
    expect(isHolidayMock).toHaveBeenCalledTimes(6);
  });
});

describe("unit tests for getNextDate()", () => {
  it("if argDate==Date('2022-12-09T12:00:00+0900') and timeInterval==1440 and exceptHolidays==true and calendarIds==undefined then return Date('2022-12-12T12:00:00+0900')", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const isHolidayMock = jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const getOpeningTimeMock = jest
      .spyOn(settings, "getOpeningTime")
      .mockReset()
      .mockReturnValue("09:00:00");
    const getClosingTimeMock = jest
      .spyOn(settings, "getClosingTime")
      .mockReset()
      .mockReturnValue("18:00:00");
    expect(
      calendar.getNextDate(
        new Date("2022-12-09T12:00:00+0900"),
        1440,
        true,
        undefined
      )
    ).toEqual(new Date("2022-12-12T12:00:00+0900"));
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(1);
    expect(isHolidayMock).toHaveBeenCalledTimes(3);
    expect(getOpeningTimeMock).toHaveBeenCalledTimes(1);
    expect(getClosingTimeMock).toHaveBeenCalledTimes(1);
  });
  it("if argDate==Date('2022-12-09T12:00:00+0900') and timeInterval==360 and exceptHolidays==true and calendarIds==undefined then return Date('2022-12-09T18:00:00+0900')", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const isHolidayMock = jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(false);
    const getOpeningTimeMock = jest
      .spyOn(settings, "getOpeningTime")
      .mockReset()
      .mockReturnValue("09:00:00");
    const getClosingTimeMock = jest
      .spyOn(settings, "getClosingTime")
      .mockReset()
      .mockReturnValue("18:00:00");
    expect(
      calendar.getNextDate(
        new Date("2022-12-09T12:00:00+0900"),
        360,
        true,
        undefined
      )
    ).toEqual(new Date("2022-12-09T18:00:00+0900"));
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(1);
    expect(isHolidayMock).toHaveBeenCalledTimes(1);
    expect(getOpeningTimeMock).toHaveBeenCalledTimes(1);
    expect(getClosingTimeMock).toHaveBeenCalledTimes(1);
  });
  it("if argDate==Date('2022-12-09T12:00:00+0900') and timeInterval==361 and exceptHolidays==true and calendarIds==undefined then return Date('2022-12-12T09:00:00+0900')", () => {
    const getCalendarIdsMock = jest
      .spyOn(calendar, "getCalendarIds")
      .mockReset()
      .mockReturnValue(["dummy_calendar_id_1", "dummy_calendar_id_2"]);
    const isHolidayMock = jest
      .spyOn(calendar, "isHoliday")
      .mockReset()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const getOpeningTimeMock = jest
      .spyOn(settings, "getOpeningTime")
      .mockReset()
      .mockReturnValue("09:00:00");
    const getClosingTimeMock = jest
      .spyOn(settings, "getClosingTime")
      .mockReset()
      .mockReturnValue("18:00:00");
    expect(
      calendar.getNextDate(
        new Date("2022-12-09T12:00:00+0900"),
        361,
        true,
        undefined
      )
    ).toEqual(new Date("2022-12-12T09:00:00+0900"));
    expect(getCalendarIdsMock).toHaveBeenCalledTimes(1);
    expect(isHolidayMock).toHaveBeenCalledTimes(3);
    expect(getOpeningTimeMock).toHaveBeenCalledTimes(1);
    expect(getClosingTimeMock).toHaveBeenCalledTimes(1);
  });
});
