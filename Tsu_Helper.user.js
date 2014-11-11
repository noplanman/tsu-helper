// ==UserScript==
// @name        Tsu Helper
// @namespace   tsu-helper
// @description Tsu script that adds a bunch of tweaks to make Tsu more user friendly.
// @include     http://*tsu.co*
// @include     https://*tsu.co*
// @version     1.0
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


  // Output console messages?
  var debug = false;

  // Define the maximum number of hashtags and mentions allowed.
  var maxHashtags = 10;
  var maxMentions = 10;

  // URL where to get the newest script.
  var scriptURL = 'https://greasyfork.org/scripts/6372-tsu-helper/code/Tsu%20Helper.user.js';

  var localVersion = 1.0;
  var getVersionAPIURL = 'https://api.github.com/repos/noplanman/tsu-helper/contents/VERSION';
  // Check for remote version number.
  checkRemoteVersion();

  // Set focus to message entry field on page load.
  $( '#message' ).focus();

  // Auto-focus title entry field when adding title.
  $( 'body' ).on( 'click', '.create_post .options .add_title', function() {
    var $postTitle = $( this ).closest( '#create_post_form' ).find( '#title' );
    setTimeout( function() { $postTitle.focus(); }, 50);
  });

  // Auto-focus message entry field when adding/removing image.
  $( 'body' ).on( 'click', '.create_post .options .filebutton, .cancel_icon_createpost', function() {
    var $postMessage = $( this ).closest( '#create_post_form' ).find( '#message' );
    setTimeout( function() { $postMessage.focus(); }, 50);
  });


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

  // Open post by double clicking header.
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