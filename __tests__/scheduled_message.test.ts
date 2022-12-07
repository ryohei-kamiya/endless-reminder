import * as sm from "../src/scheduled_message";

describe("unit tests for convertReceiverStringToArray()", () => {
  it("if args is '<!channel>,<@dummy>' then return ['channel', 'dummy']", () => {
    expect(sm.convertReceiverStringToArray("<!channel>,<@dummy>")).toEqual([
      "channel",
      "dummy",
    ]);
  });
});
