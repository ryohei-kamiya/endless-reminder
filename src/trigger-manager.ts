// ref. https://stackoverflow.com/questions/32697653/how-can-i-pass-a-parameter-to-a-time-based-google-app-script-trigger

export namespace triggerManager {
  var RECURRING_KEY = "recurring";
  var ARGUMENTS_KEY = "arguments";

  /**
   * Set the arguments for the given trigger.
   *
   * @param {GoogleAppsScript.Script.Trigger} trigger - The trigger for which the arguments are set up
   * @param {*} functionArguments - The arguments which should be stored for the function call
   * @param {boolean} recurring - Whether the trigger is recurring; if not the
   *   arguments and the trigger are removed once it called the function
   */
  export const setTriggerArguments = (
    trigger: GoogleAppsScript.Script.Trigger,
    functionArguments: any,
    recurring: boolean
  ) => {
    const triggerUid = trigger.getUniqueId();
    const triggerData: any = {};
    triggerData[RECURRING_KEY] = recurring;
    triggerData[ARGUMENTS_KEY] = functionArguments;
    PropertiesService.getScriptProperties().setProperty(
      triggerUid,
      JSON.stringify(triggerData)
    );
  };

  /**
   * Function which should be called when a trigger runs a function. Returns the stored arguments
   * and deletes the properties entry and trigger if it is not recurring.
   *
   * @param {string} triggerUid - The trigger id
   * @return {*} - The arguments stored for this trigger
   */
  export const handleTriggered = (triggerUid: string): any => {
    const scriptProperties = PropertiesService.getScriptProperties();
    const triggerUidValue: string =
      scriptProperties.getProperty(triggerUid) ?? "";
    const triggerData = JSON.parse(triggerUidValue);

    if (!triggerData[RECURRING_KEY]) {
      triggerManager.deleteTriggerByUid(triggerUid);
    }

    return triggerData[ARGUMENTS_KEY];
  };

  /**
   * Deletes trigger arguments of the trigger with the given id.
   *
   * @param {string} triggerUid - The trigger id
   */
  export const deleteTriggerArguments = (triggerUid: string) => {
    PropertiesService.getScriptProperties().deleteProperty(triggerUid);
  };

  /**
   * Deletes a trigger with the given id and its arguments.
   * When no project trigger with the id was found only an error is
   * logged and the function continues trying to delete the arguments.
   *
   * @param {string} triggerUid - The trigger id
   */
  export const deleteTriggerByUid = (triggerUid: string) => {
    if (
      !ScriptApp.getProjectTriggers().some(function (trigger) {
        if (trigger.getUniqueId() === triggerUid) {
          ScriptApp.deleteTrigger(trigger);
          return true;
        }

        return false;
      })
    ) {
      console.error("Could not find trigger with id '%s'", triggerUid);
    }

    triggerManager.deleteTriggerArguments(triggerUid);
  };

  /**
   * Deletes a trigger and its arguments.
   *
   * @param {GoogleAppsScript.Script.Trigger} trigger - The trigger
   */
  export const deleteTrigger = (trigger: GoogleAppsScript.Script.Trigger) => {
    ScriptApp.deleteTrigger(trigger);
    triggerManager.deleteTriggerArguments(trigger.getUniqueId());
  };
}
