import * as THREE from './three.module.js';
import { TWEEN } from './tween.module.min.js';

class KnoxyUI {
    constructor( engine, callback ) {

        this.hideLabels = function(tf) {
            const lw = document.getElementById('labels');
            if(tf) {
                lw.style.display = 'none';
            } else {
                lw.style.display = '';
            }
        }

        const pub = this;

        // Overlay
        const overlayWrap = document.getElementById('overlay');
        const overlayContent = document.getElementById('overlayContent');
        const overlayClose = document.getElementById('overlayClose');
        const overlayCloseBtn = '<p id="overlayFooter"><button type="button" id="overlayCloseBtn">Close</button></p>';
        this.overlay = {
            close: function() {
                overlayWrap.style.display = '';
                engine.paused = false;
            },
            show: function(title, content) {
                overlayContent.innerHTML = '<h1>'+title+'</h1>'+content + overlayCloseBtn;
                document.getElementById('overlayCloseBtn').addEventListener('click', this.close);
                overlayWrap.style.display = 'block';
                overlayWrap.scrollTop = 0;
                document.body.style.cursor = 'default';
                engine.paused = true;
            },
            clickHandlers: [],
            addClickHandler: function(id, func) {
                const h = {id:id, func:func};
                if(!this.clickHandlers.includes(h)) {
                    this.clickHandlers.push(h);
                    //console.log('Handler added');
                } else {
                    console.log('Handler already exists. Not added');
                }
            },
            content: overlayContent,
            wrapper: overlayWrap
        }
        overlayClose.addEventListener('click', this.overlay.close);
        overlayContent.addEventListener('click', function(e) {
            //console.log('overlaycontent clicked: ', e.target);
            const tid = e.target.id;
            //const elem = document.getElementById(tid);
            const handlers = pub.overlay.clickHandlers;
            for(let i=0; i<handlers.length; i++) {
                let hid = handlers[i].id;
                if(hid === tid) {
                    handlers[i].func(e);
                }
            }
        });


        // Context Menu
        const contextWrap = document.getElementById('contextMenu');
        const contextContent = document.getElementById('contextContent');
        const contextClose = document.getElementById('contextClose');
        this.contextMenu = {
            close: function() {
                if(this.init) {
                    this.init = false;
                    return;
                }
                contextWrap.style.display = '';
                this.hidden = true;
                this.owner = false;
                pub.hideLabels(false);
                engine.controls.enabled = true;
                engine.updateMouseover(true);
            },
            hidden: true,
            init: false,
            owner: false,
            show: function(newOwner, menuItems, click) {
                // build menu
                contextContent.innerHTML = '';
                contextWrap.style.display = 'block';
                for(let i=0; i<menuItems.length; i++) {
                    let li = document.createElement('li');
                    li.innerHTML = menuItems[i].content;
                    li.addEventListener('click', menuItems[i].click);
                    contextContent.appendChild(li);
                }
                // position menu
                let cx = engine.pointer.ax;
                let cy = engine.pointer.ay;
                let ww = window.innerWidth;
                let wh = window.innerHeight;
                let mw = contextWrap.offsetWidth;
                let mh = contextWrap.offsetHeight;
                if((ww - cx) < mw) cx = ww - mw; // prevent horizontal overflow
                if((wh - cy) < mh) cy = wh - mh; // prevent vertical overflow
                contextWrap.style.top = cy+'px';
                contextWrap.style.left = cx+'px';
                // display menu
                this.ogCursor = document.body.style.cursor;
                document.body.style.cursor = 'default';
                if(click) this.init = true;
                this.hidden = false;
                this.owner = newOwner;
                engine.controls.enabled = false;
                pub.hideLabels(true);
            },
            ogCursor: 'default',
            content: contextContent,
            wrapper: contextWrap
        }


        // Camera Movement Helpers
        this.cmh = [];
        this.getCmhCoordsFor = function(destKey) {
            const tmh = this.cmh;
            for(let i=0; i<tmh.length; i++) {
                if(tmh[i].key === destKey) {
                    return tmh[i];
                }
            }
            return false;
        }
        this.moveCamera = function(camDest, tarDest, duration, oscb, occb) {
            // update camera position
            const camPos = engine.camera.position;
            const setCam = new TWEEN.Tween(camPos)
                .to(camDest, duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onStart(() => {
                    //console.log('tween started');
                    engine.tweening = true;
                    engine.controls.enabled = false;
                    engine.paused = true;
                    if(oscb && typeof(oscb) === 'function') oscb();
                })
                .onComplete(() => {
                    //console.log('tween completed');
                    engine.controls.enabled = true;
                    engine.tweening = false;
                    engine.paused = false;
                    TWEEN.removeAll();
                    if(occb && typeof(occb) === 'function') occb();
                });
            setCam.start();
            
            // update focal target
            const tarPos = engine.controls.target;
            const setTar = new TWEEN.Tween(tarPos)
                .to(tarDest, duration)
                .easing(TWEEN.Easing.Cubic.InOut)
            setTar.start();
        
            // render animation
            engine.tweening = true;
            engine.callAnimate(true);
        }

        this.moveCameraTo = function(destKey, duration, oscb, occb) {
            let cam = new THREE.Vector3(0,0,0);
            let tar = new THREE.Vector3(0,0,0);
            let dur = duration || 2000;
            // os = function() { console.log('movecamera starthook') }
            // oc = function() { console.log('movecamera completehook') }

            if(!destKey) {
                return false;
            } else {
                let keyValid = this.getCmhCoordsFor(destKey);
                if(keyValid) {
                    // set camera position & focal target
                    cam = keyValid.cam;
                    tar = keyValid.tar;

                    if(keyValid.hasOwnProperty('os')) {
                        if(oscb) {
                            let ogcb = oscb;
                            let osWrapper = function() {
                                let kvos = keyValid.os;
                                if(typeof(kvos)==='function') kvos();
                                if(typeof(ogcb)==='function') ogcb();
                            }
                            oscb = osWrapper;
                        }
                    } 
                    
                    // move camera if key is different from current view
                    if(destKey !== engine.view) {
                        let oc = function() { 
                            engine.view = destKey;
                            engine.ui.camView = destKey;
                            if(occb && typeof(occb) === 'function') occb();
                        };
                        this.moveCamera(cam, tar, dur, oscb, oc);
                    }
                }
            }
            return true;
        }
        this.camView = false;
    }
}
export { KnoxyUI }