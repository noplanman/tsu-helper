// ==UserScript==
// @name        Tsu Helper
// @namespace   tsu-helper
// @description Tsu script that adds a bunch of tweaks to make Tsu more user friendly.
// @include     http://*tsu.co*
// @include     https://*tsu.co*
// @version     1.5
// @author      Armando Lüscher
// @grant       none
// ==/UserScript==

/**
 * For changelog see https://github.com/noplanman/tsu-helper/blob/master/CHANGELOG.md
 */

// Run everything as soon as the DOM is set up.
$( document ).ready(function () {

  /***************
  HELPER FUNCTIONS
  ***************/

  /**
   * Base64 library, just decoder: http://www.webtoolkit.info/javascript-base64.html
   * @param {string} e Base64 string to decode.
   */
  function base64_decode(e){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var n="";var r,i,s;var o,u,a,f;var l=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(l<e.length){o=t.indexOf(e.charAt(l++));u=t.indexOf(e.charAt(l++));a=t.indexOf(e.charAt(l++));f=t.indexOf(e.charAt(l++));r=o<<2|u>>4;i=(u&15)<<4|a>>2;s=(a&3)<<6|f;n=n+String.fromCharCode(r);if(a!=64){n=n+String.fromCharCode(i)}if(f!=64){n=n+String.fromCharCode(s)}}return n}

  /**
   * Check if a string starts with a certain string.
   */
  if ( 'function' !== typeof String.prototype.startsWith ) {
    String.prototype.startsWith = function( str ) {
      return ( this.slice( 0, str.length ) == str );
    };
  }

  /**
   * Check if a string ends with a certain string.
   */
  if ( 'function' !== typeof String.prototype.endsWith ) {
    String.prototype.endsWith = function( str ) {
      return ( this.slice( -str.length ) == str );
    };
  }

  /**
   * Check if a string contains a certain string.
   */
  if ( 'function' !== typeof String.prototype.contains ) {
    String.prototype.contains = function( str ) {
      return ( this.indexOf( str ) >= 0 );
    };
  }

  // Add the required CSS rules.
  addCSS();

  // Output console messages?
  var debug = false;

  // Define the maximum number of hashtags and mentions allowed.
  var maxHashtags = 10;
  var maxMentions = 10;

  // URL where to get the newest script.
  var scriptURL = 'https://greasyfork.org/scripts/6372-tsu-helper/code/Tsu%20Helper.user.js';

  var localVersion = 1.5;
  var getVersionAPIURL = 'https://api.github.com/repos/noplanman/tsu-helper/contents/VERSION';
  // Check for remote version number.
  checkRemoteVersion();

  // Get the current page and start the observer.
  setTimeout( function() {
    getCurrentPage();
    startObserver();
  }, 500 );

  // As the observer can't necessarily detect any changes immediately, run functions now.
  setTimeout( function() {
    switch ( currentPage ) {
      case 'home'  :
      case 'diary' :
      case 'post'  :
        addMentionReplies();
        emphasizeNestedRepliesParents();
        break;
      case 'messages' :
        tweakMessagesPage();
        break;
      case 'friends'   :
      case 'followers' :
      case 'following' :
        startFFManager();
        break;
    }
  }, 1000 );

  // The elements that we are observing.
  var queryToObserve = 'body';
  var queryToLoad;

  var currentPage;
  /**
   * Get the current page to know which queries to load and observe and
   * also for special cases of how the Friends and Followers details are loaded.
   */
  function getCurrentPage() {
    doLog( 'Getting current page.' );
    if( $( 'body.newsfeed' ).length ) {
      // Home feed.
      currentPage    = 'home';
      queryToLoad    = '.comment';
    } else if ( $( '#profile_feed' ).length ) {
      // Diary
      currentPage    = 'diary';
      queryToLoad    = '.comment';
    } else if ( document.URL.contains( '/post/' ) || $( 'body.show_post' ).length ) {
      // Single post.
      currentPage    = 'post';
      queryToLoad    = '.comment';
    } else if ( document.URL.endsWith( '/friends' ) ) {
      // Friends.
      currentPage    = 'friends';
    } else if ( document.URL.endsWith( '/followers' ) ) {
      // Followers.
      currentPage    = 'followers';
    } else if ( document.URL.endsWith( '/following' ) ) {
      // Following.
      currentPage    = 'following';
    } else if ( document.URL.contains( '/messages/' ) || document.URL.endsWith( '/messages' ) ) {
      // Messages.
      currentPage    = 'messages';
      queryToObserve = '.messages_content';
      queryToLoad    = '.messages_content .message_box';
    }

    doLog( 'Current page: ' + currentPage );
  }


  /********
  Autofocus for title and message fields.
  ********/

  // Set focus to message entry field on page load.
  $( '#text' ).focus();

  // Auto-focus title entry field when adding title.
  $( 'body' ).on( 'click', '.create_post .options .add_title', function() {
    var $postTitle = $( this ).closest( '#create_post_form' ).find( '#title' );
    // Focus title or text field, depending if the title is being added or removed.
    if ( $postTitle.is( ':visible' ) ) {
      setTimeout( function() { $( '#text' ).focus(); }, 50 );
    } else {
      setTimeout( function() { $postTitle.focus(); }, 50 );
    }
  });

  // Auto-focus message entry field when adding/removing image.
  $( 'body' ).on( 'click', '.create_post .options .filebutton, .cancel_icon_createpost', function() {
    var $postMessage = $( this ).closest( '#create_post_form' ).find( '#text' );
    setTimeout( function() { $postMessage.focus(); }, 50 );
  });


  /********
  Check post message.
  ********/

  /**
   * Check for the maximum number of hashtags and mentions.
   * @param  {string} message The message being posted.
   * @return {boolean}        True = submit, False = cancel, Null = not too many
   */
  function checkMaximumHashtagsMentions( message ) {

    // Get number of hashtags and mentions in the message.
    var nrOfHashtags = message.split( '#' ).length - 1;
    doLog( nrOfHashtags + ' Hashtags found.' );
    var nrOfMentions = message.split( '@' ).length - 1;
    doLog( nrOfMentions + ' Mentions found.' );

    // If the limits aren't exeeded, just go on to post.
    if ( nrOfHashtags <= maxHashtags && nrOfMentions <= maxMentions ) {
      return null;
    }

    // Set up warning message.
    var warning = 'Limits may be exceeded, check your message!\nAre you sure you want to continue?\n';
    if ( nrOfHashtags > maxHashtags ) {
      warning += '\n' + nrOfHashtags + ' #hashtags found. (Max. ' + maxHashtags + ')'
      doLog( 'Too many hashtags found! (' + nrOfHashtags + ')', 'w' );
    }
    if ( nrOfMentions > maxMentions ) {
      warning += '\n' + nrOfMentions + ' @mentions found. (Max. ' + maxMentions + ')'
      doLog( 'Too many mentions found! (' + nrOfMentions + ')', 'w' );
    }

    // Last chance to make sure about hashtags and mentions.
    return confirm( warning );
  }

  /**
   * Check if the social network sharing has been selected.
   * @param  {jQuery} $form Form jQuery object of the form being submitted.
   * @return {boolean}      True = submit, False = cancel, Null = all selected
   */
  function checkSocialNetworkSharing( $form ) {

    var share_facebook = null;
    var share_twitter  = null;

    // Get all visible (connected) checkboxes. If any are not checked, show warning.
    $form.find( '.checkboxes_options_create_post input:visible' ).each(function() {
      switch ( $( this ).attr( 'id' ) ) {
        case 'facebook': share_facebook = $( this ).prop( 'checked' ); break;
        case 'twitter':  share_twitter  = $( this ).prop( 'checked' ); break;
      }
    });

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
  }

  /**
   * Called on form submit.
   * @param  {jQuery} $form Form jQuery object of the form being submitted.
   * @param  {event}  event The form submit event.
   */
  function formSubmit( $form, event ) {
    // In case the post gets cancelled, make sure the message field is focused.
    var message = $form.find( '#text' ).focus().val();
    var title   = $form.find( '#title' ).val();
    var hasPic  = ( '' != $form.find( '#create_post_pic_preview' ).text() );

    // Make sure something was entered (title, text or image.
    // Check for the maximum number of hashtags and mentions,
    // and if the Social network sharing warning has been approved.
    if ( ( '' != message || '' != title || hasPic )
      && false !== checkMaximumHashtagsMentions( message )
      && false !== checkSocialNetworkSharing( $form ) ) {
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
  }

  // Remind to post to FB and Twitter in case forgotten to click checkbox.
  $( '#create_post_form' ).submit(function( event ) {
    return formSubmit( $( this ), event );
  });

  // Are we busy waiting for the popup to appear?
  var busyWaiting = false;

  /**
   * Wait for the fancybox popup to create a new post.
   */
  function waitForPopup() {

    var $form = $( '.fancybox-overlay #create_post_form' );
    if ( $form.length ) {
      $form.find( '#text' ).focus();
      $form.submit(function( event ) {
        return formSubmit( $( this ), event );
      });
      busyWaiting = false;
      return;
    }

    // Wait around for it longer...
    setTimeout(function() {
      waitForPopup();
    }, 500);
  }

  // When using the "Create" button, wait for the post input form.
  $( '.create_post_popup' ).click(function() {
    if ( busyWaiting ) {
      return;
    }
    busyWaiting = true;
    waitForPopup();
  });

  /********
  Open post by double clicking header.
  ********/
  $( 'body' ).on( 'dblclick', '.post_header_name, .share_header', function( event ) {
    //var post_id = $( this ).closest( '.post' ).data( 'post-id' );
    var $post = $( this ).closest( '.post' );
    var isShare = $post.find( '.share_header' ).length;
    var original = ! $( this ).hasClass( 'share_header' );
    $post.find( '#post_link_dropdown a' ).each(function() {
      var linkText = $( this ).text().trim().toLowerCase();
      if ( ( ! isShare && 'open' === linkText )
        || ( ! original && 'open' === linkText )
        || ( original && 'open original post' === linkText ) ) {

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

  /********
  Emphasize nested replies.
  ********/
  /**
   * Add a specific class to all nested reply parent elements to emphasize them.
   */
  function emphasizeNestedRepliesParents() {
    doLog( 'Emphasizing nested replies parents.' );
    $( '.post_comment .load_more_post_comment_replies' ).not( '.th-nested-reply-parent' ).each(function(){
      if ( /\d+/.exec( $( this ).text() ) > 0 ) {
        $( this ).addClass( 'th-nested-reply-parent' );
      }
    });
  }

  /********
  Add @mention replies.
  ********/
  // The currently active textarea to insert the @mentions.
  var $activeReplyTextArea = null;

  /**
   * Add text to the passed textarea input field.
   * @param {jQuery} $textArea jQuery object of the textarea input field.
   * @param {string} text      Text to add.
   */
  function addTextToTextArea( $textArea, text ) {
    if ( $textArea ) {
      var textAreaText = $textArea.val();
      var caretPos1 = $textArea[0].selectionStart;
      var caretPos2 = $textArea[0].selectionEnd;
      $textArea.val( textAreaText.substring( 0, caretPos1 ) + text + textAreaText.substring( caretPos2 ) );
      $textArea[0].selectionStart = $textArea[0].selectionEnd = caretPos1 + text.length;
      $textArea.focus();
    }
  }

  /**
   * Add the @mention links to the replies.
   */
  function addMentionReplies() {
    doLog( 'Adding @mention replies.' );

    // Process all reply links to autofocus the reply textare input field.
    $( '.load_more_post_comment_replies' ).not( '.th-reply-processed' ).each(function() {
      var $replyLink = $( this );
      $replyLink.click(function() {
        var $postComment = $replyLink.closest( '.post_comment' );
        var $replyContainer = $postComment.siblings( '.comment_reply_container' );
        var $textArea = $replyContainer.children( '.post_write_comment' ).find( '#comment_text' );

        // This gets called before the "official" click, so the logic is inversed!
        // And delay everything a bit too, as it gets lazy-loaded.
        if ( $replyContainer.is( ':visible' ) ) {
          setTimeout(function() {
            // Only set the active textarea null if it's this one.
            if ( $textArea[0] == $activeReplyTextArea[0] ) {
              $activeReplyTextArea = null;
              // Hide all @ links.
              $( '.th-at-reply' ).hide();
            }
          }, 100);
        } else {
          setTimeout(function() {
            $postComment.find( '.th-at-reply' ).show();
            $textArea.focus();
          }, 100);
        }
      });
      $replyLink.addClass( 'th-reply-processed' );
    });

    // Process all comment / reply textarea input fields to set themselves as active on focus.
    $( '.post_write_comment #comment_text' ).not( '.th-textarea-processed' ).each(function() {
      $( this ).focusin( function() {
        $activeReplyTextArea = $( this );
        $( '.th-active-input' ).removeClass( 'th-active-input' );
        $activeReplyTextArea.closest( '.expandingText_parent' ).addClass( 'th-active-input' );
      });
      $( this ).addClass( 'th-textarea-processed' );
    });

    // Link for all comments.
    $( '.post_comment_header' ).not( '.th-at-added' ).each(function() {
      var $head = $( this );
      var $commentArea = $head.closest( '.post_comment' );

      // Get just the last part of the href, the username.
      var hrefBits = $head.find( 'a' ).attr( 'href' ).split( '/' );
      var atUsername = '@' + hrefBits[ hrefBits.length - 1 ] + ' ';

      var $mentionLink = $( '<a/>', {
        html  : '@ +',
        title : 'Add ' + atUsername + 'to current reply.',
        class : 'th-at-reply'
      })
      .hide() // Start hidden, as it will appear with the mouse over event.
      .click(function() {
        addTextToTextArea( $activeReplyTextArea, atUsername );
      });

      // Show / hide link on hover / blur if there is an active reply input selected.
      $commentArea.hover(
        function() { if ( $activeReplyTextArea && $activeReplyTextArea.length ) { $mentionLink.show(); } },
        function() { $mentionLink.hide(); }
      );

      $head.addClass( 'th-at-added' );

      // Position the @ link.
      var $profilePic = $head.find( '.post_profile_picture' );
      var offset = $profilePic.position();
      $mentionLink.offset({ top: offset.top + $profilePic.height(), left: offset.left });

      $head.append( $mentionLink );
    });

    // Link for all textareas.
    $( '.post_write_comment' ).not( '.th-at-added' ).each(function() {
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
        html  : '@ >',
        title : 'Add ' + atUsername + 'to this ' + ( ( isReply ) ? 'reply.' : 'comment.' ),
        class : 'th-at-comment'
      })
      .hide() // Start hidden, as it will appear with the mouse over event.
      .click(function() {
        addTextToTextArea( $commentInput, atUsername );
      });

      // Show / hide link on hover / blur.
      $commentArea.hover(
        function() { $mentionLink.show(); },
        function() { $mentionLink.hide(); }
      );

      $commentArea.addClass( 'th-at-added' );

      $commentArea.find( '.post_profile_picture' ).parent().after( $mentionLink );
    });

  }

  /********
  Tweak the messages page.
  ********/
  /**
   * Autofocus text input and add line breaks to messages.
   */
  function tweakMessagesPage() {
    if ( document.URL.endsWith( '/new' ) ) {
      $( '#message_to_textarea' ).focus();
    } else {
      $( '#message_body' ).focus();
    }
    $( '.messages_content .message_box' ).each(function(){
      if ( ! $( this ).hasClass( 'tsu-helper-tweaked' ) ) {
        var $text = $( this ).find( '.message-text' );
        $text.html( $text.html().trim().replace(/(?:\r\n|\r|\n)/g, '<br />') );
        $( this ).addClass( 'tsu-helper-tweaked' );
      }
    });
  }

  /********
  Friends and Followers Manager.
  ********/

  // Cards per page request of Followers / Following.
  var ffmCardsPerPage = 12;

  // The total amount of pages to preload.
  var ffmTotalPages = 0;

  // The real number of Friends / Followers / Following.
  var ffmTotalFFFs = 0;

  // List of active Ajax requests.
  var ffmAjaxRequests = {};

  // The current chain request.
  var $ffmAjaxChainRequest = null;

  // Is the search busy?
  var ffmBusy = false;
  var ffmChainBusy = false;

  // The number of found friend requests.
  var ffmCount = {
    'fandf'    : 0,
    'received' : 0,
    'sent'     : 0
  };

  // The start and cancel buttons and status text.
  var $ffmLinkCancel;
  var $ffmLinkStart;
  var $ffmStatusText;
  var $ffmLinkUnfollowFriends;
  var $ffmTotalFFFs;
  var ffmFilterCheckboxes = {};

  function ffmUpdateStatus( type ) {
    if ( null === type ) {
      $ffmStatusText.find( 'span' ).html( '0' );
      $ffmTotalFFFs.html( '-' );
      return;
    }
    var $el = $ffmStatusText.find( '.th-ffm-card-' + type + ' span' );
    switch ( type ) {
      case 'fandf'    : $el.html( ++ffmCount.fandf );    break;
      case 'received' : $el.html( ++ffmCount.received ); break;
      case 'sent'     : $el.html( ++ffmCount.sent );     break;
    }
  }

  /**
   * Get a page of Follower/Following cards.
   * @param  {integer} pageNr  The page number to get.
   * @param  {boolean} isChain If this a chain request, continue getting consecutive pages.
   */
  function ffmGetPage( pageNr, isChain ) {
    // Has the user cancelled the chain?
    if ( isChain && ! ffmChainBusy ) {
      doLog( 'Jumped out of chain.' );
      return;
    }

    doLog( 'Getting page ' + pageNr );

    var fetch_url = '/users/profiles/users_list/' + window.current_user.id + '/' + currentPage + '/' + pageNr;

    var $ffmAjaxCurrentRequest = $.get( fetch_url, function( data ) {
      // Get all the cards.
      var $cards = $( data ).siblings( '.card' );

      // Count each card to determine correct total count.
      ffmTotalFFFs += $cards.length;
      $ffmTotalFFFs.html( ffmTotalFFFs );

      if ( $cards.length ) {
        // Flag each card and add to stack.
        $cards.each(function() {

          var $followButton = $( this ).find( '.follow_button.grey' );
          var $friendButton = $( this ).find( '.friend_button.grey' );
          if ( $friendButton.length ) {
            var type;
            // Find only respond and request links. Also show cards that are friends and following.
            if ( $friendButton.hasClass( 'friend_request_box' ) ) {
              type = 'received';
            } else if ( $friendButton.attr( 'href' ).contains( '/cancel/' ) ) {
              type = 'sent';
            } else if ( $followButton.length && $friendButton.length ) {
              type = 'fandf';
            } else {
              // Next card.
              return;
            }
            $( '.profiles_list .card:not(.th-ffm-card):first' ).before( $( this ).addClass( 'th-ffm-card th-ffm-card-' + type ) );
            ffmUpdateStatus( type );
          }
        });
      }
      // Are there more pages to load?
      if ( isChain ) {
        if ( $( data ).siblings( '.loadmore_profile' ).length ) {
          // Get the next page.
          ffmGetPage( pageNr + 1, true );
        } else {
          doLog( 'Chain completed on page ' + pageNr );
          ffmChainBusy = false;
        }
      }
    })
    .fail(function( xhr, status, error ) {
      if ( 'abort' == status ) {
        doLog( 'Abort page ' + pageNr );
      } else {
        doLog( 'Error on page ' + pageNr + '! (' + status + ':' + error + ')' );
      }
    })
    .always(function() {
      doLog( 'Finished page ' + pageNr );
      // After the request is complete, remove it from the array.
      delete ffmAjaxRequests[ pageNr ];
      ffmCheckIfFinished();
    });

    // If this is a chain request, set the ffmAjaxChainRequest variable.
    // If not, add it to the requests array.
    if ( isChain ) {
      $ffmAjaxChainRequest = $ffmAjaxCurrentRequest;
    } else {
      ffmAjaxRequests[ pageNr ] = $ffmAjaxCurrentRequest;
    }
  }

  /**
   * Check if the Friend Request search is finished.
   */
  function ffmCheckIfFinished() {
    var activeRequests = Object.keys( ffmAjaxRequests ).length;
    doLog( activeRequests + ' pages left.' );
    doLog( ffmChainBusy );
    if ( ! ffmChainBusy && 0 == activeRequests ) {
      ffmFinished();
    }
  }

  /**
   * Start the FFM.
   */
  function ffmStart() {
    ffmBusy = ffmChainBusy = true;
    ffmTotalFFFs = ffmCount.received = ffmCount.sent = ffmCount.fandf = 0;
    ffmUpdateStatus( null );
    $ffmStatusText.find( 'input' ).attr( 'disabled', true ).prop( 'checked', true );
    $ffmStatusText.show();
    $ffmTotalFFFs.show();
    $ffmLinkUnfollowFriends.hide();

    // Clear any previous results.
    $( '.th-ffm-card' ).remove();

    // Load all pages and start the chain loading on the last page.
    for ( var i = ffmTotalPages; i >= 1; i-- ) {
      ffmGetPage( i, i == ffmTotalPages );
    };

    $ffmLinkStart.hide();
    $ffmLinkCancel.show();
  }

  /**
   * Finish off the FFM.
   * @param  {boolean} cancelled If the FFM has been cancelled.
   */
  function ffmFinished( cancelled ) {
    ffmBusy = ffmChainBusy = false;
    $ffmStatusText.find( 'input' ).removeAttr( 'disabled' );

    if ( ffmCount.fandf ) {
      $ffmLinkUnfollowFriends.show();
    }

    if ( cancelled ) {
      // Abort all AJAX requests.
      for ( var page in ffmAjaxRequests ) {
        ffmAjaxRequests[ page ].abort();
        delete ffmAjaxRequests[ page ];
      };

      // Abort the current AJAX chain request.
      $ffmAjaxChainRequest.abort();

      // The total number is incomplete, so hide it.
      $ffmTotalFFFs.hide();
    }

    $ffmLinkCancel.hide();
    $ffmLinkStart.show();
  }

  /**
   * Cancel the FFM.
   */
  function ffmCancel() {
    // Call finished with the cancelled parameter.
    ffmFinished( true );
  }

  /**
   * Display / Hide certain categories.
   * @param  {string}  type  The type of cards to display / hide.
   * @param  {boolean} state True: display, False: hide.
   */
  function ffmFilter( type, state ) {
    if ( state ) {
      $( '.th-ffm-card.th-ffm-card-' + type ).show();
    } else {
      $( '.th-ffm-card.th-ffm-card-' + type ).hide();
    }
  }

  /**
   * Automatically Unfollow all the loaded Friends.
   */
  function ffmUnfollowFriends() {
    var toUnfollow = $( '.th-ffm-card.th-ffm-card-fandf .follow_button.grey' );
    if ( toUnfollow.length && confirm( 'Are you sure you want to Unfollow all ' + toUnfollow.length + ' Friends on this page?\nThey will still be your Friends.\n\n(this cannot be undone)' ) ) {
      var unfollowed = 0;
      $( '.th-ffm-card.th-ffm-card-fandf .follow_button.grey' ).each(function() {
        this.click();
        unfollowed++;
      });
      $ffmLinkUnfollowFriends.hide();
      alert( unfollowed + ' Friends have been Unfollowed!');
    }
  }

  // This feature is only available to your own profile!
  function startFFManager() {
    if ( window.current_user.username == $( '.profile_details .summary .username' ).text().trim().substring( 1 ) ) {
      var $title = $( '.profiles_list .title' );

      // Get the number of pages required to load all users in the list, 12 per page.
      ffmTotalPages = Math.ceil( /\d+/.exec( $title.text() ) / ffmCardsPerPage ) || 1;
      doLog( 'Total number of pages to load: ' + ffmTotalPages );
      // As this number isn't totally correct, load all the pages
      // and chain-load from the last page as far as needed.

      // Real number of FFFs.
      $ffmTotalFFFs = $( '<span/>', {
        'id'  : 'th-ffm-total-fffs',
        title : 'Correct count',
        html  : '-'
      })
      .hide() // Start hidden.
      .appendTo( $title );

      // Cancel link.
      $ffmLinkCancel = $( '<a/>', {
        'id'  : 'th-ffm-link-cancel',
        title : 'Cancel current search',
        html  : 'Cancel'
      })
      .click( function() { ffmCancel(); } )
      .hide() // Start hidden.
      .appendTo( $title );

      // Start link.
      $ffmLinkStart = $( '<a/>', {
        'id'  : 'th-ffm-link-start',
        title : 'Search for pending Friend Requests and Friends you also Follow.',
        html  : 'F&F Manager'
      })
      .click( function() { ffmStart(); } )
      .appendTo( $title );

      // Status text to display the number of found items.
      $ffmStatusText = $( '<span/>', {
        'id' : 'th-ffm-status-text',
        html : '<label title="Friends also being Followed" class="th-ffm-card-fandf"><span>0</span> F&F</label>&nbsp;' +
               '<label title="Received Friend Requests" class="th-ffm-card-received"><span>0</span> received</label>&nbsp;' +
               '<label title="Sent Friend Requests" class="th-ffm-card-sent"><span>0</span> sent</label>'
      })
      .hide() // Start hidden.
      .appendTo( $title );

      // Assign checkbox clicks to show / hide results.
      $( '<input/>', { 'id' : 'th-ffm-cb-fandf',    type : 'checkbox', checked : 'checked' } ).change( function() { ffmFilter( 'fandf',    this.checked ) } ).prependTo( $ffmStatusText.find( '.th-ffm-card-fandf' ) );
      $( '<input/>', { 'id' : 'th-ffm-cb-received', type : 'checkbox', checked : 'checked' } ).change( function() { ffmFilter( 'received', this.checked ) } ).prependTo( $ffmStatusText.find( '.th-ffm-card-received' ) );
      $( '<input/>', { 'id' : 'th-ffm-cb-sent',     type : 'checkbox', checked : 'checked' } ).change( function() { ffmFilter( 'sent',     this.checked ) } ).prependTo( $ffmStatusText.find( '.th-ffm-card-sent' ) );

      $ffmLinkUnfollowFriends = $( '<a/>', {
        'id'  : 'th-ffm-unfollow-friends',
        title : 'Unfollow all Friends on this page',
        html  : 'unfollow'
      })
      .click( function() { ffmUnfollowFriends() } )
      .hide() // Start hidden.
      .prependTo( $ffmStatusText );
    }
  }

  /**
   * Make a log entry if debug mode is active.
   * @param {string}  logMessage Message to write to the log console.
   * @param {string}  level      Level to log ([l]og,[i]nfo,[w]arning,[e]rror).
   * @param {boolean} alsoAlert  Also echo the message in an alert box.
   */
  function doLog( logMessage, level, alsoAlert ) {
    if ( debug ) {
      switch( level ) {
        case 'i' : console.info( logMessage );  break;
        case 'w' : console.warn( logMessage );  break;
        case 'e' : console.error( logMessage ); break;
        default  : console.log( logMessage );
      }
      if ( alsoAlert ) {
        alert( logMessage );
      }
    }
  }

  /**
   * Start observing for DOM changes.
   */
  function startObserver() {
    doLog( 'Start Observer.', 'i' );

    // Check if we can use the MutationObserver.
    if ( 'MutationObserver' in window ) {
      var toObserve = document.querySelector( queryToObserve );
      if ( toObserve ) {
        var observer = new MutationObserver( function( mutations ) {

          // Helper to determine if added or removed nodes have a specific class.
          function mutationNodesHaveClass( mutation, classes ) {
            classes = classes.split( ',' );

            // Added nodes.
            for ( var m = mutation.addedNodes.length - 1; m >= 0; m-- ) {
              for ( var c = classes.length - 1; c >= 0; c-- ) {
                // In case the node has no className (e.g. textnode), just ignore it.
                try {
                  if ( mutation.addedNodes[ m ].className.contains( classes[ c ].trim() ) ) {
                    return true;
                  }
                } catch( e ) { }
              };
            };

            // Removed nodes.
            for ( var m = mutation.removedNodes.length - 1; m >= 0; m-- ) {
              for ( var c = classes.length - 1; c >= 0; c-- ) {
                // In case the node has no className (e.g. textnode), just ignore it.
                try {
                  if ( mutation.removedNodes[ m ].className.contains( classes[ c ].trim() ) ) {
                    return true;
                  }
                } catch( e ) { }
              };
            };
          }

          doLog( mutations.length + ' DOM changes.' );
          doLog( mutations );

          var reload = false;
          // Ignore post and comment time updates and other specific changes.
          for ( var m = mutations.length - 1; m >= 0; m-- ) {
            var classes = mutations[ m ].target.className;
            if ( ! classes.contains( 'comment_time_from_now' )
              && ! classes.contains( 'time_to_update' )
              && ! mutationNodesHaveClass( mutations[ m ], 'tooltipster,th-at-added' ) ) {
              reload = true;
              break;
            }
          }

          // Only reload data if we're on the right page.
          if ( reload ) {
            switch ( currentPage ) {
              case 'home'  :
              case 'diary' :
              case 'post'  :
                addMentionReplies();
                emphasizeNestedRepliesParents();
                break;
              case 'messages' :
                tweakMessagesPage();
                break;
            }
          }
        });

        // Observe child and subtree changes.
        observer.observe( toObserve, {
          childList: true,
          subtree: true
        });
      }
    } else {
      // If we have no MutationObserver, use "waitForKeyElements" function.
      // Instead of using queryToObserve, we wait for the ones that need to be loaded, queryToLoad.
      $.getScript( 'https://gist.github.com/raw/2625891/waitForKeyElements.js', function() {
        switch ( currentPage ) {
          case 'home'  :
          case 'diary' :
          case 'post'  :
            waitForKeyElements( queryToLoad, addMentionReplies );
            waitForKeyElements( queryToLoad, emphasizeNestedRepliesParents );
            break;
          case 'messages' :
            waitForKeyElements( queryToLoad, tweakMessagesPage );
            break;
        }
      });
    }
  }

  /**
   * Add the required CSS rules.
   */
  function addCSS() {
    doLog( 'Added CSS.' );
    $( '<style>' )
      .html( '\
        #th-menuitem-update a:before { display: none !important; }\
        #th-menuitem-update a { background-color: #f1b054 !important; color: #fff !important; width: 100% !important; padding: 8px !important; box-sizing: border-box; text-align: center; }\
        #th-ffm-unfollow-friends{ background: #dc3a50; color: #fff; font-size: .8em; }\
        #th-ffm-total-fffs { background: #090; color: #fff; margin-left: 8px !important; }\
        #th-ffm-link-start, #th-ffm-link-cancel { float: right; padding: 2px; }\
        #th-ffm-link-cancel { background: url(/assets/loader.gif) no-repeat; padding-left: 24px; }\
        #th-ffm-status-text { float: right; margin-right: 8px; }\
        #th-ffm-status-text label, #th-ffm-total-fffs, #th-ffm-unfollow-friends { padding: 2px 5px; border-radius: 3px; border: 1px solid rgba(0,0,0,.5); margin: -1px; }\
        #th-ffm-status-text input { margin: 0 5px 0 2px; }\
        #th-ffm-status-text * { display: inline-block; cursor: pointer; }\
        .th-ffm-card-received { background: #cfc; }\
        .th-ffm-card-sent { background: #eef; }\
        .th-ffm-card-fandf { background: #ffc; }\
        .th-nested-reply-parent { text-decoration: underline; color: #777 !important; }\
        .th-at-comment, .th-at-reply { z-index: 1; font-weight: bold; font-size: 0.8em; display: block; position: absolute; background: #1ABC9C; color: #fff; border-radius: 3px; padding: 2px; }\
        .th-at-comment { margin-left: 11px; }\
        .th-active-input { border-color: rgba(0,0,0,.4) !important; }\
        .post_comment { position: relative; }\
      ')
      .appendTo( 'head' );
  }

  /**
   * Get the remote version on GitHub and output a notification if a newer version is found.
   */
  function checkRemoteVersion() {
    $.getJSON( getVersionAPIURL, function ( response ) {
      var remoteVersion = parseFloat( base64_decode( response.content ) );
      doLog( 'Versions: Local (' + localVersion + '), Remote (' + remoteVersion + ')', 'i' );

      // Check if there is a newer version available.
      if ( remoteVersion > localVersion ) {
        // Change the background color of the name tab on the top right.
        $( '#navBarHead .tab.name' ).css( 'background-color', '#f1b054' );

        // Make sure the update link doesn't already exist!
        if ( 0 === $( '#th-menuitem-update' ).length ) {
          var $updateLink = $( '<a/>', {
            title : 'Update Tsu Helper script to the newest version (' + remoteVersion + ')',
            href  : scriptURL,
            html  : 'Update Tsu Helper!'
          })
          .attr( 'target', '_blank' ) // Open in new window / tab.
          .click(function() {
            if ( ! confirm( 'Upgrade to the newest version (' + remoteVersion + ')?\n\n(refresh this page after the script has been updated)' ) ) {
              return false;
            }
          });

          $( '<li/>', { 'id' : 'th-menuitem-update', html: $updateLink } )
          .appendTo( '#navBarHead .sub_nav' );
        }

      }
    })
    .fail(function() {
      doLog( 'Couldn\'t get remote version number for Tsu Helper.', 'w' );
    });
  }

})();