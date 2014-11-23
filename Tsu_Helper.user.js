// ==UserScript==
// @name        Tsu Helper
// @namespace   tsu-helper
// @description Tsu script that adds a bunch of tweaks to make Tsu more user friendly.
// @include     http://*tsu.co*
// @include     https://*tsu.co*
// @version     1.1
// @author      Armando Lüscher
// @grant       none
// ==/UserScript==

/**
 * For changelog see https://github.com/noplanman/tsu-helper/blob/master/CHANGELOG.md
 */

$( document ).ready(function () {

  /***************
  HELPER FUNCTIONS
  ***************/

  /**
   * Base64 library, just decoder: http://www.webtoolkit.info/javascript-base64.html
   * @param {string} e Base64 string to decode.
   */
  function base64_decode(e){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var n="";var r,i,s;var o,u,a,f;var l=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(l<e.length){o=t.indexOf(e.charAt(l++));u=t.indexOf(e.charAt(l++));a=t.indexOf(e.charAt(l++));f=t.indexOf(e.charAt(l++));r=o<<2|u>>4;i=(u&15)<<4|a>>2;s=(a&3)<<6|f;n=n+String.fromCharCode(r);if(a!=64){n=n+String.fromCharCode(i)}if(f!=64){n=n+String.fromCharCode(s)}}return n}


  // Add the required CSS rules.
  addCSS();

  // Output console messages?
  var debug = false;

  // Define the maximum number of hashtags and mentions allowed.
  var maxHashtags = 10;
  var maxMentions = 10;

  // Cards per page request of Followers / Following.
  var cardsPerPage = 12;

  // URL where to get the newest script.
  var scriptURL = 'https://greasyfork.org/scripts/6372-tsu-helper/code/Tsu%20Helper.user.js';

  var localVersion = 1.1;
  var getVersionAPIURL = 'https://api.github.com/repos/noplanman/tsu-helper/contents/VERSION';
  // Check for remote version number.
  checkRemoteVersion();


  /********
  Autofocus for title and message fields.
  ********/

  // Set focus to message entry field on page load.
  $( '#message, #message_body' ).focus();

  // Auto-focus title entry field when adding title.
  $( 'body' ).on( 'click', '.create_post .options .add_title', function() {
    var $postTitle = $( this ).closest( '#create_post_form' ).find( '#title' );
    setTimeout( function() { $postTitle.focus(); }, 50 );
  });

  // Auto-focus message entry field when adding/removing image.
  $( 'body' ).on( 'click', '.create_post .options .filebutton, .cancel_icon_createpost', function() {
    var $postMessage = $( this ).closest( '#create_post_form' ).find( '#message' );
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
    var warning = 'Limits exceeded, check your message! Are you sure you want to continue?\n';
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
    var $message = $form.find( '#message' );
    var message = $message.val();

    // In case the post gets canceled, make sure the message field is focused.
    $message.focus();

    // Make sure something was entered.
    // Check for the maximum number of hashtags and mentions,
    // and if the Social network sharing warning has been approved.
    if ( '' != message
      && false !== checkMaximumHashtagsMentions( message )
      && false !== checkSocialNetworkSharing( $form ) ) {
      return;
    }


    /**************************
    * CANCEL FORM SUBMISSION! *
    **************************/

    // Prevent form post.
    event.preventDefault();

    // Hide the loader wheel.
    $form.find( '.loading' ).hide();

    // Make sure to enable the post button again. Give it some time, as Tsu internal script sets it to disabled.
    setTimeout(function(){
      $form.find( '#create_post_button' ).removeAttr( 'disabled' );
    }, 500 );
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
      $form.find( '#message' ).focus();
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
  Find unanswered friend requests.
  ********/
  // This feature is only available to your own profile!
  if ( window.current_user.username == $( '.profile_details .summary .username' ).text().trim().substring( 1 ) ) {
    // Are we on the right profile page?
    var currentPage = null;
    if ( $( 'body.profile.following' ).length ) { currentPage = 'following'; }
    if ( $( 'body.profile.followers' ).length ) { currentPage = 'followers'; }

    doLog( 'Current page: ' + currentPage );

    if ( currentPage ) {

      var $title = $( '.profiles_list .title' );

      // Get the number of pages required to load all users in the list, 12 per page.
      var totalPages = Math.ceil( /\d+/.exec( $title.text() ) / cardsPerPage );
      doLog( 'Total number of pages to load: ' + totalPages );
      // As this number isn't totally correct, load all the pages
      // and chain-load from the last page as far as needed.

      // Cancel link.
      var $ffrLinkCancel = $( '<a/>', {
        title: 'Cancel current search',
        html: '<img class="tff-loader-wheel" src="/assets/loader.gif" /> Cancel',
        'id': 'ffr-link-cancel'
      })
      .click(function() { ffrCancel(); })
      .hide() // Start hidden.
      .appendTo( $title );

      // Start link.
      var $ffrLinkStart = $( '<a/>', {
        title: 'Search for pending Friend Requests you might have missed.',
        html: 'Find pending Friend Requests',
        'id': 'ffr-link-find'
      })
      .click(function() { ffrStart(); })
      .appendTo( $title );

      // List of active Ajax requests.
      var ffrAjaxRequests = {};
      // The current chain request.
      var $ffrAjaxChainRequest = null;
      // Is the search busy?
      var ffrBusy = false;
      var ffrChainBusy = false;

      /**
       * Cancel the Friend Request search.
       */
      function ffrCancel() {
        ffrBusy = false;
        ffrChainBusy = false;

        // Abort all AJAX requests.
        for ( var page in ffrAjaxRequests ) {
          ffrAjaxRequests[ page ].abort();
          delete ffrAjaxRequests[ page ];
        };

        // Abort the current AJAX chain request.
        $ffrAjaxChainRequest.abort();

        $ffrLinkCancel.hide();
        $ffrLinkStart.show();
      }

      /**
       * Get a page of Follower/Following cards.
       * @param  {integer} pageNr  The page number to get.
       * @param  {boolean} isChain If this a chain request, continue getting consecutive pages.
       */
      function ffrGetPage( pageNr, isChain ) {
        // Has the user cancelled the chain?
        if ( isChain && ! ffrChainBusy ) {
          return;
        }

        doLog( 'Getting page ' + pageNr );

        var fetch_url = '/users/profiles/users_list/' + window.current_user.id + '/' + currentPage + '/' + pageNr;

        var $ffrAjaxCurrentRequest = $.get( fetch_url, function( data ) {
          // Get all the cards.
          var $cards = $( data ).siblings( '.card' );
          if ( $cards.length ) {

            // Flag each card and add to stack.
            $cards.each(function() {
              // Find only respond links...
              if ( $( this ).find( '.friend_request_box' ).length ) {
                // And add it to the list before all the other cards.
                $( '.profiles_list .card:not(.tsu-helper-card):first' ).before( $( this ).addClass( 'tsu-helper-card' ) );
              }
            });

            // Are there more pages to load?
            if ( isChain ) {
              if ( $( data ).siblings( '.loadmore_profile' ).length ) {
                // Get the next page.
                ffrGetPage( pageNr + 1, true );
              } else {
                doLog( 'Chain completed at page ' + pageNr );
                ffrChainBusy = false;
              }
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
          if ( ! isChain ) {
            delete ffrAjaxRequests[ pageNr ];
          }
          ffrCheckIfFinished();
        });

        // If this is a chain request, set the ffrAjaxChainRequest variable.
        // If not, add it to the requests array.
        if ( isChain ) {
          $ffrAjaxChainRequest = $ffrAjaxCurrentRequest;
        } else {
          ffrAjaxRequests[ pageNr ] = $ffrAjaxCurrentRequest;
        }
      }

      /**
       * Check if the Friend Request search is finished.
       */
      function ffrCheckIfFinished() {
        var activeRequests = Object.keys( ffrAjaxRequests ).length;
        doLog( 'Checking... ' + activeRequests + ' left.' );
        if ( ! ffrChainBusy && activeRequests == 0 ) {
          ffrCancel();
        }
      }

      /**
       * Start the Friend Request search.
       */
      function ffrStart() {
        ffrBusy = true;
        ffrChainBusy = true;

        // Clear any previous results.
        $( '.tsu-helper-card' ).remove();

        // Load all pages and start the chain loading on the last page.
        for (var i = totalPages; i >= 1; i-- ) {
          ffrGetPage( i, i == totalPages );
        };

        $ffrLinkStart.hide();
        $ffrLinkCancel.show();
      }

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
        case 'i': console.info( logMessage );  break;
        case 'w': console.warn( logMessage );  break;
        case 'e': console.error( logMessage ); break;
        default: console.log( logMessage );
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
    doLog( 'Added CSS.' );
    $( '<style>' )
      .html( '\
        #tsu-helper-menuitem-update a:before {\
          display: none !important;\
        }\
        #ffr-link-find, #ffr-link-cancel {\
          float: right;\
        }\
        .tsu-helper-card {\
          background: #cfc;\
        }\
      ')
      .appendTo( 'head' );
  }

  /**
   * Get the remote version on GitHub and output a message if a newer version is found.
   */
  function checkRemoteVersion() {
    $.getJSON( getVersionAPIURL, function ( response ) {
      var remoteVersion = parseFloat( base64_decode( response.content ) );
      doLog( 'Versions: Local (' + localVersion + '), Remote (' + remoteVersion + ')', 'i' );

      // Check if there is a newer version available.
      if ( remoteVersion > localVersion ) {
        // Change the background color of the name tab on the top right.
        $( '#navBarHead .tab.name' ).css( 'background-color', '#F1B054' );

        // Make sure the update link doesn't already exist!
        if ( 0 === $( '#tsu-helper-menuitem-update' ).length ) {
          var $updateLink = $( '<a/>', {
            title: 'Update Tsu Helper script to the newest version (' + remoteVersion + ')',
            href: scriptURL,
            html: 'Update Tsu Helper!'
          })
          .attr( 'target', '_blank' ) // Open in new window / tab.
          .css( { 'background-color' : '#F1B054', 'color' : '#fff' } ) // White text on orange background.
          .click(function() {
            if ( ! confirm( 'Upgrade to the newest version (' + remoteVersion + ')?\n\n(refresh this page after the script has been updated)' ) ) {
              return false;
            }
          });

          $( '<li/>', { 'id': 'tsu-helper-menuitem-update', html: $updateLink } )
          .appendTo( '#navBarHead .sub_nav' );
        }

      }
    })
    .fail(function() { doLog( 'Couldn\'t get remote version number for Tsu Helper.', 'w' ); });
  }

})();