window.jQuery(function ($) {
    // ---------------------------------------------------------------------------
    //  Animated scrolling / Scroll Up
    // ---------------------------------------------------------------------------
    (function () {
        $('a[href*="#"]').bind('click', function (e) {
            e.preventDefault();
            var anchor = $(this);
            var okToAnimate = letKnoxyKnow();
            if (okToAnimate) {
                $('html, body').stop().animate({
                    scrollTop: $(anchor.attr('href')).offset().top
                }, 1000);
            }
        });

        function letKnoxyKnow() {
            if (window.parent.Knoxy) {
                const m1 = window.parent.Knoxy.scene.monitor1;
                if (m1.scrolling) {
                    return false;
                } else {
                    m1.scrolling = true;
                    setTimeout(function () { m1.scrolling = false }, 1080);
                }
            }
            return true;
        }
    }());

    // ---------------------------------------------------------------------------
    //  Home Page Navigation
    // ---------------------------------------------------------------------------
    (function () {
        $('.element').bind('pointerdown', function (e) {
            var me = $(this)[0];
            var a = $(me).children('a')[0];
            a.click();
        });
    }());



    // ---------------------------------------------------------------------------
    //  Sticky Menu
    // ---------------------------------------------------------------------------
    (function () {

        $('.header').sticky({
            topSpacing: 0
        });

        $('body').scrollspy({
            target: '#navbar-custom'
            , offset: 70
        });

    }());

    // ---------------------------------------------------------------------------
    //  Back To Top
    // ---------------------------------------------------------------------------
    (function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('.scroll-up').fadeIn();
            } else {
                $('.scroll-up').fadeOut();
            }
        });
    }());

    // ---------------------------------------------------------------------------
    //  Countup
    // ---------------------------------------------------------------------------
    $('.count-wrap').bind('inview', function (event, visible, visiblePartX, visiblePartY) {
        $(this).find('.timer').each(function () {
            var $this = $(this);
            if (visible) {
                $({ Counter: 0 }).animate({ Counter: $this.data('original-text') }, {
                    duration: 2000
                    , easing: 'swing'
                    , step: function () {
                        $this.text(Math.ceil(this.Counter));
                    }
                });
            } else {
                $({ Counter: 0 });
                $this.text(Math.ceil($this.data('original-text')));
            }
        });
    });

    // ---------------------------------------------------------------------------
    //  Progress Bar
    // ---------------------------------------------------------------------------
    $('.skill-progress').bind('inview', function (event, visible, visiblePartX, visiblePartY) {
        if (visible) {
            $.each($('div.progress-bar'), function () {
                $(this)
                    .css('width', null)
                    .css('width', $(this).attr('aria-valuenow') + '%');
            });
        }
    });

    // ---------------------------------------------------------------------------
    //  More skill
    // ---------------------------------------------------------------------------
    $('.more-skill').bind('inview', function (event, visible, visiblePartX, visiblePartY) {
        if (visible) {
            // configuration goes here
            $('.chart').easyPieChart({
                easing: 'easeOut'
                , barColor: '#68c3a3'
                , delay: 1500
                , lineWidth: 8
                , rotate: 0
                , scaleColor: false
                , size: 140
                , trackColor: '#3a4149'
                , animate: {
                    duration: 2500
                    , enabled: true
                }
                , onStep: function (from, to, percent) {
                    this.el.children[0].innerHTML = Math.round(percent, 1);
                }
            });
        }
    });

    // ---------------------------------------------------------------------------
    //  Portfolio
    // ---------------------------------------------------------------------------
    (function () {
        var $grid = $('#og-grid');
        var shuffleInstance = new window.Shuffle($grid, {
            itemSelector: '.portfolio-item'
        });
        window.shuffleInstance = shuffleInstance;

        /* Reshuffle when user clicks a filter item */
        $('#filter a').click(function (e) {
            e.preventDefault();

            // set active class
            $('#filter a').removeClass('active');
            $(this).addClass('active');

            // Get group name from clicked item
            var groupName = $(this).attr('data-group');

            // Reshuffle grid
            shuffleInstance.filter(groupName);
        });
    }());

    // ---------------------------------------------------------------------------
    //  Magnific Popup
    // ---------------------------------------------------------------------------
    (function () {
        $('.image-link').magnificPopup({
            gallery: {
                enabled: true
            }
            , removalDelay: 300             // Delay in milliseconds before popup is removed
            , mainClass: 'mfp-with-zoom' // this class is for CSS animation below
            , type: 'image'
        });
    }());

    // ---------------------------------------------------------------------------
    //  WOW JS
    // ---------------------------------------------------------------------------
    (function () {

        new window.WOW({
            boxClass: 'wow'       //  animated element css class (default is wow)
            , animateClass: 'animate__animated'  //  animation css class (default is animated)
            , offset: 0           //  distance to the element when triggering the animation (default is 0)
            , mobile: true        //  trigger animations on mobile devices (default is true)
            , live: true        //  act on asynchronously loaded content (default is true)
            , scrollContainer: null        //  optional scroll container selector, otherwise use window,
            , resetAnimation: false       //  reset animation on end (default is true)
            , callback: function (box) {
                //  the callback is fired every time an animation is started
                //  the argument that is passed in is the DOM node being animated
                // console.log(`[WOW] animating box [${box.tagName.toLowerCase()}]: [${box.className}]`, box);
            }
        }).init();

    }());
    

    // ---------------------------------------------------------------------------
    //  Contact Form
    // ---------------------------------------------------------------------------
    function formSubmit(action, data, tip) {
        if(!window.gotToken) {
            // wait for the token
            setTimeout(function() {
                formSubmit(action, data, tip);
            }, 100);
        } else {
            // append the token to post data
            data += '&rct='+window.gotToken;

            // submit the form
            $.post(action, data, function (data) {
                if ('error' === data.response) {
                    tip.after('<div class="alert alert-danger">' + data.message + '</div>');
                }
                if ('success' === data.response) {
                    tip.after('<div id="msgSuccess" class="alert alert-success">' + data.message + '</div>');
                    setTimeout(function() {
                        $('#msgSuccess').fadeOut(function(){
                            $(this).remove();
                        })
                    }, 8000);
                    tip.find('input, textarea').val('').removeAttr('disabled');
                    tip.find('button').removeAttr('disabled');
                }
                $('#msgSending').remove();
            }, 'json');
        }
    }
    $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        grecaptcha.execute();
        var $action = $(this).prop('action');
        var $data = $(this).serialize();
        var $this = $(this);
        $this.find('input, textarea, button').prop('disabled', true);
        $this.nextAll('.alert').remove();
        $this.append('<span id="msgSending">Sending message...</span>');
        formSubmit($action, $data, $this);
    });



    // ---------------------------------------------------------------------------
    //  Window & Document onReady/onLoad
    // ---------------------------------------------------------------------------
    (function () {
        $(window).ready(function () {
          function moveAboutSkills() {
            if(window.innerWidth < 992) {
              $('.about-skills').insertAfter('#askills').css('height', '360px');
            } else {
              $('.about-skills').insertAfter('.biography').css('height', '720px');
            }
          }
          $(window).on('resize', moveAboutSkills);
          moveAboutSkills();
        });

        $(window).on('load', function() {
            // init portfolio items
            shuffleInstance._onResize();
        });
    
        $(document).ready(function () {
          // show contact email
          $('[name="contact-email"]').prop('href', 'mailto:tyler@knoxy.tk').prop('text', 'tyler@knoxy.tk');
        });
        
      }());

});

// ---------------------------------------------------------------------------
