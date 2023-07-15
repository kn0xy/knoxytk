// init map image
document.getElementById('mapImg').src = 'https://maps.googleapis.com/maps/api/staticmap?center=Indianapolis,IN&zoom=10&size=555x392&map_id=a254fb2ff9e5cfdd&key=AIzaSyBBQN-Rwafg9wKZN-XVBzJOlpZ8qiadP5s&signature=WdrDF9elT5DeMjhVrbWmn_mNysM=';
// https://maps.googleapis.com/maps/api/staticmap?center=Indianapolis,IN&zoom=10&size=555x392&map_id=a254fb2ff9e5cfdd&key=AIzaSyBBQN-Rwafg9wKZN-XVBzJOlpZ8qiadP5s

// Link this monitor up to knoxyEngine if possible
let isKnoxy = false;
if(window.parent.name === 'KnoxyHQ') {
    const engine = window.parent.Knoxy;
    isKnoxy = true;
    if(engine) {
        const m1 = engine.scene.monitor1;

        // Show/hide the vertical scrollbar
        function showScrollbar(ssb) {
            document.children[0].style.overflow = (ssb===false ? 'hidden' : '');
        }

        // Auto scroll to the top
        function scrollToTop() {
            $('#btnScrollUp').click();
            setTimeout(function() { 
                m1.scrolling = false;
                if(!m1.screenContent.children[0].scrollTop) showScrollbar(false);
            }, 1080);
        }

        // handle mouse move
        document.addEventListener('mousemove', onPointerMove);
        function onPointerMove(event) {
            let m = engine.ui.bubblePointer(event);
            if(!engine.mouseDown) dragging = false;
            if(dragging) {
                let itBe = { clientX: m.x, clientY: m.y };
                engine.controls.passMove(itBe);
            }
        }

        // handle mouse down
        let preventMove = false;
        let preventDrag = false;
        let dragging = false;
        document.addEventListener('mousedown', function(e) {
            
            setTimeout(() => { if(!engine.mouseDown) engine.mouseDown = true }, 250);
            
            if(e.button === 2) {
                if(e.target.id !== 'knoxy') {
                    e.preventDefault();
                    engine.scene.monitor1.showContextMenu();
                } 
            } else {
                // left click
                // Prevent camera move on resumeLink click
                try {
                    if(e.target.parentElement.id === 'resumeLink') {
                        preventMove = true;
                        return;
                    }
                } catch {}

                // Prevent camera move on portfolioLink click
                try {
                    let plc = e.target.parentElement.classList;
                    if(plc.contains('portfolio-link') || 
                       plc.contains('portfolio-info') ||
                       plc.contains('portfolio')) {
                        preventMove = true;
                        return;
                    }
                } catch {}

                setTimeout(() => { 
                    if(engine.mouseDown && !preventDrag) {
                        dragging = true;
                        let m = engine.ui.bubblePointer(e);
                        let pe = { clientX: m.x, clientY: m.y };
                        engine.controls.passDrag(pe);
                        engine.animating.push('controls');
                        engine.callAnimate(true);
                    } else {
                        preventDrag = false;
                    }
                }, 275);
            }
        });

        // handle mouse up
        document.addEventListener('mouseup', function(e) {
            if(dragging) {
                let ci = engine.animating.lastIndexOf('controls');
                engine.animating.splice(ci, 1);
            }
            dragging = false;
            if(e.button === 2) {
                preventDrag = true;
            } else {
                if(!engine.mouseDown && !engine.paused) {
                    //console.log('mon1 clicked');
                    preventDrag = true;
                    setTimeout(function(){preventDrag=false}, 250);

                    // Toggle camera
                    if(!preventMove) {
                        if(engine.view !== 'mon1zoom') {
                            engine.ui.zoomTo(engine.view === 'mon2zoom' ? 'mon1zoom' : 'mon1')
                        }
                    } else {
                        preventMove = false;
                    }
                } else {
                    engine.mouseDown = false;
                }
            }
            setTimeout(() => { if(engine.mouseDown) engine.mouseDown = false }, 250);				
        });

        // handle double click
        document.addEventListener('dblclick', (event) => {
            if(engine.view !== 'mon1zoom') {
                engine.ui.zoomTo('mon1zoom');
            } else {
                engine.ui.zoomTo('mon1');
            }
        });

        // prevent right click
        document.addEventListener('contextmenu', event => event.preventDefault());

        // pass scroll events
        let isScrolling = false;
        document.addEventListener('wheel', (event) => {
            if(!engine.tweening) {
                // auto zoom in/out
                let d = engine.ui.distanceTo('mon1');
                if(d > 2.5) {
                    // move camera to view "mon1" on scroll from further than 2.5 units away
                    engine.ui.zoomTo('mon1');
                } else {
                    // we are close
                    const st = document.children[0].scrollTop;
                    if(event.wheelDelta > 0) {
                        // on up scroll
                        if(!st) {
                            // move camera to view "mon1zoom" if document has not been scrolled
                            engine.ui.zoomTo('mon1zoom', ()=>{engine.ui.panel.fadeOut()});
                        }
                    } else {
                        // on down scroll
                        if(!st) {
                            // zoom out to "mon1" if document has not been scrolled
                            if(engine.view === 'mon1zoom') {
                                engine.ui.zoomTo('mon1');
                            } else if(engine.view === 'mon1') {
                                // forward the wheel event directly to the control room
                                engine.controls.passWheel(event);
                            } else if(engine.view === 'mon2') {
                                engine.ui.zoomTo('tippyDesk');
                            }
                        } else {
                            // document has been scrolled
                            if(engine.view !== 'mon1' && engine.view !== 'mon1zoom') {
                                // move camera to monitor 1
                                engine.ui.zoomTo('mon1');
                            }
                        }
                    }
                }
            }
        });

        // automatic show/hide of document scrollbar
        document.onscroll = (event) => {
            const k = document.children[0];
            if(k.scrollTop < 900) {
                if(!m1.scrolling) {
                    scrollToTop();
                }
                
            } else {
                showScrollbar();
            }
        }
        engine.scene.monitor1.scrolling = false;

        // Handle Portfolio Item "Learn More" button click
        function portfolioLearnMore(pName, content, knoxy) {
            knoxy.scene.monitor2.screenContent.showPortfolioDetails(pName, content);
        }

        // handle document ready
        function ready(fn) {
            if (document.readyState !== 'loading') {
              fn();
            } else {
              document.addEventListener('DOMContentLoaded', fn);
            }
        }
        ready(function() {
            // scale content to fit inside monitor
            engine.scene.monitor1.setMonitorScale();

            // hide scrollbar until nav clicked
            document.children[0].style.overflow = 'hidden';

            // resumeLink open on 2nd monitor
            document.querySelector('#resumeLink').addEventListener('click', (e) => {
                e.preventDefault();
                engine.scene.monitor2.screenContent.showResume();
                engine.ui.zoomTo(engine.view === 'mon1zoom' ? 'mon2zoom' : 'mon2');
            });

            // ready to rock & roll
            window.parent.loadedM1 = true;
            console.log('m1 loaded');
        });
    } else {
        isKnoxy = false;
    }
}
if(!isKnoxy) {
    // resumeLink open in new tab
    document.querySelector('#resumeLink').target = '_blank';

    // hide open new tab button for Knoxy2D portfolio item
    document.getElementById('aKnoxy2d').style.display = 'none';

    // show open new tab button for Knoxy3D portfolio item
    document.getElementById('aKnoxy3d').style.display = 'inline';
}