#Tsu Helper

Author: Armando Lüscher

Version: 1.3 ([changelog](https://github.com/noplanman/tsu-helper/blob/master/CHANGELOG.md))

Short Link for sharing: https://j.mp/tsu-helper

##Details

Tsu script that adds a bunch of tweaks to make Tsu more user friendly.

- NEW! Now also finds sent Friend Request that are pending.
- Shows number of found Friend Requests.
- Added Line breaks for messages.
- Made nested replies parents stand out.
- Now possible to post only a title or an image, with no text message.
- Search for pending friend requests in the Followers and Following tabs of your profile page.
- Temporary fix to autofocus text input field for messaging.
- Autofocus the message input to instantly start typing a post.
- Autofocus the title input field when adding a title.
- Open single posts by double clicking their header. (When holding the Shift key, a new window/tab opens)
- Popup warning when posting without sharing to any connected social network accounts.
- Popup warning when too many #hashtags or @mentions have been used.
- Update notification in user menu when a new version is available. The username link on the top right will get an orange background and a new menu item will appear allowing you to update easily.

##Installation

###With Plugin (recommended)

1. Which browser?
  - Firefox: Install the [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) plugin.
  - Chrome: Install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) plugin.
  - Opera: Install the [ViolentMonkey](https://addons.opera.com/en/extensions/details/violent-monkey/) extension.
  - Safari (untested): Install the [NinjaKit](http://www.pimpmysafari.com/items/NinjaKit-GreaseKit-for-Safari/) extension.
  - Internet Explorer (experimental): Install [TrixIE](http://download3.fyxm.net/2/2588/TrixieSetup.msi). Restart Internet Explorer after the installation is complete. Save the script (from a link below) to 'C:\Program Files\Bhelpuri\Trixie\Scripts' (or equivalent). In Internet Explorer, you can now activate the script in the 'Tools->Trixie Options' menu.

2. Tsu Helper script can be found here (just choose any one)
  - https://github.com/noplanman/tsu-helper/raw/master/Tsu_Helper.user.js
  - https://greasyfork.org/en/scripts/6372-tsu-helper
  - https://openuserjs.org/scripts/noplanman/Tsu_Helper

###With Bookmarklet (to give it a try)

Alternatively, you can just create a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) in your browser's bookmarks toolbar to execute the script on the current Tsu page you're on.

1. Right click you bookmarks toolbar and choose "New Bookmark" or open your bookmarks panel and choose "New Bookmark".
2. Give it a name (e.g. Tsu Helper) and in the location / destination field add the whole line you can find [here](https://github.com/noplanman/tsu-helper/raw/master/Tsu_Helper_Bookmarklet.txt).
3. Visit Tsu and click on the newly created bookmarklet.
4. Mind blown!

*Note: With this method, you will have to click the bookmark / run the bookmarklet every time the page is reloaded. Therefore, the plugin variant is highly recommended.*

*Note: Depending on your browser and its version, this method may not possible. No fix possible for the ones that don't support long bookmarklets.*


##Any Ideas / Feature requests / Comments?

If you have any ideas for me or things you would like to see in this script, just create a [New Issue](https://github.com/noplanman/tsu-helper/issues/new) and let me know!
Any comment is highly appreciated, thanks!


##Tested with

- Firefox 33.1.1
- Chrome 39.0.2171.71
- Opera 26.0.1656.24