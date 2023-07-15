import * as THREE from './three.module.js';

class LightSwitch {
    constructor( engine, callback ) {

        const pub = this;
        const scene = engine.scene;

        // initialize switch state
        this.state = 'OFF';

        // initialize light property
        this.light = null;
        this.setLight = function(newLight) {
            this.light = newLight;
        }

        // initialize intersectable meshes
        function initIntersectables(model) {
            for(let i=0; i<model.children.length; i++) {
                let tc = model.children[i];
                tc.knoxyParent = pub;
                engine.intersectables.push(tc);
            }
        }

        // initialize animations
        const clock = new THREE.Clock();
        clock.autoStart = false;
        const anims = [];
        let amixer;
        function initAnimations(model) {
            amixer = new THREE.AnimationMixer(model);
            const clip = model.animations[0];
            const anim = amixer.clipAction(clip);
            anim.loop = THREE.LoopOnce;
            anim.clampWhenFinished = true;
            anims[0] = anim;
            pub.anims = anims;
            pub.amixer = amixer;
            amixer.addEventListener( 'finished', function( e	) { 
                let ai = engine.animating.indexOf('lightswitch');
                engine.animating.splice(ai, 1);
            });
        }

        // toggle anims
        let isUp = false;
        let isMoving = false;
        this.toggle = function() {
            const anim = anims[0];
            if(!isMoving) {
                // update state
                isUp = (isUp ? false : true);
                this.state = (isUp ? 'ON' : 'OFF');

                // update light
                let lc = (isUp ? 0xFFFFFF : 0x000000);
                this.light.color.setHex(lc);
                
                // animate switch
                clock.start();
                anim.timeScale = (isUp ? 1 : -1);
                anim.play();
                anim.paused = false;
                isMoving = true;
                setTimeout(function() {
                    isMoving = false;
                }, 210);
                engine.animating.push('lightswitch');
                engine.callAnimate(true);
            }
        }

        // load model into scene
        engine.loader.load('models/lightswitch.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.knoxyParent = pub;
            pub.model = model;
            model.animations = gltf.animations;
            initAnimations(model);
            initIntersectables(model);
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
            console.log(model);
        });

        // attach to south wall
        this.attachToWall = function() {
            const wall = scene.getObjectByName('Wall_S');
            if(wall) {
                try {
                    wall.attach(this.model);
                } catch {
                    setTimeout(this.attachToWall, 250);
                }
                
            } else {
                setTimeout(this.attachToWall, 250);
            }
        }

        // handle mouse events
        this.mousedOver = false;
        this.onMouseover = function(obj) {
            document.body.style.cursor = 'pointer';
            // this.knoxyLabel.style.display = '';
            this.mousedOver = true;
            engine.callAnimate();
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            //this.knoxyLabel.style.display = 'none';
            this.mousedOver = false;
            engine.callAnimate();
        };

        this.onClick = function(obj) {
            this.toggle();
        }

        this.onRightClick = function(obj) {
            // add 5ms delay to prevent browser contextmenu event blocking
            setTimeout(function() {
                // show context menu
                showContextMenu();
            }, 5);
        }

        // update animations
        this.updateAnimations = function() {
            const delta = clock.getDelta();
            amixer.update(delta);

            // // show label on mouseover
            // if(this.mousedOver && !engine.mouseDown) {
            //     const tv = new THREE.Vector3();
            //     const km = this.model;
            //     km.updateWorldMatrix();
            //     km.getWorldPosition(tv);
            //     tv.project(engine.camera);
            //     const x = (tv.x *  .5 + .5) * engine.canvas.clientWidth;
            //     const y = (tv.y * -.5 + .5) * engine.canvas.clientHeight;
            //     this.knoxyLabel.style.display = '';
            //     this.knoxyLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;     
            // } else {
            //     this.knoxyLabel.style.display = 'none';
            // }
        }
        
        // show context menu
        function showContextMenu() {
            let menuItems = [
                {
                    content: 'Slide '+(pub.state==='IN' ? 'Out' : 'In'),
                    click: function() {
                        let ss = (pub.state==='IN' ? true : false);
                        //pub.toggleSlide();
                        pub.onClick();
                        engine.callAnimate();
                        engine.ui.contextMenu.close();
                    }
                },
                {
                    content: 'Show Info',
                    click: function() {
                        showInfoWindow();
                        engine.ui.contextMenu.close()
                    }
                },
                {
                    content: '<span id="contextClose">Close</span>',
                    click: function() {engine.ui.contextMenu.close()}
                },
            ];
            engine.ui.contextMenu.show('Lamp', menuItems, false);
        }
    }
}
export { LightSwitch }