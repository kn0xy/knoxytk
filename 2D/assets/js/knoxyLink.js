// Link this monitor up to knoxyEngine if possible
if(window.parent.name === 'KnoxyHQ') {
    const engine = window.parent.Knoxy;
    if(engine) {
        const m1 = engine.scene.monitor1;

        function triggerInfoContent() {
            let infoContent = '<p><strong>God damn I am too fresh</strong></p>';
            engine.ui.overlay.show('BillyWatson', infoContent);
        }


        function showScrollbar(ssb) {

            document.children[0].style.overflow = (ssb===false ? 'hidden' : '');
        }

        function scrollToTop() {
            $('#btnScrollUp').click();
            setTimeout(function() { 
                m1.scrolling = false;
                if(!m1.screenContent.children[0].scrollTop) showScrollbar(false);
            }, 1080);
        }


        // handle mouse down
        let preventDrag = false;
        document.addEventListener('mousedown', function(e) {
            // make non-interactive
            // const mc = window.parent.document.getElementById('monitorContainer');
            // mc.style.pointerEvents = 'none';
            
            setTimeout(() => { if(!engine.mouseDown) engine.mouseDown = true }, 250);
            
            if(e.button === 2) {
                if(e.target.id !== 'knoxy') {
                    e.preventDefault();
                    //console.log(e);
                    engine.scene.monitor1.showContextMenu();
                } 
            } else {
                // left click
                let movingView = false;
                
                if(e.target.id) {
                    // test elems
                    if(e.target.id.substring(0,4) === 'test') {
                        // interact with mon2
                        // let en = e.target.id.substring(5);
                        // if(!en) en = 5;
                        // engine.scene.monitor2.screenContent.updateMonitorNum(en);
                        // if(engine.view !== 'mon2') {
                        //     let dur = (engine.view==='mon1'||engine.view==='tippyDesk' ? 750 : 2000);
                        //     engine.ui.moveCameraTo('mon2', dur);
                            
                        // }

                        setTimeout(() => { 
                            if(engine.mouseDown && !preventDrag) {
                                console.log('mon1 dragging');
                                //window.addEventListener('pointermove', handleMove);
                                //console.log(engine.scene.monitor2.screenContainer.offsetParent);
                            } else {
                                preventDrag = false;
                                //document.removeEventListener('pointermove', handleMove);
                            }
                        }, 275);
                        return;
                    }
                }

                if(engine.view !== 'mon1' && engine.view !== 'mon1zoom') {
                    let dur = 2000;
                    if(engine.view==='mon2' || engine.view==='mon2zoom' || engine.view==='tippyDesk') {
                        dur = 750;
                    }
                    if(!movingView) engine.ui.moveCameraTo('mon1', dur);
                }
            }
        });

        // handle mouse up
        document.addEventListener('mouseup', function(e) {

            if(e.button === 2) {
                preventDrag = true;
            } else {
                if(!engine.mouseDown && !engine.paused) {
                    console.log('mon1 clicked');
                    preventDrag = true;
                    setTimeout(function(){preventDrag=false}, 250);
                } else {
                    engine.mouseDown = false;
                }
                //setTimeout(() => { if(engine.mouseDown) engine.mouseDown = false }, 250);
            }

            setTimeout(() => { if(engine.mouseDown) engine.mouseDown = false }, 250);				
        });

        // prevent right click
        document.addEventListener('contextmenu', event => event.preventDefault());

        // pass scroll events
        let isScrolling = false;
        document.addEventListener('wheel', (event) => {
            if(!engine.tweening) {
                //console.log('wheel', event);
                let cPos = engine.camera.position;
                let mPos = engine.scene.monitor1.model.position;
                let d = cPos.distanceTo(mPos);
                // auto zoom in/out
                if(d > 2.5) {
                    // move camera to view "mon1" on scroll from further than 2.5 units away
                    engine.ui.moveCameraTo('mon1', 1250);
                } else {
                    // we are close
                    const st = document.children[0].scrollTop;
                    if(event.wheelDelta > 0) {
                        // on up scroll
                        if(!st) {
                            // move camera to view "mon1zoom" if document has not been scrolled
                            engine.ui.moveCameraTo('mon1zoom', 500);
                        }
                    } else {
                        // on down scroll
                        if(!st) {
                            // zoom out to "mon1" if document has not been scrolled
                            if(engine.view === 'mon1zoom') {
                                engine.ui.moveCameraTo('mon1', 500);
                            } else if(engine.view === 'mon1') {
                                // forward the wheel event directly to the control room
                                engine.controls.passWheel(event);
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
            if(!engine.scene.monitor2.showingResume) {
                engine.scene.monitor2.screenContent.showResume();
            }
        }
        engine.scene.monitor1.scrolling = false;
    }

    

    
    
}
