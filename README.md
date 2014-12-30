#Tsu Helper

- Author: [Armando Lüscher](https://www.tsu.co/noplanman)
- Version: 2.0 ([changelog](https://github.com/noplanman/tsu-helper/blob/master/CHANGELOG.md))
- Short-Link for sharing: https://j.mp/tsu-helper
- Disclaimer: Tsu Helper script is in no way affiliated with Tsu LLC. Use it at your [own risk](#known-issues).

##Details
The Tsu Helper script adds a bunch of tweaks to make your Tsu experience more user friendly.

###About
![Menu item][menu-item]

The menu item opens an "About" window which shows the current version number, a link to this manual, donation buttons (PayPal & Tsu) and a card to easily Follow me or become a Friend.

![About window][about-window]

###Settings
When opening the "About" window, there is a settings button on the top right (little cog, see picture above).
This button opens the Settings window which offers the possibility to activate only the desired tweaks.
To find out what each feature does exactly, see further down where they are explained individually.

NOTE: The Friends and Followers Manager cannot be disabled, as it has no background activity unless used.

![Settings window][settings-window]

Settings
- Hide Ads: Show or Hide all the Advertisements. They are still loaded and displayed, but moved out of view.
- Enable Quick Mentions: Add Quick Mention links to comments and replies.
- Emphasize Nested Replies: Emphasize the parent of nested comment replies, to make them more visible.
- Check Social Networks: Check if your new post is being shared to your connected Social Network accounts.
- Check Max. Hashtags & Mentions: Check if the maximum number of Hashtags & Mentions has been reached before posting.
- Show Friends and Followers: Where to display Friends and Followers counts.
  - No Links (disabled): Disable this feature.
  - All Links: Load Friends and Followers count on all possible links.
  - Hover Cards Only: Only load the Friends and Followers counts when hovering over the username of a post or comment. (This option still displays counts on all other pages!)

Buttons
- Save: Save the settings and reload the page for them to take effect.
- Back: Back to the About window, without saving the settings.
- Defaults: Reset settings to default values. (The settings must be saved to take effect or can be cancelled by choosing the "Back" button.)

###FFC (Friends and Followers Counts)

---

IMPORTANT! Check the [known issues](#known-issues) below.

---

Automatically display the number of Friends (1st number) and Followers (2nd number) a user has, right next to / under their user name.
Gain control over who has how many Friends and Followers with a quick glance.
Furthermore, it generates links to all users displayed on the "Discover Users" page, to make it easier to check out the profiles.

The details get loaded automatically when the page gets loaded and when new posts, comments or messages get added.

FFC works on the Home Feed, User Diary, Messages and Discover Users pages.

![FFC Username][ffc-username]
- FFC being displayed next to a username.

![FFC Hover Card][ffc-hover-card]
- Displaying FFC on a user card when hovering over a username.

![FFC Discover][ffc-discover]
- A card on the "Discover Users" page.

###FFM (Friends and Followers Manager)

---

IMPORTANT! Check the [known issues](#known-issues) below.

---

Take more control of your Friends and Followers, including Friend requests you have sent or received.

Find all the Friends you are also Following. You can then automatically Unfollow all Friends, as doing both is unnecessary and uses up your precious Follows.

To start the FFM, simply visit your Friends, Followers or Following tabs on your Profile and click the "F&F Manager" link.

![FFM Header][ffm-header]
- Search for pending sent and received Friend Requests.
- Search for Friends you are also Following.
- Automatically Unfollow all Friends.
- Show all found entries and filter them.

![Correct Count][correct-count]
- Display the correct number of Friends, Followers or users Following you.

###Quick-Mention in comments and replies
Quick-Mention adds easy to use links to each comment or reply, which makes mentioning users a breeze!

Mention the user who's post you are replying to, or the user who's reply you are replying to.

![Quick-Mention for Comment][mention-comment]
- Simply hover over your profile picture and select the Quick-Mention button ("@ >").

Mention any user from the comments list to easily add their mention to your comment or reply.

![Quick-Mention for Reply][mention-reply]
- First select the comment or reply text input, then hover over the comment of the user you would like to mention and click the Quick-Mention button ("@ +").

###Auto-focus
Auto-focusing the correct input fields is a great help to speed up your posting, commenting and messaging.

- The post message input, so you can instantly start typing a post.

![Auto-Focus Title][auto-focus-title]
- The title input, when adding a title.
- The message recipient input, when writing a new message.
- The message text input, when answering a message.

###Basic posting content checks
When creating a new post, there are a few things to remember before clicking the "Post" button.

![Popup: Social Network Sharing Reminder][popup-social-networks]
- Popup warning when posting without sharing to your connected social network accounts.

![Popup: Mention or Hashtag Limits Exceeded][popup-mention-hashtag-limits]
- Popup warning when too many #hashtags or @mentions have been used. (Limit is 10 each)

###Make things easier for the eye
A few things are not so pleasent to look at and some things are difficult to see.
- Messages get displayed with correct line breaks to make them easier to read.

![Emphasize Nested Replies][nested-replies-parent]
- Comments with nested replies, the "Reply (n)" link is emphasized, to show there are nested replies.

###Open single posts easily
Opening single posts is easier than ever!

![Open Single Post][open-single-post]
- Just double click the header are of any post or share to open the single post itself.
- To open the single post in a new window or tab, hold down the "Shift" key while double clicking.

###Stay up to date!
Whenever a new update is available, you will be notified visually. The username link on the top right will get an orange background and the [About window](#about) will get a new button, making your update just 1 click away.

![Update Notification][update-notification]

##Installation

###With Plugin (recommended)
1. Which browser?
  - Firefox: Install the [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) plugin.
  - Chrome: Install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) plugin.
  - Opera: Install the [ViolentMonkey](https://addons.opera.com/en/extensions/details/violent-monkey/) extension.
  - Safari (untested): Install the [NinjaKit](http://www.pimpmysafari.com/items/NinjaKit-GreaseKit-for-Safari/) extension.
  - Internet Explorer (experimental): Install [TrixIE](http://download3.fyxm.net/2/2588/TrixieSetup.msi). Restart Internet Explorer after the installation is complete. Save the script (from a link below) to 'C:\Program Files\Bhelpuri\Trixie\Scripts' (or equivalent). In Internet Explorer, you can now activate the script in the 'Tools->Trixie Options' menu.

2. Tsu Helper script can be found here (just choose any one)
  - https://greasyfork.org/en/scripts/6372-tsu-helper
  - https://openuserjs.org/scripts/noplanman/Tsu_Helper

###~~With Bookmarklet~~
As of version 1.5 the bookmarklet is not supported any more because the script has become too big!

##Any ideas / Feature requests / Comments?
If you have any ideas for me or things you would like to see in this script, go ahead and create a [New Issue](https://github.com/noplanman/tsu-helper/issues/new) and let me know!
Any comment is highly appreciated, thanks!

##Tested with
- Firefox 33
- Chrome 39
- Opera 26

##Known Issues
Using the “Friends and Followers Manager (FFM)“ or the “Friends and Followers Counts (FFC)“ may cause Tsu to become temporarily unavailable. This is due to the amount of information that is being requested from Tsu. Only use the FFM if you don't have that many friends. I'm working hard at making this work for everybody but unfortunately I have my hands tied at the moment, as Tsu has a few restrictions.
If you do risk it and get a "503 Service Unavailable" message, it may take a few hours to regain access. Just be patient.

Use them at your own risk!


[correct-count]: https://github.com/noplanman/tsu-helper/raw/master/assets/correct-count.png "Correct Count"
[ffm-header]: https://github.com/noplanman/tsu-helper/raw/master/assets/ffm-header.png "FFM Header"
[mention-comment]: https://github.com/noplanman/tsu-helper/raw/master/assets/mention-comment.png "Quick-Mention for Comment"
[mention-reply]: https://github.com/noplanman/tsu-helper/raw/master/assets/mention-reply.png "Quick-Mention for Reply"
[nested-replies-parent]: https://github.com/noplanman/tsu-helper/raw/master/assets/nested-replies-parent.png "Emphasize Nested Replies"
[open-single-post]: https://github.com/noplanman/tsu-helper/raw/master/assets/open-single-post.png "Open Single Post"
[auto-focus-title]: https://github.com/noplanman/tsu-helper/raw/master/assets/auto-focus-title.png "Auto-Focus Title"
[message-line-breaks]: https://github.com/noplanman/tsu-helper/raw/master/assets/message-line-breaks.png "Message Line Breaks"
[popup-mention-hashtag-limits]: https://github.com/noplanman/tsu-helper/raw/master/assets/popup-mention-hashtag-limits.png "Popup: Mention or Hashtag Limits Exceeded"
[popup-social-networks]: https://github.com/noplanman/tsu-helper/raw/master/assets/popup-social-networks.png "Popup: Social Network Sharing Reminder"
[menu-item]: https://github.com/noplanman/tsu-helper/raw/master/assets/menu-item.png "Menu item"
[menu-item-update]: https://github.com/noplanman/tsu-helper/raw/master/assets/menu-item-update.png "Menu item has update"
[update-notification]: https://github.com/noplanman/tsu-helper/raw/master/assets/update-notification.png "Update Notification"
[about-window]: https://github.com/noplanman/tsu-helper/raw/master/assets/about-window.png "About window"
[settings-window]: https://github.com/noplanman/tsu-helper/raw/master/assets/settings-window.png "Settings window"
[ffc-username]: https://github.com/noplanman/tsu-helper/raw/master/assets/ffc-username.png "FFC Username"
[ffc-hover-card]: https://github.com/noplanman/tsu-helper/raw/master/assets/ffc-hover-card.png "FFC Hover Card"
[ffc-discover]: https://github.com/noplanman/tsu-helper/raw/master/assets/ffc-discover.png "FFC Discover"
