# PushyReminder

This is a Google Apps Script that will permanently keep reminding persons on chat apps (Slack and Chatwork) who haven't completed the task until the task is complete.
It frees humanity from unproductive tasks that repeatedly remind unresponsive persons.

<img width="491" alt="pushy-reminder-example" src="https://user-images.githubusercontent.com/2719533/211297547-12ef1e0e-5b2b-40f3-9c87-ea0eac5780d0.png">

## Requirements

- Install [clasp](https://github.com/google/clasp#install) and settings it.
- Run `clasp login`

## Setup (with Slack)

1. Build and deploy the GAS.

```.sh
$ ./setup.sh
```

2. Open the newly created spreadsheet "PushyReminder" in Google Sheets.
3. Click `File > Import`, then replace spreadsheet by `post-management-sheets-template.xlsx`.
4. Create a Slack app on [slack api > Your Apps](https://api.slack.com/apps)
5. Add the following 12 scopes to the Slack app's "Bot Token Scopes".
   1. channels:history
   2. channels:read
   3. chat:write
   4. chat:write.customize
   5. groups:history
   6. groups:read
   7. im:history
   8. im:read
   9. mpim:history
   10. mpim:read
   11. usergroups:read
   12. users:read
6. Install the Slack app on your Slack workspace.
7. Add the Slack app to the channel you want the app to post messages to.
8. Get the `Bot User OAuth Token` of the Slack app.
9. Set up the posting schedule, posting content, etc..., by editing the post management sheets.

## How to use the post management sheets

Set up the posting schedule, posting content, etc... in the following four sheets.

- main
- holiday_calendars
- completion_keywords
- settings

Edit these sheets by referring definitions on the tables below.

_Table1: main sheet_
Column | Parameter | Description
-- | -- | --
A | No. | This is an administrative number. Enter an integer greater than or equal to 1. Duplication is not allowed.
B | Years | A list of "years" PushyReminder posts messages to. Enter the year numbers separated by commas. If "_" is included in the list, it will be posted repeatedly every year.
C | Months | A list of "months" PushyReminder posts messages to. Enter numbers from 1 to 12 separated by commas. If "_" is included in the list, it will be posted repeatedly every month.
D | Days | Posting date of the message. Enter an integer between 1 and 31.
E | Except holidays | A flag that determines whether to post on holidays. Enter TRUE or FALSE. If FALSE, post even on holidays. If TRUE, do not post on holidays. Also, if TRUE, interpret the values in column D as "business days" excluding holidays. For example, entering "1" in column D and "TRUE" in column E will post on the first business day of the specified month.
F | Sending time | The "time" to post the message. Enter the hour (hh), minute (mm), and second (ss) separated by ":" (enter in the format hh:mm:ss). Minutes (mm) and seconds (ss) can be omitted. For example, if you enter "12:00" in column E, PushyReminder will post at 12:00 PM.
G | Channel | Enter the name of the channel to post the message to.
H | Send to | Enter the message destinations ("member ID", "channel", "here", etc.) separated by commas. Here, "member ID" is an ID that can be obtained from "Copy member ID" in the user's profile field in Slack.
I | Message | The content of the message to send. Please enter the details of the task you want to request.
J | Waiting minutes | Wait time in minutes before sending reminder message.
K | Reminder message | Enter a reminder message to be sent periodically to persons who have not completed the task. If you do not enter anything, the task status will not be checked and no reminder message will be sent.
L | Not remind to | Enter the "member ID" of the person you want to exclude from the message recipients in column H. If you enter "channel" in column H, you will basically target all participants in the channel entered in column G and keep sending the reminder message in column K to those who have not completed the task. However, by entering a specific person's "member ID" in this column, you can exclude that person from being sent reminders.
M | disabled | A flag to temporarily disable post settings. Enter "TRUE" or "FALSE". If "TRUE", the setting is temporarily disabled and can be forced to stop sending the message defined in that row. If nothing is entered, it is interpreted as "FALSE (enabled)".

_Table2: holiday_calendars sheet_
Column | Possible values | Description
-- | -- | --
A | Calendar ID | Calendar ID of Google Calendar. If the calendar contains events, days with those events are interpreted as holidays.

_Table3: completion_keywords sheet_
Column | Possible values | Description
-- | -- | --
A | Completion keyword | People can tell PushyReminder of task completions by posting comments containing the words defined here in the thread of the post in Slack.

_Table4: settings sheet_
Column | Possible values | Description
-- | -- | --
A | Configuration parameter's name | Enter the name of the configuration parameter that controls the behavior of PushyReminder.
B | Configuration parameter's value | Enter the value of the configuration parameter that controls the behavior of PushyReminder.

The list of configuration parameters that can be set in the settings sheet is as shown in the table below.

_Table5: Configuration parameters on settings sheet_
Name | Possible values | Description
-- | -- | --
BOT_NAME | Any string can be set. | The name of the Slack app that posts messages to Slack. The initial value is "PushyReminder".
ACTIVE_CHAT_APP | "slack" or "chatwork" can be set. | The name of the chat app to post the message to.
SLACK_BOT_USER_OAUTH_TOKEN | Set the string of "Bot User OAuth Token" generated when installing the Slack app in Slack's Workspace. | Authentication token for the Slack app that posts the message. **It is required if ACTIVE_CHAT_APP == "slack".**
SLACK_ICON_EMOJI | Slack's emoji code can be set. | This is the icon (emoji) of the Slack app to post messages. ":spiral_calendar_pad:" is the default value.
CHATWORK_API_TOKEN | Set the string of "API Token" available from [this site](https://developer.chatwork.com/docs). | Authentication token for the Chatwork API that posts the message. **It is required if ACTIVE_CHAT_APP == "chatwork".**
TIME_INTERVAL | An integer greater than or equal to 1 can be set. | Time interval for sending reminder messages to persons who have not responded to the task. The value unit is "minutes". The initial value is "1440 (= 24 hours)".
TIME_INTERVAL_DECAY | A value greater than 1 can be set. | This is a parameter for gradually shortening the interval between sending reminder messages. For example, a setting of 2 will reduce the send time interval by a factor of two each time a reminder message is sent. A setting of "3" reduces it by a factor of three. 1 means "no change". The initial value is "1".
TIME_INTERVAL_MIN | An integer greater than or equal to 1 and less than or equal to TIME_INTERVAL can be set. | The minimum time interval for sending reminder messages. If you set a value that exceeds TIME_INTERVAL, it will be interpreted as the same value as TIME_INTERVAL.
MAX_REPEAT_COUNT | An integer greater than or equal to 0 can be set. | The maximum number of times to send reminder messages. For example, if you set 3, the reminder message will be sent repeatedly up to 3 times. 0 means "no upper limit". The initial value is "0".
OPENING_TIME | You can set the time from 00:00:00 to 23:59:59. | This is the start time of the time period during which reminder messages can be sent. Send times before OPENING_TIME are replaced with OPENING_TIME. The initial value is "00:00:00".
CLOSING_TIME | You can set the time from OPENING_TIME to 23:59:59. | This is the end time of the period during which reminder messages can be sent. Send times after CLOSING_TIME will be replaced with OPENING_TIME on the next day (or next business day). The initial value is "23:59:59".
DEBUG | Can be set to TRUE or FALSE. | Parameter to set ON/OFF of debug mode for developers. If FALSE, debug mode is OFF. If TRUE, debug mode will be ON. If the debug mode is OFF, set a trigger for sending on GAS for messages scheduled to be sent the next day. If the debug mode is ON, set the trigger for sending on GAS for the message scheduled to be sent on the day. The initial value is FALSE(OFF).

**SLACK_BOT_USER_OAUTH_TOKEN is required if ACTIVE_CHAT_APP == "slack".**
**CHATWORK_API_TOKEN is required if ACTIVE_CHAT_APP == "chatwork".**
Other parameters are optional.
