window.jQuery(function ($) {
    // ---------------------------------------------------------------------------
    //  Animated scrolling / Scroll Up
    // ---------------------------------------------------------------------------
    (function () {
        $('a[href*="#"]').bind('click', function (e) {
            e.preventDefault();
            var anchor = $(this);
            if(!$(anchor).hasClass('portfolio-link')) {
                var okToAnimate = letKnoxyKnow();
                if (okToAnimate) {
                    $('html, body').stop().animate({
                        scrollTop: $(anchor.attr('href')).offset().top
                    }, 1000);
                }
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
    class portfolioCache {
        constructor() {
            this.cacheData = [];
        }

        // check if item exists in cache
        contains(check) {
            let cd = this.cacheData;
            for(var i=0; i<cd.length; i++) {
                if(cd[i].name === check) {
                    return cd[i];
                }
            }
            return false;
        }

        // add new item to cache
        add(item) {
            this.cacheData.push(item);
        }

        // remove item at {index} from cache
        remove(index) {

        }
    }
    (function () {
        const cache = new portfolioCache();
        window.portCache = cache;
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

        /* Open info popup */
        $('.portfolio-link').click(function(e) {
            var item = $(this).attr('href').substring(1);
            var cached = cache.contains(item);
            if(cached !== false) {
                // load project details from cache
                portfolioOverlay(cached.title, cached.desc, cached.data);
            } else {
                // fetch project details
                $.ajax({
                    type: 'GET',
                    url: 'ajax.php?gpd='+item,
                    dataType: 'json',
                    success: function(result) {
                        if(result.success === true) {
                            const rd = result.data;
                            cache.add(rd);
                            portfolioOverlay(rd.title, rd.desc, rd.data);
                        } else {
                            console.error('Failed to load project details for '+item);
                        }
                    },
                    error: function(err) {
                        console.error('ajax error');
                    }
                });
            }
        });

        $('body').on('click', '.closebtn', function() {
            document.getElementById('overlay').style.display = '';
            document.children[0].style.overflow = '';
        });

        $('.portfolio-bg').on('click', function(e) {
            if(!$(e.target).hasClass('portfolio-link') && 
            !$(e.target).parent().parent().hasClass('links')) {
                // clicked not on a button; default to Learn More
                $(e.currentTarget).find('.portfolio-link').click();
                
            }
        });
    }());

    function lazyLoadPortfolioThumbs() {
        const projectThumbs = [
            'knoxy3d', 'knoxy2d', 'slotmachine', 'bellasite',
            'bwr', 'bellaDih', 'eptl', 'ncsl',
            'eoda', 'ividash', 'ddar', 'intime',
            'tools', 'wow', 'rbbot', 'themundies'
        ];
        const prefix = 'assets/img/portfolio/';
        projectThumbs.forEach((v, i) => {
            // determine source image path
            let imgName = v+'-thumb'+(v==='wow' ? '.jpg' : '.png');
            let wpName = v+'-thumb.webp';
            let imgPath = prefix + imgName;
            let wpPath = prefix + wpName;

            // create picture element
            let pic = document.createElement('picture');

            // add webp source to picture
            let srcWebp = document.createElement('source');
            srcWebp.type = 'image/webp';
            srcWebp.srcset = wpPath;
            pic.appendChild(srcWebp);

            // add png/jpg source to picture
            let srcPng = document.createElement('source');
            srcPng.type = (v==='wow' ? 'image/jpeg' : 'image/png');
            srcPng.srcset = imgPath;
            pic.appendChild(srcPng);

            // add image tag to picture
            let srcImg = document.createElement('img');
            srcImg.src = imgPath;
            pic.appendChild(srcImg);

            // add picture to portfolio-item inner content
            const elems = document.getElementsByClassName('portfolio-item');
            const elem = elems[i];
            const inner = elem.getElementsByClassName('portfolio')[0];
            const ip = inner.getElementsByClassName('links')[0];
            ip.after(pic);
        });
    }

    function portfolioOverlay(title, desc, content) {
        // empty overlay
        const overlay = document.getElementById('overlay');
        overlay.innerHTML = '';

        // add project title
        const h1 = document.createElement('h1');
        h1.innerHTML = title;
        overlay.appendChild(h1);

        // add project description
        const p = document.createElement('p');
        p.innerHTML = desc;
        overlay.appendChild(p);

        // add project content
        const wrap = document.createElement('div');
        wrap.classList.add('overlay-content');
        wrap.innerHTML = content;
        overlay.appendChild(wrap);

        // add close button
        overlay.innerHTML += '<a href="javascript:void(0)" class="closebtn">&times;</a>';
        
        // show overlay
        overlay.style.display = 'block';
        document.children[0].style.overflow = 'hidden';
    }

    

    

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
            lazyLoadPortfolioThumbs();
            shuffleInstance._onResize();
            
        });
    
        $(document).ready(function () {
          // show contact email
          $('[name="contact-email"]').prop('href', 'mailto:tyler@knoxy.tk').prop('text', 'tyler@knoxy.tk');
        });
        
      }());

});

// ---------------------------------------------------------------------------

// Overlay - Slider
let slideIndex = 1;
function moveSlides(fb) {
    if(fb < 0) {
        slideIndex--;
    } else {
        slideIndex++;
    }
    showSlide(slideIndex);
}
function showSlide(n) {
    slideIndex = n;
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
  }
