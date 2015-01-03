// ==UserScript==
// @name        Tsu Helper
// @namespace   tsu-helper
// @description Tsu script that adds a bunch of tweaks to make Tsu more user friendly.
// @include     http://*tsu.co*
// @include     https://*tsu.co*
// @version     2.1
// @author      Armando Lüscher
// @grant       none
// ==/UserScript==

/**
 * For changelog see https://j.mp/tsu-helper-changelog
 */

/**
 * How nice of you to visit! I've tried to make this code as clean as possible with lots of
 * comments for everybody to learn from.
 *
 * Because that is what this life is about, to learn from each other and to grow together!
 *
 * If you have any questions, ideas, feature requests, (pretty much anything) about it, just ask :-)
 *
 * Simply visit the GitHub page here: https://j.mp/tsu-helper-issues and choose "New Issue".
 * I will then get back to you as soon as I can ;-)
 */

// Make sure we have jQuery loaded.
if ( ! ( 'jQuery' in window ) ) { return; }

// Run everything as soon as the DOM is set up.
jQuery( document ).ready(function( $ ) {

  // Display Debug options? (for public).
  var publicDebug = false;

  /**
   * Base64 library, just decoder: http://www.webtoolkit.info/javascript-base64.html
   * @param {string} e Base64 string to decode.
   */
  function base64_decode(e){var t='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';var n='';var r,i,s;var o,u,a,f;var l=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,'');while(l<e.length){o=t.indexOf(e.charAt(l++));u=t.indexOf(e.charAt(l++));a=t.indexOf(e.charAt(l++));f=t.indexOf(e.charAt(l++));r=o<<2|u>>4;i=(u&15)<<4|a>>2;s=(a&3)<<6|f;n=n+String.fromCharCode(r);if(a!=64){n=n+String.fromCharCode(i);}if(f!=64){n=n+String.fromCharCode(s);}}return n;}

  // Check if a string starts with a certain string.
  'function'!=typeof String.prototype.startsWith&&(String.prototype.startsWith=function(t){return this.slice(0,t.length)==t;});

  // Check if a string ends with a certain string.
  'function'!=typeof String.prototype.endsWith&&(String.prototype.endsWith=function(t){return this.slice(-t.length)==t;});

  // Check if a string contains a certain string.
  'function'!=typeof String.prototype.contains&&(String.prototype.contains=function(t){return this.indexOf(t)>=0;});

  // Add stringify to jQuery (https://gist.github.com/chicagoworks/754454).
  jQuery.extend({stringify:function(r){if('JSON'in window)return JSON.stringify(r);var n=typeof r;if('object'!=n||null===r)return'string'==n&&(r='"'+r+'"'),String(r);var t,i,e=[],o=r&&r.constructor==Array;for(t in r)i=r[t],n=typeof i,r.hasOwnProperty(t)&&('string'==n?i='"'+i+'"':'object'==n&&null!==i&&(i=jQuery.stringify(i)),e.push((o?'':'"'+t+'":')+String(i)));return(o?'[':'{')+String(e)+(o?']':'}');}});

  // Serialize form data to save settings (http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery).
  $.fn.serializeObject=function(){var i={},e=this.serializeArray();return $.each(e,function(){void 0!==i[this.name]?(i[this.name].push||(i[this.name]=[i[this.name]]),i[this.name].push(this.value||"")):i[this.name]=this.value||"";}),i;};

  /**
   * Like WP, return "selected" attribute text.
   * @param  {string} val1 Value to compare.
   * @param  {string} val2 Value to compare with.
   * @return {string}      "Selected" text or nothing.
   */
  function selected( val1, val2 ) {
    return ( val1 === val2 ) ? ' selected="selected"' : '';
  }

  /**
   * Like WP, return "checked" attribute text.
   * @param  {string} val1 Value to compare.
   * @param  {string} val2 Value to compare with.
   * @return {string}      "Checked" text or nothing.
   */
  function checked( val1, val2 ) {
    // Compare to "true" by default.
    val2 = ( undefined === val2 ) ? true : val2;
    return ( val1 === val2 ) ? ' checked="checked"' : '';
  }


  /**
   * All settings related methods and variables.
   */
  var Settings = {
    // All available settings with default values.
    settingsDefault : {
      debugLevel   : 'disabled',  // Debugging level. (disabled,[l]og,[i]nfo,[w]arning,[e]rror)
      hideAds      : false,       // Hide all ads.
      showFFC      : 'hovercard', // Show Friends and Followers count. (disabled,all,hovercard)
      quickMention : true,        // Add quick mention links.
      emphasizeNRP : true,        // Emphasize nested replies parents.
      checkSocial  : true,        // Check the social network sharing.
      checkMaxHM   : true         // Check for maximum hashtags and mentions.
    },

    // Init with default settings on "load".
    settings : {},

    // Name used for the settings cookie.
    cookieName : 'tsu-helper-settings',

    /**
     * Set default settings.
     */
    setDefaults : function( $form ) {
      Settings.populateForm( $form, true );
    },

    /**
     * Load settings from cookie.
     */
    load : function() {
      // Init with defaults and add all loaded settings.
      $.extend( true, Settings.settings, Settings.settingsDefault );

      var savedJSON = $.cookie( Settings.cookieName );
      if ( savedJSON ) {
        $.extend( Settings.settings, $.parseJSON( savedJSON ) );
      }

      return Settings.settings;
    },

    /**
     * Populate the passed form with the current settings.
     * @param {jQuery}  $form    The form to be populated.
     * @param {boolean} defaults Load the default values?
     */
    populateForm : function( $form, defaults ) {
      if ( $form ) {
        for ( var setting in Settings.settings ) {
          if ( Settings.settings.hasOwnProperty( setting ) ) {
            var $input = $( '[name=' + setting + ']', $form );
            var val = ( defaults ) ? Settings.settingsDefault[ setting ] : Settings.settings[ setting ];
            if ( 'checkbox' === $input.attr( 'type' ) ) {
              $input.prop( 'checked', val );
            } else {
              $input.val( val );
            }
          }
        }
      }
    },

    /**
     * Save settings to cookie.
     */
    save : function( $form ) {
      // First save?
      if ( undefined === $.cookie( Settings.cookieName ) && ! confirm( 'Settings will be saved in a cookie. Ok?' ) ) {
        return false;
      }

      // If a form is passed, use those values.
      if ( $form ) {
        // Default to false and then get form settings.
        // This is necessary for checkbox inputs as they are assigned by checked state, not value.
        Settings.settings.hideAds      = false;
        Settings.settings.quickMention = false;
        Settings.settings.emphasizeNRP = false;
        Settings.settings.checkSocial  = false;
        Settings.settings.checkMaxHM   = false;

        $.extend( Settings.settings, $form.serializeObject() );
      }

      $.cookie( Settings.cookieName, $.stringify( Settings.settings ), { expires: 999, path: '/' } );
      return true;
    }
  };
  // Load settings from cookie.
  var settings = Settings.load();


  /**
   * All updater and version related variables.
   */
  var Updater = {
    // The local version.
    localVersion : 2.1,

    // The remote version (loaded in the "check" method).
    remoteVersion : null,

    // URL where to get the newest script.
    scriptURL : 'https://openuserjs.org/install/noplanman/Tsu_Helper.user.js',

    // Version details.
    versionAPIURL : 'https://api.github.com/repos/noplanman/tsu-helper/contents/VERSION',

    // Get the remote version on GitHub.
    init : function() {
      try {
        var response = $.ajax({
          type: 'GET',
          url: Updater.versionAPIURL,
          async: false
        }).fail(function() {
          doLog( 'Couldn\'t get remote version number for Tsu Helper.', 'w' );
        }).responseJSON;

        // Set the remote version.
        Updater.remoteVersion = parseFloat( base64_decode( response.content ) );
        doLog( 'Versions: Local (' + Updater.localVersion + '), Remote (' + Updater.remoteVersion + ')', 'i' );
      } catch( e ) {
        doLog( 'Couldn\'t get remote version number for Tsu Helper.', 'w' );
      }
    },

    /**
     * Is there a newer version available?
     * @return {Boolean} If there is a newer version available.
     */
    hasUpdate : function() {
      return ( Updater.remoteVersion > Updater.localVersion );
    }
  };
  // Initialise the updater to fetch the remote version.
  Updater.init();


  /**
   * TSU constants.
   */
  var TSUConst = {
    // Define the maximum number of hashtags and mentions allowed.
    maxHashtags : 10,
    maxMentions : 10,

    // Cards per page request of Friends, Followers and Following tabs.
    ffmCardsPerPage : 12
  };


  /**
   * Page related things.
   */
  var Page = {

    // The current page.
    current : '',

    /**
     * Get the current page to know which queries to load and observe and
     * also for special cases of how the Friends and Followers details are loaded.
     */
    init : function() {
      doLog( 'Getting current page.', 'i' );

      if ( $( 'body.newsfeed' ).length ) {                  Page.current = 'home';          // Home feed.
      } else if ( $( 'body.notifications.show' ).length ) { Page.current = 'notifications'; // Show notifications.
      } else if ( $( 'body.search_hashtag' ).length ) {     Page.current = 'hashtag';       // Hashtag page.
      } else if ( $( 'body.profile.diary' ).length ) {      Page.current = 'diary';         // Diary.
      } else if ( $( 'body.show_post' ).length ) {          Page.current = 'post';          // Single post.
      } else if ( $( 'body.discover' ).length ) {           Page.current = 'discover';      // Discover Users.
        Observer.queryToLoadFF  = 'body.discover .tree_child_fullname';
        // No observer necessary!
        // TODO: Also, with observer, this page goes crazy...
        Observer.queryToObserve = '';
      } else if ( $( 'body.tree' ).length ) {               Page.current = 'tree';          // Family tree.
        Observer.queryToLoadFF  = 'body.tree .tree_child_fullname';
        Observer.queryToObserve = '.tree_page';
      } else if ( $( 'body.profile.friends' ).length ) {    Page.current = 'friends';       // Friends.
      } else if ( $( 'body.profile.followers' ).length ) {  Page.current = 'followers';     // Followers.
      } else if ( $( 'body.profile.following' ).length ) {  Page.current = 'following';     // Following.
      } else if ( $( 'body.messages' ).length ) {           Page.current = 'messages';      // Messages.
        Observer.queryToLoad    = '.messages_content .message_box';
        Observer.queryToLoadFF  = '.message_box .content';
        Observer.queryToObserve = '.messages_content';
      }

      // Group queries to load.
      if ( Page.is( 'has-posts' ) ) {
        queryToLoad = '.comment';
        // Add userlinks to query?
        switch ( settings.showFFC ) {
          case 'all'       : Observer.queryToLoadFF = '.card .card_sub .info, .evac_user'; break;
          case 'hovercard' : Observer.queryToLoadFF = '.card .card_sub .info';             break;
        }
      } else if ( 'all' === settings.showFFC && Page.is( 'fff' ) ) {
        Observer.queryToLoadFF = '.card .card_sub .info';
      }

      Observer.queryToLoad += ',' + Observer.queryToLoadFF;

      doLog( 'Current page: ' + Page.current, 'i' );
    },

    /**
     * Check if the passed page is the current one.
     * @param  {string}  pages Comma seperated list of pages.
     * @return {boolean}       If the current page is in the list.
     */
    is : function( pages ) {
      // To make things easier, allow shortcuts.
      pages = pages.replace( /has-userlinks/g, 'has-posts fff messages discover tree' );
      pages = pages.replace( /has-posts/g, 'home hashtag diary post' );
      pages = pages.replace( /fff/g, 'friends followers following' );

      // Make an array.
      pages = pages.split( ' ' );

      // Is the current page in the passed page list?
      for ( var i = pages.length - 1; i >= 0; i-- ) {
        if ( Page.current === pages[i] ) {
          return true;
        }
      }
      return false;
    }
  };


  /**
   * Friends and Followers Manager.
   */
  var FFM = {

    // The total amount of pages to preload.
    totalPages : 0,

    // The real number of Friends / Followers / Following.
    totalFFFs  : 0,
    $totalFFFs : null,

    // List of active Ajax requests.
    ajaxRequests : {},

    // The current chain request.
    $ajaxChainRequest : null,

    // Is the search busy?
    busy      : false,
    chainBusy : false,

    // The number of found friend requests.
    counter : {
      fandf    : 0,
      received : 0,
      sent     : 0
    },
    filterCheckboxes : {},

    // The buttons and status text.
    $linkCancel          : null,
    $linkStart           : null,
    $statusText          : null,
    $linkUnfollowFriends : null,

    /**
     * Initialise the Friends and Followers Manager.
     */
    init : function() {
      // Make sure we're on the right page.
      if ( ! Page.is( 'fff' ) ) {
        return;
      }

      doLog( 'Loading FF Manager.', 'i' );

      // Only possible on the current users profile.
      if ( window.current_user.username === $( '.profile_details .summary .username' ).text().trim().substring( 1 ) ) {
        var $title = $( '.profiles_list .title' );

        // Get the number of pages required to load all users in the list, 12 per page.
        FFM.totalPages = Math.ceil( /\d+/.exec( $title.text() ) / TSUConst.ffmCardsPerPage ) || 1;
        doLog( 'Total number of pages to load: ' + FFM.totalPages, 'i' );
        // As this number isn't totally correct, load all the pages
        // and chain-load from the last page as far as needed.

        // Real number of FFFs.
        FFM.$totalFFFs = $( '<span/>', {
          'id'  : 'th-ffm-total-fffs',
          title : 'Correct count',
          html  : '-'
        })
        .hide() // Start hidden.
        .appendTo( $title );

        // Cancel link.
        FFM.$linkCancel = $( '<a/>', {
          'id'  : 'th-ffm-link-cancel',
          title : 'Cancel current search',
          html  : 'Cancel',
          click : function() { FFM.cancel(); }
        })
        .hide() // Start hidden.
        .appendTo( $title );

        // Start link.
        FFM.$linkStart = $( '<a/>', {
          'id'  : 'th-ffm-link-start',
          title : 'Search for pending Friend Requests and Friends you also Follow.',
          html  : 'F&F Manager',
          click : function() { FFM.start(); }
        })
        .appendTo( $title );

        // Status text to display the number of found items.
        FFM.$statusText = $( '<span/>', {
          'id' : 'th-ffm-status-text',
          html :
            '<label title="Friends also being Followed" class="th-ffm-card-fandf"><span>0</span> F&F</label>&nbsp;' +
            '<label title="Received Friend Requests" class="th-ffm-card-received"><span>0</span> received</label>&nbsp;' +
            '<label title="Sent Friend Requests" class="th-ffm-card-sent"><span>0</span> sent</label>'
        })
        .hide() // Start hidden.
        .appendTo( $title );

        // Assign checkbox clicks to show / hide results.
        $( '<input/>', { 'id' : 'th-ffm-cb-fandf',    type : 'checkbox', checked : 'checked' } ).change( function() { FFM.filter( 'fandf',    this.checked ); } ).prependTo( FFM.$statusText.find( '.th-ffm-card-fandf' ) );
        $( '<input/>', { 'id' : 'th-ffm-cb-received', type : 'checkbox', checked : 'checked' } ).change( function() { FFM.filter( 'received', this.checked ); } ).prependTo( FFM.$statusText.find( '.th-ffm-card-received' ) );
        $( '<input/>', { 'id' : 'th-ffm-cb-sent',     type : 'checkbox', checked : 'checked' } ).change( function() { FFM.filter( 'sent',     this.checked ); } ).prependTo( FFM.$statusText.find( '.th-ffm-card-sent' ) );

        FFM.$linkUnfollowFriends = $( '<a/>', {
          'id'  : 'th-ffm-unfollow-friends',
          title : 'Unfollow all Friends on this page',
          html  : 'unfollow',
          click : function() { FFM.unfollowFriends(); }
        })
        .hide() // Start hidden.
        .prependTo( FFM.$statusText );
      }
    },

    /**
     * Update the status text counts.
     * @param  {string} type The type of card to count.
     */
    updateStatus : function( type ) {
      if ( null === type ) {
        FFM.$statusText.find( 'span' ).html( '0' );
        FFM.$totalFFFs.html( '-' );
        return;
      }
      FFM.$statusText.find( '.th-ffm-card-' + type + ' span' ).html( ++FFM.counter[ type ] );
    },

    /**
     * Get a page of Follower/Following cards.
     * @param  {integer} pageNr  The page number to get.
     * @param  {boolean} isChain If this a chain request, continue getting consecutive pages.
     */
    getPage : function( pageNr, isChain ) {
      // Has the user cancelled the chain?
      if ( isChain && ! FFM.chainBusy ) {
        doLog( 'Jumped out of chain.', 'i' );
        return;
      }

      // Make sure we have a valid page number.
      if ( pageNr < 1 ) {
        doLog( 'Invalid page number.', 'e' );
        return;
      }

      doLog( 'Getting page ' + pageNr, 'l' );

      var fetch_url = '/users/profiles/users_list/' + window.current_user.id + '/' + Page.current + '/' + pageNr;

      var $ajaxCurrentRequest = $.get( fetch_url, function( data ) {
        // Get all the cards.
        var $cards = $( data ).siblings( '.card' );

        // If we have only 1 card, there are no siblings, so get the card itself.
        if ( 0 === $cards.length ) {
          $cards = $( data );
        }

        // Count each card to determine correct total count.
        FFM.totalFFFs += $cards.length;
        FFM.$totalFFFs.html( FFM.totalFFFs );

        if ( $cards.length ) {
          // Flag each card and add to stack.
          $cards.each(function() {
            var $card = $( this );

            // Is this card a friend?
            var $friendButton = $card.find( '.friend_button.grey' );
            if ( $friendButton.length ) {

              var $followButton = $card.find( '.follow_button.grey' );
              var type;
              // Find only respond and request links. Also show cards that are friends and following.
              if ( $friendButton.hasClass( 'friend_request_box' ) ) {
                type = 'received';
              } else if ( $friendButton.attr( 'href' ).contains( '/cancel/' ) ) {
                type = 'sent';
              } else if ( $followButton.length ) {
                type = 'fandf';
              } else {
                // Next card.
                return;
              }

              // Add card and update the status text.
              $( '.profiles_list .card:not(.th-ffm-card):first' ).before( $card.addClass( 'th-ffm-card th-ffm-card-' + type ) );
              FFM.updateStatus( type );
            }
          });
        }

        // Are there more pages to load?
        if ( isChain ) {
          if ( $( data ).siblings( '.loadmore_profile' ).length ) {
            // Get the next page.
            FFM.getPage( pageNr + 1, true );
          } else {
            doLog( 'Chain completed on page ' + pageNr, 'i' );
            FFM.chainBusy = false;
          }
        }
      })
      .fail(function( xhr, status, error ) {
        if ( 'abort' === status ) {
          doLog( 'Aborted page ' + pageNr, 'e' );
        } else {
          doLog( 'Error on page ' + pageNr + '! (' + status + ':' + error + ')', 'e' );
        }
      })
      .always(function() {
        doLog( 'Finished page ' + pageNr, 'l' );
        // After the request is complete, remove it from the array.
        delete FFM.ajaxRequests[ pageNr ];
        FFM.checkIfFinished();
      });

      // If this is a chain request, set the $ajaxChainRequest variable.
      // If not, add it to the requests array.
      if ( isChain ) {
        FFM.$ajaxChainRequest = $ajaxCurrentRequest;
      } else {
        FFM.ajaxRequests[ pageNr ] = $ajaxCurrentRequest;
      }
    },

    /**
     * Check if the Friend Request search is finished.
     */
    checkIfFinished : function() {
      var activeRequests = Object.keys( FFM.ajaxRequests ).length;
      doLog( activeRequests + ' pages left.', 'l' );

      // If no chain is active and the requests are completed, we're finished!
      if ( ! FFM.chainBusy && 0 === activeRequests ) {
        FFM.finished();
      }
    },

    /**
     * Start the FFM.
     */
    start : function() {
      FFM.busy = FFM.chainBusy = true;
      FFM.totalFFFs = FFM.counter.received = FFM.counter.sent = FFM.counter.fandf = 0;
      FFM.updateStatus( null );
      FFM.$statusText.find( 'input' ).attr( 'disabled', true ).prop( 'checked', true );
      FFM.$statusText.show();
      FFM.$totalFFFs.show();
      FFM.$linkUnfollowFriends.hide();

      // Clear any previous results.
      $( '.th-ffm-card' ).remove();

      // Load all pages and start the chain loading on the last page.
      for ( var i = FFM.totalPages; i >= 1; i-- ) {
        FFM.getPage( i, i === FFM.totalPages );
      }

      FFM.$linkStart.hide();
      FFM.$linkCancel.show();
    },


    /**
     * Cancel the FFM.
     */
    cancel : function() {
      // Call finished with the cancelled parameter.
      FFM.finished( true );
    },

    /**
     * Finish off the FFM.
     * @param  {boolean} cancelled If the FFM has been cancelled.
     */
    finished : function( cancelled ) {
      FFM.busy = FFM.chainBusy = false;
      FFM.$statusText.find( 'input' ).removeAttr( 'disabled' );

      // If followed riends are found, show the "unfollow" button.
      if ( FFM.counter.fandf ) {
        FFM.$linkUnfollowFriends.show();
      }

      if ( cancelled ) {
        // Abort all AJAX requests.
        for ( var page in FFM.ajaxRequests ) {
          FFM.ajaxRequests[ page ].abort();
          delete FFM.ajaxRequests[ page ];
        }

        // Abort the current AJAX chain request.
        FFM.$ajaxChainRequest.abort();

        // The total number is incomplete, so hide it.
        FFM.$totalFFFs.hide();
      }

      FFM.$linkCancel.hide();
      FFM.$linkStart.show();
    },

    /**
     * Display / Hide certain categories.
     * @param  {string}  type  The type of cards to display / hide.
     * @param  {boolean} state True: display, False: hide.
     */
    filter : function( type, state ) {
      if ( state ) {
        $( '.th-ffm-card.th-ffm-card-' + type ).show();
      } else {
        $( '.th-ffm-card.th-ffm-card-' + type ).hide();
      }
    },

    /**
     * Automatically Unfollow all the loaded Friends.
     */
    unfollowFriends : function() {
      var $toUnfollow = $( '.th-ffm-card.th-ffm-card-fandf .follow_button.grey' );
      if ( $toUnfollow.length && confirm( 'WARNING: This may temporarily block access to Tsu!\n\nAre you really sure you want to Unfollow all ' + $toUnfollow.length + ' Friends on this page?\nThey will still be your Friends.\n\n(this cannot be undone)' ) ) {
        var unfollowed = 0;
        $toUnfollow.each(function() {
          this.click();
          unfollowed++;
        });
        FFM.$linkUnfollowFriends.hide();
        alert( unfollowed + ' Friends have been Unfollowed!');
      }
    }
  };


  /**
   * Quick Mention links.
   */
  var QM = {

    // The currently active textarea to insert the @mentions.
    $activeReplyTextArea : null,

    /**
     * Add text to the passed textarea input field.
     * @param {jQuery} $textArea jQuery object of the textarea input field.
     * @param {string} text      Text to add.
     */
    addTextToTextArea : function( $textArea, text ) {
      if ( $textArea ) {
        var textAreaText = $textArea.val();
        var caretPos1 = $textArea[0].selectionStart;
        var caretPos2 = $textArea[0].selectionEnd;
        $textArea.val( textAreaText.substring( 0, caretPos1 ) + text + textAreaText.substring( caretPos2 ) );
        $textArea[0].selectionStart = $textArea[0].selectionEnd = caretPos1 + text.length;
        $textArea.focus();
      }
    },

    /**
     * Add the @mention links to the replies.
     */
    load : function() {
      // Make sure the setting is enabled and we're on the right page.
      if ( ! settings.quickMention || ! Page.is( 'has-posts' ) ) {
        return;
      }

      doLog( 'Adding Quick Mention links.', 'i' );

      // Process all reply links to autofocus the reply textarea input field.
      $( '.load_more_post_comment_replies' ).not( '.th-qm-reply-processed' ).each(function() {
        var $replyLink = $( this );
        $replyLink.click(function() {
          var $postComment    = $replyLink.closest( '.post_comment' );
          var $replyContainer = $postComment.siblings( '.comment_reply_container' );
          var $textArea       = $replyContainer.children( '.post_write_comment' ).find( '#comment_text' );

          // This gets called before the "official" click, so the logic is inversed!
          // And delay everything a bit too, as it gets lazy-loaded.
          if ( $replyContainer.is( ':visible' ) ) {
            setTimeout(function() {
              // Only set the active textarea null if it's this one.
              if ( $textArea[0] === QM.$activeReplyTextArea[0] ) {
                QM.$activeReplyTextArea = null;
                // Hide all @ links.
                $( '.th-qm-reply' ).hide();
              }
            }, 100);
          } else {
            setTimeout(function() {
              $postComment.find( '.th-qm-reply' ).show();
              $textArea.focus();
            }, 100);
          }
        });
        $replyLink.addClass( 'th-qm-reply-processed' );
      });

      // Process all comment / reply textarea input fields to set themselves as active on focus.
      $( '.post_write_comment #comment_text' ).not( '.th-qm-textarea-processed' ).each(function() {
        $( this ).focusin( function() {
          QM.$activeReplyTextArea = $( this );
          $( '.th-qm-active-input' ).removeClass( 'th-qm-active-input' );
          QM.$activeReplyTextArea.closest( '.expandingText_parent' ).addClass( 'th-qm-active-input' );
        });
        $( this ).addClass( 'th-qm-textarea-processed' );
      });

      // Link for all comments.
      $( '.post_comment_header' ).not( '.th-qm-added' ).each(function() {
        var $head = $( this );
        var $commentArea = $head.closest( '.post_comment' );

        // Get just the last part of the href, the username.
        var hrefBits = $head.find( 'a' ).attr( 'href' ).split( '/' );
        var atUsername = '@' + hrefBits[ hrefBits.length - 1 ] + ' ';

        var $mentionLink = $( '<a/>', {
          class : 'th-qm-reply',
          html  : '@ +',
          title : 'Add ' + atUsername + 'to current reply.',
          click : function() {
            QM.addTextToTextArea( QM.$activeReplyTextArea, atUsername );
          }
        })
        .hide(); // Start hidden, as it will appear with the mouse over event.

        // Show / hide link on hover / blur if there is an active reply input selected.
        $commentArea.hover(
          function() { if ( QM.$activeReplyTextArea && QM.$activeReplyTextArea.length ) { $mentionLink.show(); } },
          function() { $mentionLink.hide(); }
        );

        $head.addClass( 'th-qm-added' );

        // Position the @ link.
        var $profilePic = $head.find( '.post_profile_picture' );
        var offset = $profilePic.position();
        $mentionLink.offset({ top: offset.top + $profilePic.height(), left: offset.left });

        $head.append( $mentionLink );
      });

      // Link for all textareas.
      $( '.post_write_comment' ).not( '.th-qm-added' ).each(function() {
        var $commentArea = $( this );
        var $commentInput = $commentArea.find( '#comment_text' );
        var $head = null;
        var linkElement = null;
        var isReply = $commentArea.hasClass( 'reply' );

        // Is this a nested comment? Then use the previous reply as the username.
        if ( isReply ) {
          $head = $commentArea.closest( '.comment' ).find( '.post_comment .post_comment_header' );
          linkElement = 'a';
        } else {
          // Get the current post to determine the username.
          var $post = $commentArea.closest( '.post' );

          // Defaults as if we have a shared post.
          $head = $post.find( '.share_header' );
          linkElement = '.evac_user a';

          // If it's not a share, get the post header.
          if ( 0 === $head.length ) {
            $head = $post.find( '.post_header' );
            linkElement = '.post_header_pp a';
          }
        }

        // Get just the last part of the href, the username.
        var hrefBits = $head.find( linkElement ).attr( 'href' ).split( '/' );
        var atUsername = '@' + hrefBits[ hrefBits.length - 1 ] + ' ';

        var $mentionLink = $( '<a/>', {
          class : 'th-qm-comment',
          html  : '@ >',
          title : 'Add ' + atUsername + 'to this ' + ( ( isReply ) ? 'reply.' : 'comment.' ),
          click : function() {
            QM.addTextToTextArea( $commentInput, atUsername );
          }
        })
        .hide() // Start hidden, as it will appear with the mouse over event.

        // Show / hide link on hover / blur.
        $commentArea.hover(
          function() { $mentionLink.show(); },
          function() { $mentionLink.hide(); }
        );

        $commentArea.addClass( 'th-qm-added' );

        $commentArea.find( '.post_profile_picture' ).parent().after( $mentionLink );
      });
    }
  };


  /**
   * The MutationObserver to detect page changes.
   */
  var Observer = {

    // The mutation observer object.
    observer : null,

    // The elements that we are observing.
    queryToObserve : 'body',
    // The query of objects that trigger the observer.
    queryToLoad    : '',
    // The query of userlinks to look for.
    queryToLoadFF  : '',

    /**
     * Start observing for DOM changes.
     */
    init : function() {

      // Check if we can use the MutationObserver.
      if ( 'MutationObserver' in window ) {
        // Are we observing anything on this page?
        if ( '' === Observer.queryToObserve ) {
          return;
        }

        var toObserve = document.querySelector( Observer.queryToObserve );

        if ( toObserve ) {

          doLog( 'Started Observer.', 'i' );

          Observer.observer = new MutationObserver( function( mutations ) {

            function itemsInArray( needles, haystack ) {
              for ( var i = needles.length - 1; i >= 0; i-- ) {
                if ( $.inArray( needles[ i ], haystack ) > -1 ) {
                  return true;
                }
              }
              return false;
            }

            // Helper to determine if added or removed nodes have a specific class.
            function mutationNodesHaveClass( mutation, classes ) {
              classes = classes.split( ' ' );

              // Added nodes.
              for ( var ma = mutation.addedNodes.length - 1; ma >= 0; ma-- ) {
                // In case the node has no className (e.g. textnode), just ignore it.
                if ( mutation.addedNodes[ ma ].className && itemsInArray( mutation.addedNodes[ ma ].className.split( ' ' ), classes ) ) {
                  return true;
                }
              }

              // Removed nodes.
              for ( var mr = mutation.removedNodes.length - 1; mr >= 0; mr-- ) {
                // In case the node has no className (e.g. textnode), just ignore it.
                if ( mutation.removedNodes[ mr ].className && itemsInArray( mutation.removedNodes[ mr ].className.split( ' ' ), classes ) ) {
                  return true;
                }
              }
            }

            //doLog( mutations.length + ' DOM changes.' );
            doLog( mutations );

            // Only react to changes we're interested in.
            for ( var m = mutations.length - 1; m >= 0; m-- ) {
              var $hoverCard = $( '.tooltipster-user-profile' );

              // Are we on a hover card?
              if ( $hoverCard.length && mutationNodesHaveClass( mutations[ m ], 'tooltipster-user-profile' ) ) {
                FFC.loadUserHoverCard( $hoverCard.find( '.card .card_sub .info' ) );
              }

              // Run all functions responding to DOM updates.
              // When loading a card, only if it's not a hover card, as those get loaded above.
              if ( mutationNodesHaveClass( mutations[ m ], 'post comment message_content_feed message_box tree_bar' )
                || ( mutationNodesHaveClass( mutations[ m ], 'card' ) && $hoverCard.length == 0 ) ) {
                FFC.loadAll();
                QM.load();
                emphasizeNestedRepliesParents();
                tweakMessagesPage();
              }
            }
          });

          // Observe child and subtree changes.
          Observer.observer.observe( toObserve, {
            childList: true,
            subtree: true
          });
        }
      } else {
        // If we have no MutationObserver, use "waitForKeyElements" function.
        // Instead of using queryToObserve, we wait for the ones that need to be loaded, queryToLoad.
        $.getScript( 'https://gist.github.com/raw/2625891/waitForKeyElements.js', function() {

          doLog( 'Started Observer (waitForKeyElements).', 'i' );

          // !! Specifically check for the correct page to prevent overhead !!

          if ( Page.is( 'has-userlinks' ) ) {
            waitForKeyElements( Observer.queryToLoad, FFC.loadAll() );
            //waitForKeyElements( Observer.queryToLoad, delayLoadFriendsAndFollowers );
          }
          if ( Page.is( 'has-posts' ) ) {
            waitForKeyElements( Observer.queryToLoad, QM.load );
            waitForKeyElements( Observer.queryToLoad, emphasizeNestedRepliesParents );
          }
          if ( Page.is( 'messages' ) ) {
            waitForKeyElements( Observer.queryToLoad, tweakMessagesPage );
          }
        });
      }
    }
  };


  /**
   * Post related things.
   */
  var Posting = {

    // Are we busy waiting for the popup to appear?
    waitingForPostPopup : false,

    /**
     * Initialise.
     */
    init : function() {
      // Remind to post to FB and Twitter in case forgotten to click checkbox.
      $( '#create_post_form' ).submit(function( event ) {
        return Posting.postFormSubmit( $( this ), event );
      });

      // When using the "Create" button, wait for the post input form.
      $( '.create_post_popup' ).click(function() {
        if ( ! Posting.waitingForPostPopup ) {
          Posting.waitingForPostPopup = true;
          Posting.waitForPostPopup();
        }
      });


      /**
       * Open post by double clicking header (only on pages with posts).
       */
      if ( ! Page.is( 'has-posts' ) ) {
        return;
      }

      $( 'body' ).on( 'dblclick', '.post_header_name, .share_header', function( event ) {
        //var post_id = $( this ).closest( '.post' ).data( 'post-id' );
        var $post      = $( this ).closest( '.post' );
        var isShare    = $post.find( '.share_header' ).length;
        var isOriginal = ! $( this ).hasClass( 'share_header' );
        $post.find( '#post_link_dropdown a' ).each(function() {
          var linkText = $( this ).text().trim().toLowerCase();
          if ( ( ! isShare && 'open' === linkText )
            || ( ! isOriginal && 'open' === linkText )
            || ( isOriginal && 'open original post' === linkText ) ) {

            var url = $( this ).attr( 'href' );
            // If the shift key is pressed, open in new window / tab.
            if ( event.shiftKey ) {
              window.open( url, '_blank' ).focus();
            } else {
              window.location = url;
            }
            return;
          }
        });
      });
    },

    /**
     * Check for the maximum number of hashtags and mentions.
     * @param  {string}  message The message being posted.
     * @return {boolean}         True = submit, False = cancel, Null = not too many
     */
    checkMaximumHashtagsMentions : function( message ) {
      // Check if the setting is enabled.
      if ( ! settings.checkMaxHM ) {
        return null;
      }

      // Get number of hashtags and mentions in the message.
      var nrOfHashtags = message.split( '#' ).length - 1;
      doLog( nrOfHashtags + ' Hashtags found.' );
      var nrOfMentions = message.split( '@' ).length - 1;
      doLog( nrOfMentions + ' Mentions found.' );

      // If the limits aren't exeeded, just go on to post.
      if ( nrOfHashtags <= TSUConst.maxHashtags && nrOfMentions <= TSUConst.maxMentions ) {
        return null;
      }

      // Set up warning message.
      var warning = 'Limits may be exceeded, check your message!\nAre you sure you want to continue?\n';
      if ( nrOfHashtags > TSUConst.maxHashtags ) {
        warning += '\n' + nrOfHashtags + ' #hashtags found. (Max. ' + TSUConst.maxHashtags + ')';
        doLog( 'Too many hashtags found! (' + nrOfHashtags + ')', 'w' );
      }
      if ( nrOfMentions > TSUConst.maxMentions ) {
        warning += '\n' + nrOfMentions + ' @mentions found. (Max. ' + TSUConst.maxMentions + ')';
        doLog( 'Too many mentions found! (' + nrOfMentions + ')', 'w' );
      }

      // Last chance to make sure about hashtags and mentions.
      return confirm( warning );
    },

    /**
     * Check if the social network sharing has been selected.
     * @param  {jQuery}  $form Form jQuery object of the form being submitted.
     * @return {boolean}       True = submit, False = cancel, Null = all selected
     */
    checkSocialNetworkSharing : function( $form ) {
      // Check if the setting is enabled.
      if ( ! settings.checkSocial ) {
        return null;
      }

      var share_facebook = null;
      var share_twitter  = null;

      // Get all visible (connected) checkboxes. If any are not checked, show warning.
      $form.find( '.checkboxes_options_create_post input:visible' ).each(function() {
        switch ( $( this ).attr( 'id' ) ) {
          case 'facebook': share_facebook = $( this ).prop( 'checked' ); break;
          case 'twitter':  share_twitter  = $( this ).prop( 'checked' ); break;
        }
      });

      // If no social network accounts are connected, just go on to post.
      if ( false !== share_facebook && false !== share_twitter ) {
        return null;
      }

      var post_to = 'OK = Post to Tsu';

      // Share to facebook?
      if ( true === share_facebook ) {
        post_to += ', Facebook';
      }
      // Share to twitter?
      if ( true === share_twitter ) {
        post_to += ', Twitter';
      }

      // Last chance to enable sharing to social networks...
      return confirm( post_to + '\nCancel = Choose other social networks' );
    },

    /**
     * Called on form submit.
     * @param  {jQuery} $form Form jQuery object of the form being submitted.
     * @param  {event}  event The form submit event.
     */
    postFormSubmit : function( $form, event ) {
      // In case the post gets cancelled, make sure the message field is focused.
      var message = $form.find( '#text' ).focus().val();
      var title   = $form.find( '#title' ).val();
      var hasPic  = ( '' !== $form.find( '#create_post_pic_preview' ).text() );

      // Make sure something was entered (title, text or image.
      // Check for the maximum number of hashtags and mentions,
      // and if the Social network sharing warning has been approved.
      if ( ( '' !== message || '' !== title || hasPic )
        && false !== Posting.checkMaximumHashtagsMentions( message )
        && false !== Posting.checkSocialNetworkSharing( $form ) ) {
        doLog( 'Post!' );
        return;
      }


      /**************************
      * CANCEL FORM SUBMISSION! *
      **************************/
      doLog( 'DONT Post!' );

      // Prevent form post.
      event.preventDefault();

      // Hide the loader wheel.
      $form.find( '.loading' ).hide();

      // Make sure to enable the post button again. Give it some time, as Tsu internal script sets it to disabled.
      setTimeout(function(){
        $form.find( '#create_post_button' ).removeAttr( 'disabled' );
      }, 500 );

      return false;
    },

    /**
     * Wait for the fancybox popup to create a new post.
     */
    waitForPostPopup : function() {
      var $form = $( '.fancybox-overlay #create_post_form' );
      if ( $form.length ) {
        $form.find( '#text' ).focus();
        $form.submit(function( event ) {
          return Posting.postFormSubmit( $( this ), event );
        });
        Posting.waitingForPostPopup = false;
        return;
      }

      // Wait around for it longer...
      setTimeout( function() { Posting.waitForPostPopup(); }, 500 );
    }
  };


  /**
   * User object containing info for Friends and Followers counter.
   * @param {string|integer} userID   Depending on the context, this is either the user id as a number or unique username / identifier.
   * @param {string}         userName The user's full name.
   * @param {string}         userUrl  The url to the user profile page.
   */
  function UserObject( userID, userName, userUrl ) {

    // Keep track if this user object has already finished loading.
    this.finished = false;
    this.userID   = userID.trim();
    this.userName = userName.trim();
    this.userUrl  = userUrl.trim();

    // Add to all userObjects list.
    Users.userObjects[ userID ] = this;

    // Queue of user link spans to refresh once the user object has finished loading.
    this.userLinkSpans = [];

    doLog( '(' + userID + ':' + userName + ') New user loaded.' );

    /**
     * Set the friends info.
     * @param {jQuery}  $friendsLink The jQuery <a> object linking to the user's Friends page.
     * @param {[string} friendsUrl   The URL to the user's Friends page.
     * @param {[string} friendsCount The user's number of friends.
     */
    this.setFriendsInfo = function( $friendsLink, friendsUrl, friendsCount ) {
      this.$friendsLink   = $friendsLink;
      this.friendsUrl     = friendsUrl.trim();
      this.friendsCount   = friendsCount.trim();
    };

    /**
     * Set the followers info.
     * @param {jQuery} $followersLink The jQuery <a> object linking to the user's Followers page.
     * @param {string} followersUrl   The URL to the user's Followers page.
     * @param {string} followersCount The user's number of Followers.
     */
    this.setFollowersInfo = function( $followersLink, followersUrl, followersCount ) {
      this.$followersLink   = $followersLink;
      this.followersUrl     = followersUrl.trim();
      this.followersCount   = followersCount.trim();
    };

    /**
     * Return a clone of the Friends page link.
     * @return {jQuery} Friends page link.
     */
    this.getFriendsLink = function() {
      return this.$friendsLink.clone();
    };

    /**
     * Return a clone of the Followers page link.
     * @return {jQuery} Followers page link.
     */
    this.getFollowersLink = function() {
      return this.$followersLink.clone();
    };

    /**
     * Set this user object as finished loading.
     */
    this.setFinished = function() {
      this.finished = true;
      doLog( '(id:' + this.userID + ') Finished loading.' );
    };

    /**
     * Is this user object already loaded?
     * @return {Boolean}
     */
    this.isFinished = function() {
      return this.finished;
    };

    /**
     * Add a user link span to the queue to be refreshed once the user object is loaded.
     * @param  {jQuery} $userLinkSpan The user link span object.
     */
    this.queueUserLinkSpan = function( $userLinkSpan ) {
      this.userLinkSpans.push( $userLinkSpan );
    };

    /**
     * Refresh the passed $userLinkSpan with the user details.
     * @param  {jQuery}  $userLinkSpan The <span> jQuery object to appent the details to.
     * @param  {integer} tries         The number of tries that have already been used to refresh the details.
     */
    this.refresh = function( $userLinkSpan, tries ) {
      if ( undefined === tries || null === tries ) {
        tries = 0;
      }

      // If the maximum tries has been exeeded, return.
      if ( tries > FFC.maxTries ) {
        // Just remove the failed link span, maybe it will work on the next run.
        $userLinkSpan.remove();

        // Remove all queued ones too to prevent infinite loader image.
        for ( var i = this.userLinkSpans.length - 1; i >= 0; i-- ) {
          this.userLinkSpans[ i ].remove();
        }
        this.userLinkSpans = [];

        doLog( '(id:' + this.userID + ') Maximum tries exeeded!', 'w' );
        return;
      }

      if ( this.isFinished() ) {
        // Add the user details after the user link.
        this.queueUserLinkSpan( $userLinkSpan );

        // Update all listening user link spans.
        for ( var i = this.userLinkSpans.length - 1; i >= 0; i-- ) {
          this.userLinkSpans[ i ].empty().append( this.getFriendsLink(), this.getFollowersLink() );
        }

        // Empty the queue, as there is no need to reload already loaded ones.
        this.userLinkSpans = [];

        doLog( '(' + this.userID + ':' + this.userName + ') Friends and Followers set.' );
      } else {
        var t = this;
        setTimeout(function() {
          t.refresh( $userLinkSpan, tries + 1);
        }, 1000);
      }
    };
  }

  /**
   * Friends and Followers counts manager.
   */
  var FFC = {

    // Max number of tries to get friend and follower info (= nr of seconds).
    maxTries : 60,

    /**
     * Load a user link.
     * @param  {jQuery}  $userElement The element that contains the user link.
     * @param  {boolean} onHoverCard  Is this element a hover card?
     */
    loadUserLink : function( $userElement, onHoverCard ) {

      // If this link has already been processed, skip it.
      if ( $userElement.hasClass( 'ffc-processed' ) ) {
        return;
      }

      // Set the "processed" flag to prevent loading the same link multiple times.
      $userElement.addClass( 'ffc-processed' );


      // Because the user link is in a nested entry.
      var $userLink = $userElement.find( 'a:first' );

      // If no link has been found, continue with the next one. Fail-safe.
      if ( 0 === $userLink.length ) {
        return;
      }

      // Add a new <span> element to the user link.
      var $userLinkSpan = $( '<span/>', { html: '<img class="th-ffc-loader-wheel" src="/assets/loader.gif" alt="Loading..." />', 'class': 'th-ffc-span' } );
      $userLink.after( $userLinkSpan );

      // Special case for these pages, to make it look nicer and fitting.
      if ( onHoverCard || Page.is( 'fff discover' ) ) {
        $userLinkSpan.before( '<br class="th-ffc-br" />' );
      }

      // Get the user info from the link.
      var userName = $userLink.text().trim();
      var userUrl  = $userLink.attr( 'href' );

      // If the userID hasn't been passed, try to get a numeric user id, or extract if from the url.
      var userID = $userElement.attr( 'user_id' ) || userUrl.split( '/' )[1];

      // Check if the current user has already been loaded.
      var userObject = Users.getUserObject( userID, true );


      // Add this span to the list that needs updating when completed.
      if ( userObject instanceof UserObject ) {

        // If this user has already finished loading, just update the span, else add it to the queue.
        if ( userObject.isFinished() ) {
          userObject.refresh( $userLinkSpan, 0 );
        } else {
          userObject.queueUserLinkSpan( $userLinkSpan );
        }

        return;
      }

      // Create a new UserObject and load it's data.
      userObject = new UserObject( userID, userName, userUrl );

      // Load the numbers from the user profile page.
      $.get( userUrl, function( response ) {
        // Get rid of all images first, no need to load those, then find the links.
        var $numbers = $( response.replace( /<img[^>]*>/g, '' ) ).find( '.profile_details .numbers a' );

        var $friends = $numbers.eq( 0 );
        var friendsUrl = $friends.attr( 'href' );
        var friendsCount = $friends.find( 'span' ).text();
        var $friendsLink = $( '<a/>', {
          //title: 'Friends', leave commented out, as this is a problem on hover cards.
          href: friendsUrl,
          html: friendsCount
        });

        var $followers = $numbers.eq( 1 );
        var followersUrl = $followers.attr( 'href' );
        var followersCount = $followers.find( 'span' ).text();
        var $followersLink = $( '<a/>', {
          //title: 'Followers', leave commented out, as this is a problem on hover cards.
          href: followersUrl,
          html: followersCount
        });

        // Add the Friends and Followers details, then refresh all userlink spans.
        userObject.setFriendsInfo(   $friendsLink,   friendsUrl,   friendsCount   );
        userObject.setFollowersInfo( $followersLink, followersUrl, followersCount );
        userObject.refresh( $userLinkSpan, 0 );
      })
      .always(function() {
        // Make sure to set the user as finished loading.
        Users.finishedLoading( userID );
      });
    },

    /**
     * Load the FF counts for a user's hover card.
     * @param  {jQuery} $userHoverCard Hover card selector.
     */
    loadUserHoverCard : function( $userHoverCard ) {
      if ( 'disabled' === settings.showFFC ) {
        return;
      }

      var t = this;
      // As long as the hover tooltip exists but the card inside it doesn't, loop and wait till it's loaded.
      if ( $( '.tooltipster-user-profile' ).length && $userHoverCard.length === 0 ) {
        setTimeout(function(){
          t.loadUserHoverCard( $( $userHoverCard.selector, $userHoverCard.context ) );
        }, 500);
        return;
      }

      doLog( 'Start loading Friends and Followers (Hover Card).', 'i' );

      FFC.loadUserLink( $userHoverCard, true );
    },

    /**
     * Load Friends and Followers
     * @param {boolean} clean Delete saved details and refetch all.
     */
    loadAll : function( clean ) {
      if ( 'disabled' === settings.showFFC || ( 'hovercard' === settings.showFFC && Page.is( 'has-posts' ) ) ) {
        return;
      }

      if ( clean ) {
        if ( confirm( 'Reload all Friend and Follower details of all users on the current page?' ) ) {
          doLog( '(clean) Start loading Friends and Followers.', 'i' );

          // Reset list.
          Users.userObjects = {};

          // Remove all existing user links spans and brs.
          $( '.th-ffc-span, .th-ffc-br' ).remove();
          $( '.ffc-processed' ).removeClass( 'ffc-processed' );
        } else {
          return;
        }
      } else {
        doLog( 'Start loading Friends and Followers.', 'i' );
      }

      // Special case for "Discover Users", convert all the usernames to links.
      if ( Page.is( 'discover' ) ) {
        $( '#discover .user_card_1_wrapper' ).each(function() {
          var $convertToLinks = $( this ).find( '.tree_child_fullname, .tree_child_coverpicture, .tree_child_profile_image' );

          // Get the last part of the "Follow" button link, which is the numerical user ID.
          var userID = $( this ).find( '.follow_button' ).attr( 'href' ).split( '/' ).pop();

          if ( userID ) {
            // Make the username and profile images a link to the profile.
            $convertToLinks.each(function() {
              // Wrap each item in a link and add the user ID which we need for FFC.
              $( this ).attr( 'user_id', userID ).wrapInner( '<a href="/users/' + userID + '"></a>' );
            });
          }
        });
      }

      // Find all users and process them.
      var $newUserLinks = $( Observer.queryToLoadFF ).not( '.ffc-processed' );

      doLog( 'New user links found: ' + $newUserLinks.length );

      $newUserLinks.each(function() {
        var $userElement = $( this );

        // Is this link on a tooltip hover card?
        var onHoverCard = ( $userElement.closest( '.tooltipster-base' ).length !== 0 );

        FFC.loadUserLink( $userElement, onHoverCard );
      });
    }
  };

  /**
   * Manage all users for the Friends and Followers counting.
   */
  var Users = {

    userObjects : {},

    getUserObject : function( userID, setLoading ) {
      if ( Users.userObjects.hasOwnProperty( userID ) ) {
        doLog( '(' + userID + ':' + Users.userObjects[ userID ].userName + ') Already loaded.' );
        return Users.userObjects[ userID ];
      }

      if ( setLoading ) {
        doLog( '(id:' + userID + ') Set to loading.' );
        Users.userObjects[ userID ] = true;
      }

      doLog( '(id:' + userID + ') Not loaded yet.' );
      return false;
    },

    finishedLoading : function( userID ) {
      if ( Users.userObjects.hasOwnProperty( userID ) ) {
        Users.userObjects[ userID ].setFinished();
      }
    }
  };



  // Initialise after all variables are defined.
  Page.init();
  Observer.init();
  Posting.init();


  // Add the required CSS rules.
  addCSS();

  // Add the About (and Settings) window to the menu.
  addAboutWindow();


  // As the observer can't detect any changes on static pages, run functions now.
  FFC.loadAll();
  QM.load();
  emphasizeNestedRepliesParents();
  tweakMessagesPage();
  FFM.init();


  // Set focus to message entry field on page load.
  if ( Page.is( 'home diary' ) ) {
    $( '#text' ).focus();
  }

  // Auto-focus title entry field when adding title.
  $( 'body' ).on( 'click', '.create_post .options .add_title', function() {
    var $postForm  = $( this ).closest( '#create_post_form' );
    var $postTitle = $postForm.find( '#title' );
    // Focus title or text field, depending if the title is being added or removed.
    if ( $postTitle.is( ':visible' ) ) {
      setTimeout( function() { $postForm.find( '#text' ).focus(); }, 50 );
    } else {
      setTimeout( function() { $postTitle.focus(); }, 50 );
    }
  });

  // Auto-focus message entry field when adding/removing image.
  $( 'body' ).on( 'click', '.create_post .options .filebutton, .cancel_icon_createpost', function() {
    var $postText = $( this ).closest( '#create_post_form' ).find( '#text' );
    setTimeout( function() { $postText.focus(); }, 50 );
  });

  // Add custom number of notifications to display.
  if ( Page.is( 'notifications' ) ) {

    var $ajaxNCRequest = null;
    var $notificationsList = $( '#new_notifications_list' );

    // List the available options.
    var selectOptions = '';
    [ 30, 50, 100, 200, 300, 400, 500 ].forEach(function( val ) {
      selectOptions += '<option value="' + val + '">' + val + '</option>';
    });

    var $ncSelect = $( '<select/>', {
      'id' : 'th-nc-select',
      html : selectOptions
    })
    .change(function(){
      // If a request is already busy, cancel it and restart the new one.
      if ( $ajaxNCRequest ) {
        $ajaxNCRequest.abort();
      }

      // Show loader wheel.
      $notificationsList.html( '<img src="/assets/loader.gif" alt="Loading..." />' );

      doLog( 'Loading ' + $ncSelect.val() + ' notifications.', 'i' );

      // Request the selected amount of notifications.
      $ajaxNCRequest = $.getJSON( '/notifications/request/?count=' + $ncSelect.val(), function( data ) {

        doLog( data, 'e' );

        // Clear the loader wheel.
        $notificationsList.empty();

        // Make sure we have access to the notifications.
        if ( ! data.hasOwnProperty( 'notifications' ) ) {
          // Some error occured.
          $notificationsList.html( '<div>Error loading notifications, please try again later.</div>' );
          return;
        }

        // No notifications.
        if ( 0 === data.notifications.length ) {
          $notificationsList.html( '<div>You don\'t have any notifications.</div>');
          return;
        }

        // Append the notifications to the list. Function used is the one used by Tsu.
        $( data.notifications ).each(function( i, item ) {
          $notificationsList.append(
            window.notifications_fr._templates['new_comment_in_post'](
              item.url,
              item.user,
              item.message,
              item.created_at_int
            )
          );
        });
      })
      .fail(function() {
        $notificationsList.html( '<div>Error loading notifications, please try again later.</div>' );
      });

    });

    $( '<div/>', {
      'id'  : 'th-nc-div',
      title : 'How many notifications to show',
      html  : $ncSelect
    })
    .prepend( 'Show: ' ) // Add the "Show: " label.
    .wrapInner( '<label/>' )
    .appendTo( $( '#new_notifications_wrapper' ) );
  }

  /**
   * Add a specific class to all nested reply parent elements to emphasize them.
   */
  function emphasizeNestedRepliesParents() {
    // Make sure the setting is enabled and we're on the right page.
    if ( ! settings.emphasizeNRP || ! Page.is( 'has-posts' ) ) {
      return;
    }

    doLog( 'Emphasizing Nested Replies Parents.', 'i' );

    $( '.post_comment .load_more_post_comment_replies' ).not( '.th-nrp' ).each(function(){
      if ( /\d+/.exec( $( this ).text() ) > 0 ) {
        $( this ).addClass( 'th-nrp' );
      }
    });
  }

  /**
   * Autofocus text input and add line breaks to messages.
   */
  function tweakMessagesPage() {
    // Make sure we're on the right page.
    if ( ! Page.is( 'messages' ) ) {
      return;
    }

    doLog( 'Tweaking messages page.', 'i' );

    // Focus the recipient field if this is a new message.
    if ( document.URL.endsWith( '/new' ) ) {
      $( '.new_message #message_to_textarea' ).focus();
    } else {
      $( '.new_message #message_body' ).focus();
    }

    // Add line breaks to all messages.
    $( '.messages_content .message_box' ).each(function(){
      if ( ! $( this ).hasClass( 'tsu-helper-tweaked' ) ) {
        var $text = $( this ).find( '.message-text' );
        $text.html( $text.html().trim().replace(/(?:\r\n|\r|\n)/g, '<br />') );
        $( this ).addClass( 'tsu-helper-tweaked' );
      }
    });
  }

  /**
   * Make a log entry if debug mode is active.
   * @param {string}  logMessage Message to write to the log console.
   * @param {string}  level      Level to log ([l]og,[i]nfo,[w]arning,[e]rror).
   * @param {boolean} alsoAlert  Also echo the message in an alert box.
   */
  function doLog( logMessage, level, alsoAlert ) {
    if ( ! publicDebug && 104738 !== window.current_user.id ) {
      return;
    }

    var logLevels = { l : 0, i : 1, w : 2, e : 3 };

    // Default to "log" if nothing is provided.
    level = level || 'l';

    if ( 'disabled' !== settings.debugLevel && logLevels[ settings.debugLevel ] <= logLevels[ level ] ) {
      switch( level ) {
        case 'l' : console.log(   logMessage ); break;
        case 'i' : console.info(  logMessage ); break;
        case 'w' : console.warn(  logMessage ); break;
        case 'e' : console.error( logMessage ); break;
      }
      if ( alsoAlert ) {
        alert( logMessage );
      }
    }
  }

  /**
   * Add the required CSS rules.
   */
  function addCSS() {
    doLog( 'Added CSS.', 'i' );

    // Remember to take care of setting-specific CSS!
    var settingSpecificCSS = '';

    // Hide Ads.
    if ( settings.hideAds ) {
      settingSpecificCSS +=
      '.homepage_advertisement, .rectangle_advertisement, .skyscraper_advertisement { position: absolute !important; left: -999999999px !important; }';
    }

    // Nested replies parents.
    if ( settings.emphasizeNRP ) {
      settingSpecificCSS +=
      '.th-nrp { text-decoration: underline; color: #777 !important; }';
    }

    // Quick Mention links for comments.
    if ( settings.quickMention ) {
      settingSpecificCSS +=
      '.th-qm-comment, .th-qm-reply { z-index: 1; font-weight: bold; font-size: 0.8em; display: block; position: absolute; background: #1abc9c; color: #fff; border-radius: 3px; padding: 2px; }' +
      '.th-qm-comment { margin-left: 11px; }' +
      '.th-qm-active-input { border-color: rgba(0,0,0,.4) !important; }' +
      '.post_comment { position: relative; }';
    }

    // Friends and Followers
    if ( 'disabled' !== settings.showFFC ) {
      settingSpecificCSS +=
      '.th-ffc-span .th-ffc-loader-wheel { margin-left: 5px; height: 12px; }' +
      '.th-ffc-span a { font-size: smaller; margin-left: 5px; border-radius: 3px; background-color: #1abc9c; color: #fff !important; padding: 1px 3px; font-weight: bold; }' +
      '.user_card_1_wrapper .tree_child_fullname { height: 32px !important; }';
    }

    // Add the styles to the head.
    $( '<style>' ).html(
      settingSpecificCSS +

      // Menu item.
      '#th-menuitem-about a:before { display: none !important; }' +
      '#th-menuitem-about a { background-color: #1ea588; color: #fff !important; width: 100% !important; padding: 8px !important; box-sizing: border-box; text-align: center; }' +
      '#th-menuitem-about a:hover { background-color: #1ea588 !important; }' +

      // FFM.
      '#th-ffm-unfollow-friends{ background: #dc3a50; color: #fff; font-size: .8em; }' +
      '#th-ffm-total-fffs { background: #090; color: #fff; margin-left: 8px !important; }' +
      '#th-ffm-link-start, #th-ffm-link-cancel { float: right; padding: 2px; }' +
      '#th-ffm-link-cancel { background: url(/assets/loader.gif) no-repeat; padding-left: 24px; }' +
      '#th-ffm-status-text { float: right; margin-right: 8px; }' +
      '#th-ffm-status-text label, #th-ffm-total-fffs, #th-ffm-unfollow-friends { padding: 2px 5px; border-radius: 3px; border: 1px solid rgba(0,0,0,.5); margin: -1px; }' +
      '#th-ffm-status-text input { margin: 0 5px 0 2px; }' +
      '#th-ffm-status-text * { display: inline-block; cursor: pointer; }' +
      '.th-ffm-card-received { background: #cfc; }' +
      '.th-ffm-card-sent { background: #eef; }' +
      '.th-ffm-card-fandf { background: #ffc; }' +

      // About & Settings windows.
      '#th-about-window,    #th-settings-window    { width: 360px; height: auto; }' +
      '#th-about-window *,  #th-settings-window *  { box-sizing: border-box; }' +
      '#th-about-window h1, #th-settings-window h1 { margin: 5px; }' +
      '.th-buttons-div { padding: 5px; text-align: center; display: inline-block; border: 1px solid #d7d8d9; width: 100%; line-height: 23px; background-color: #fff; border-radius: 2px; margin-top: 10px; }' +

      // About window.
      '#th-about-window > div { margin: 5px 0; }' +
      '#th-about-window .card { box-sizing: border-box; min-width: 100%; border: 1px solid #d7d8d9; border-top-left-radius: 30px; border-bottom-left-radius: 30px; }' +
      '#th-about-window .card .button { width: 123px; }' +
      '.th-update { background-color: #f1b054 !important; color: #fff !important; }' +
      '.th-settings { background-image: url("//tsu-production-app.s3.amazonaws.com/assets/sprite-icons-8b41dfa609c88b45900ac483e50c63db.png") !important; margin: 0; padding: 0 !important; height: 28px; width: 28px; background-position: 0px 0px; }' +
      '.th-donate-buttons { border-top-left-radius: 20px; border-bottom-left-radius: 20px; }' +
      '.th-donate-paypal { float: left; }' +
      '.th-donate-paypal img { vertical-align: middle; }' +

      // Settings window.
      '#th-settings-window label, #th-settings-window input { display: inline-block; cursor: pointer; }' +
      '#th-settings-window form > div { margin: 5px 0; }' +
      '#th-settings-back-button { float: left !important; }' +
      '.th-settings-help { background-color: #ccc; padding: 2px; margin-left: 5px; border-radius: 10px; font-weight: bold; cursor: help; }' +

      // Show custom number of notifications.
      '#new_notifications_wrapper { position: relative; }' +
      '#th-nc-div { position: absolute; top: 0; right: 15px; }' +
      '#th-nc-div select { cursor: pointer; }'
    ).appendTo( 'head' );
  }

  /**
   * Add the about window which shows the version and changelog.
   * It also displays donate buttons and an update button if a newer version is available.
   */
  function addAboutWindow() {
    doLog( 'Added about window.', 'i' );

    // About window.
    var $aboutWindow = $( '<div/>', {
      'id' : 'th-about-window',
      html :
        '<h1>About Tsu Helper</h1>' +
        '<div>' +
          'Version <strong>' + Updater.localVersion + '</strong> (<a href="https://j.mp/tsu-helper-changelog" target="_blank">changelog</a>)<br />' +
          '&copy;2014-2015 Armando L&uuml;scher (<a href="https://tsu.co/noplanman">@noplanman</a>)<br />' +
          'Disclaimer: Tsu Helper is in no way affiliated with Tsu LLC.<br />Use it at your own risk.' +
        '</div>' +
        '<br />' +
        '<div>For more details about this script and an overview of all the features simply <a href="https://j.mp/tsu-helper-readme" target="_blank">click here</a>.</div>' +
        '<br />' +
        '<div>If you like this script and would like to support my work, please consider a small donation. It is very much appreciated =)</div>' +
        '<div class="th-buttons-div th-donate-buttons">' +
          '<a class="th-donate-paypal" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CRQ829DME6CNW" target="_blank"><img alt="Donate via PayPal" title="Donate via PayPal" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" /></a>' +
          '<span>&laquo; PayPal <i> - or - </i> Tsu &raquo;</span>' +
          '<a class="th-donate-tsu button message_pop_up fancybox.ajax donation" href="/users/profiles/donation/104738" title="Donate via Tsu">Donate</a>' +
        '</div>' +
        '<br />' +
        '<div>Follow me and stay up to date!</div>'
    });

    // Settings window.
    var $settingsWindow = $( '<div/>', {
      'id' : 'th-settings-window',
      html : '<h1>Tsu Helper Settings</h1>'
    });

    // Settings which are only a checkbox.
    var checkboxes = [
      { name : 'hideAds',      txt : 'Hide Ads',                       help : 'Show or Hide all the Ads.' },
      { name : 'quickMention', txt : 'Enable Quick Mentions',          help : 'Add Quick Mention links to comments and replies.' },
      { name : 'emphasizeNRP', txt : 'Emphasize Nested Replies',       help : 'Emphasize the parent of nested comment replies, to make them more visible.' },
      { name : 'checkSocial',  txt : 'Check Social Networks',          help : 'Check if your new post is being shared to your connected Social Network accounts.' },
      { name : 'checkMaxHM',   txt : 'Check Max. Hashtags & Mentions', help : 'Check if the maximum number of Hashtags & Mentions has been reached before posting.' }
    ];
    var checkboxSettings = '';
    for ( var i = 0; i < checkboxes.length; i++ ) {
      var cb = checkboxes[ i ];
      checkboxSettings += '<div><label><input type="checkbox" name="' + cb.name + '"' + checked( settings[ cb.name ] ) + ' />' + cb.txt + '</label><span class="th-settings-help" title="' + cb.help + '">?</span></div>';
    }

    // The debug level dropdown.
    var debugLevelSettings = ( publicDebug || 104738 === window.current_user.id ) ?
      '<div><label>Debug level:' +
        '<select name="debugLevel">' +
          '<option value="disabled"' + selected( 'disabled', settings.debugLevel ) + '>Disabled</option>' +
          '<option value="l"' + selected( 'l', settings.debugLevel ) + '>Log</option>' +
          '<option value="i"' + selected( 'i', settings.debugLevel ) + '>Info</option>' +
          '<option value="w"' + selected( 'w', settings.debugLevel ) + '>Warn</option>' +
          '<option value="e"' + selected( 'e', settings.debugLevel ) + '>Error</option>' +
        '</select>' +
      '</label></div>' : '';

    var $settingsForm = $( '<form/>', {
      'id' : 'th-settings-form',
      html :
        checkboxSettings +=

        '<div><label>Show Friends and Followers on ' +
          '<select name="showFFC">' +
            '<option value="disabled"' + selected( 'disabled', settings.showFFC ) + '>No Links (disabled)</option>' +
            '<option value="all"' + selected( 'all', settings.showFFC ) + '>All Links</option>' +
            '<option value="hovercard"' + selected( 'hovercard', settings.showFFC ) + '>Hover Cards Only</option>' +
          '</select>' +
        '</label><span class="th-settings-help" title="Where to display Friends and Followers counts.">?</span></div>'

        + debugLevelSettings
    })
    .appendTo( $settingsWindow );

    // Defaults button on Settings window.
    var $defaultsButton = $( '<a/>', {
      'id'  : 'th-settings-defaults-button',
      class : 'button red',
      title : 'Reset to default values',
      html  : 'Defaults',
      click : function() {
        Settings.setDefaults( $settingsForm );
      }
    })
    .appendTo( $settingsWindow.find( 'h1' ) );

    // The state in which the Settings are closed (back or save).
    var settingsCloseState = null;

    // Save button on Settings window.
    var $saveButton = $( '<a/>', {
      'id'  : 'th-settings-save-button',
      class : 'button',
      title : 'Save Settings',
      html  : 'Save',
      click : function() {
        if ( confirm( 'Refresh page now for changes to take effect?' ) ) {
          Settings.save( $settingsForm );
          settingsCloseState = 'save';
          $.fancybox.close();
        }
      }
    });

    // Back button on Settings window.
    var $backButton = $( '<a/>', {
      'id'  : 'th-settings-back-button',
      class : 'button grey',
      title : 'Go Back without saving',
      html  : '&laquo; Back',
      click : function() {
        // Close this window.
        settingsCloseState = 'back';
        $.fancybox.close();
      }
    });

    // Buttons on Settings window.
    $( '<div/>', {
      class : 'th-buttons-div',
      html  : '<span><a href="https://j.mp/tsu-helper-settings" target="_blank">Detailed Help</a></span>'
    })
    .prepend(  $backButton )
    .append(   $saveButton )
    .appendTo( $settingsWindow );


    // Settings button on About window.
    $( '<a/>', {
      'id'  : 'th-about-window-settings-button',
      class : 'button th-settings',
      title : 'Change Settings',
      html  : '',
      click : function() {
        // Open settings window in a fancybox.
        Settings.populateForm( $settingsForm );
        $.fancybox( $settingsWindow, {
          closeBtn : false,
          modal : true,
          beforeClose : function() {
            // If the Back button was pressed, reopen the About window.
            if ( 'back' === settingsCloseState ) {
              setTimeout(function() {
                $.fancybox( $aboutWindow );
              }, 10);
              return false;
            }
          },
          afterClose : function() {
            // If the Save button was pressed, reload the page.
            if ( 'save' === settingsCloseState ) {
              location.reload();
              return;
            }
          }
        });
      }
    })
    .appendTo( $aboutWindow.find( 'h1' ) );


    // Check if there is a newer version available.
    if ( Updater.hasUpdate() ) {
      $( '<a/>', {
        class : 'button th-update',
        title : 'Update Tsu Helper to the newest version (' + Updater.remoteVersion + ')',
        href  : Updater.scriptURL,
        html  : 'New Version!',
        click : function() {
          if ( ! confirm( 'Upgrade to the newest version (' + Updater.remoteVersion + ')?\n\n(refresh this page after the script has been updated)' ) ) {
            return false;
          }
        }
      })
      .attr( 'target', '_blank' ) // Open in new window / tab.
      .appendTo( $aboutWindow.find( 'h1' ) );
    }

    // Link in the menu that opens the about window.
    var $aboutWindowLink = $( '<a/>', {
      title : 'About noplanman\'s Tsu Helper',
      html  : 'About Tsu Helper',
      click : function() {
        // Close the menu.
        $( '#navBarHead .sub_nav' ).hide();

        // Open about window in a fancybox.
        $.fancybox( $aboutWindow );
      }
    });

    // Check if there is a newer version available.
    if ( Updater.hasUpdate() ) {
      // Change the background color of the name tab on the top right.
      $( '#navBarHead .tab.name' ).addClass( 'th-update' );
      $aboutWindowLink.addClass( 'th-update' );
    }

    // Add "About" menu item.
    $( '<li/>', { 'id' : 'th-menuitem-about', html : $aboutWindowLink } )
    .appendTo( '#navBarHead .sub_nav' );

    // Get my card and add it to the about window.
    $.get( 'https://www.tsu.co/users/profile_summary/104738', function( card ) {
      $aboutWindow.append( card );
    });
  }
});
