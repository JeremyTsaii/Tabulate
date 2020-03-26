# Tabulate

Tabulate is a Google Chrome Extension that is meant to help users who often leave many Chrome tabs open. Chrome tabs are notorious for taking up your CPU and memory, but often users do not want to lose the the pages that they were looking at. Tabulate lets you save these tab sessions and easily reopen them without them being active and hogging up your resources! Treat it like a more sophisticated favorites/bookmarks application.

Check Tabulate out on the Chrome Web Store [here.](https://chrome.google.com/webstore/detail/tabulate/hbabjcmngkoppjaibgbpdbbcfhhmakmo)

![Tabulate meme](https://github.com/JeremyTsaii/Images/blob/master/meme.JPG)

### Using Tabulate

![Tabulate popup](https://github.com/JeremyTsaii/Images/blob/master/popup.png)

To open the Tabulate popup menu, click on the Tabulate icon in the upper right corner of Chrome. 

To save your current tab, click on the "Save Tab" button and choose a unique name for your session.

To save all the tabs in your current window, click on the "Save window" button and choose a unique name for your session.

To open the tabs saved within a session, click on the corresponding session row.

To edit a session name, click on the blue pencil icon at the right side of the session.

To delete a session from Tabulate, click on the red trashcan icon at the right side of the session.

To open settings, click on the gear icon. This will take you to a new page containing the settings for Tabulate.

The default settings are to ask for confirmation before deleting a session, keep the tab(s) that you have just saved open, open session tabs in the current window, and do nothing after opening a session. These settings can be changed by navigating to the settings page and checking the appropriate boxes/buttons.

Happy Tabulating!

### How Was This Developed?

Tabulate is written in vanilla JavaScript, HTML, and CSS. It relies heavily on the Chrome Storage API to remember saved sessions and user preferences. Since the core functionality of Tabulate resides in the popup and the popup is continually opened/closed by the user, the popup must be restored by grabbing data from Chrome Storage. This is also true for the settings popup. 

### Local Development and Contribution

If you have any changes you would like us to implement, please submit an issue and we will look at it. If there is something you would like to implement yourself, feel free to submit a pull request. 

Local development/testing:
1. Clone this repository onto your machine
2. Go to Google Chrome settings, then click on extensions
3. Turn on Developer mode
4. Click the "Load unpacked" button and select the Tabulate folder

Now you can develop locally and see your changes live on the Tabulate extension.

### Planned Future Implementations

* Sorting by name, date last opened
* Change existing names array to dictionary for faster lookup
* Ability to create folders/dividers
* Ability to color code rows
* Copy tabs from a session to another sessoin
* Add specific tabs within a window to a session instead of only current window/tab
* Search for sessions by name

