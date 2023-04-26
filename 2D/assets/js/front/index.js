/* jshint unused:false */
/*!
 * Project:     {{app.name}}
 * File:        assets/js/front/index.js
 * Copyright(c) 2016-nowdays {{author.name.full}} <{{author.email}}>
 * License:     {{project.license}}
 */

'use strict';

window.jQuery(function ($) {

  let defOpts = Object.assign({}, {
    selector: 'div'
    , inclass:  ''
    , outclass: ''
  });

  // ---------------------------------------------------------------------------
  // Waypoints
  // ---------------------------------------------------------------------------
  let wShow = function (o) {
    let opts = Object.assign({}, defOpts || {}, o || {});

    return new window.Waypoint.Inview({
      element: $(opts.selector)
      , enter: function (dir) {
          // console.log('[Enter] for', this.element , 'with direction', dir);
          this.element.removeClass(opts.outclass).addClass(opts.inclass);
        }
      , entered: function (dir) {
          // console.log('[Entered] for', this.element, 'with direction', dir);
        }
      , exit: function (dir) {
          // console.log('[Exit] for ', this.element , 'with direction', dir);
        }
      , exited: function (dir) {
          // console.log('[Exited] for ', this.element , 'with direction', dir);
          this.element.removeClass(opts.inclass).addClass(opts.outclass);
        }
      , offset: function () {
          return 70 + this.element.clientHeight;
        }

      // , offset: opts.offset || '-50%'

    });

  };

  // ---------------------------------------------------------------------------
  //  Animations
  // ---------------------------------------------------------------------------
  // (function () {

  //   let w = window;
  //   let dataRoot = w.location.origin + '/2d/data/';

  //   // Examine the text in the response
  //   function status (r) {
  //     if (r.status >= 200 && r.status < 300) {
  //       // console.log('Response Status Code: ' + r.status);
  //       return Promise.resolve(r);
  //     } else {
  //       console.warn('Looks like there was a problem. Status Code: ' + r.status);
  //       return Promise.reject(new Error(r.statusText));
  //     }
  //   }

  //   // Parse response text into javascript object
  //   function json (r) {
  //     let contentType = r.headers.get('content-type');
  //     if (contentType && contentType.includes('application/json')) {
  //       return r.json();
  //     }else if (contentType && contentType.includes('text/plain')) {
  //       return JSON.parse(r);
  //     }
  //     throw new TypeError('Oops, we haven\'t got JSON!');
  //   }

  //   // Get response text
  //   function text (r) {
  //     return r.text();
  //   }

  //   // Fetch animations configuration
  //   let AnimationsConfig = fetch(dataRoot + 'animations.json')
  //     .then(status)
  //     .then(json)
  //     .then(function (lo) {
  //       // console.log('Fetch Request succeeded with JSON response (', typeof lo, '): [', lo, ']');
  //       return Promise.resolve(lo.animations);
  //     })
  //     .catch(function (err) {
  //       console.warn('Failed to fetch DATA: [', err, ']');
  //       return Promise.reject(err);
  //     });

  //   // Enable animations on elements
  //   let AnimationsEnabled = AnimationsConfig.then(function (loAnimations) {
  //     return Promise.resolve(loAnimations).then(function (lo) {
  //       return new Promise(function (resolve, reject) {
  //         $.each(lo, function (i, o) {
  //           // Assign Waypoint animation handler
  //           try {
  //             wShow(o);
  //           } catch(err) {
  //             console.error(err);
  //             console.log(o);
  //           }
            
  //         });
  //         return resolve();
  //       });
  //     });

  //   })
  //   .catch(function (e) {
  //     console.log('Failed to Enable Animations: [', e, ']');
  //     return Promise.reject(e);
  //   });

  //   AnimationsEnabled.then(function () {
  //     console.log('%c✓ %cAnimations: ENABLED', 'color:green;font-weight:bold;font-size:16px;', 'color:blue;font-weight:bold;');
  //     return Promise.resolve(true);
  //   })
  //   .catch(function (e) {
  //     console.warn('Animations NOT ENABLED: [', e, ']');
  //     return Promise.reject(e);
  //   });

  // })();

  // ---------------------------------------------------------------------------
  //  NOTY
  // ---------------------------------------------------------------------------
  (function () {
    $.noty.defaults = {
      layout:         'topRight'
      , theme:        'defaultTheme'     // or relax
      , type:         'success'          // alert, success, error, warning, information, notification
      , text:         ''                 // [string|html] can be HTML or STRING
      , dismissQueue: true               // [boolean] If you want to use queue feature set this true
      , force:        false              // [boolean] adds notification to the beginning of queue when set to true
      , maxVisible:   8                  // [integer] you can set max visible notification count for dismissQueue true option,
      , template:     '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>'
      , timeout:      5000               // [integer|boolean] delay for closing event in milliseconds. Set false for sticky notifications
      , progressBar:  true               // [boolean] - displays a progress bar
      , buttons:      false              // [boolean|array] an array of buttons, for creating confirmation dialogs.
      , animation: {
          open:      {height: 'toggle'}  // or Animate.css class names like: 'animated bounceInLeft'
          , close:   'animated flipOutY' // or Animate.css class names like: 'animated bounceOutLeft'
          , easing:  'swing'
          , speed:   500                 // opening & closing animation speed
        }
      , closeWith:   ['click'] // ['click', 'button', 'hover', 'backdrop']     // backdrop click will close all notifications
      , modal:       false     // [boolean] if true adds an overlay
      , killer:      false     // [boolean] if true closes all notifications and shows itself
      , callback: {
          onShow:         function () {}
          , afterShow:    function () {}
          , onClose:      function () {}
          , afterClose:   function () {}
          , onCloseClick: function () {}
        }
    };
  })();

  // ---------------------------------------------------------------------------
  //  Indicators
  // ---------------------------------------------------------------------------
  (function () {
    $(window).ready(function () {
      function moveAboutSkills() {
        if(window.innerWidth < 992) {
          $('.about-skills').insertAfter('#whatido').css('height', '360px');
        } else {
          $('.about-skills').insertAfter('.biography').css('height', '720px');
        }
      }
      $(window).on('resize', moveAboutSkills);
      moveAboutSkills();
    });

    $(document).ready(function () {
      $('[name="contact-email"]').prop('href', 'mailto:tyler@knoxy.tk').prop('text', 'tyler@knoxy.tk');
      //console.log(`%c✓ %c${atob('Q09OVEFDVFMgU0VU')}`, 'color:green;font-weight:bold;font-size:16px;', 'color:blue;font-weight:bold;');

      if(window.parent.name === 'KnoxyHQ') {
        // scale content to fit inside monitor
        window.parent.Knoxy.scene.monitor1.setMonitorScale();

        // hide scrollbar until nav clicked
        document.children[0].style.overflow = 'hidden';

        // ready to rock & roll
        window.parent.loadedM1 = true;
        console.log('m1 loaded');
      }

    });

    
  }());

});
