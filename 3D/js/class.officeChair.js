import * as THREE from './three.module.js';

class OfficeChair {
    constructor( engine, callback ) {

        // initialize scene & global scope
        const scene = engine.scene;
        const pub = this;

        // initialize slide state
        this.state = 'IN';
        this.updateState = function() {
            this.state = (this.state === 'IN' ? 'OUT' : 'IN');
        }

        // initialize label/tooltip
        const label = document.createElement('div');
        label.addEventListener('click', showContextMenu);
        label.textContent = 'Chair';
        label.style.display = 'none';
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;
        
        // show info window
        function showInfoWindow() {
            let infoContent = '<p>Basic office chair</p>';
            engine.ui.overlay.show('OfficeChair', infoContent);
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
        
        
        // initialize intersectable meshes
        function initIntersectables(model) {
            for(let c=0; c<model.children.length; c++) {
                const gkids = model.children[c].children;
                for(var g=0; g<gkids.length; g++) {
                    if(gkids[g].hasOwnProperty('isGroup')) {
                        const gkm = gkids[g].children;
                        for(var m=0; m<gkm.length; m++) {
                            let tc = gkm[m];
                            tc.knoxyParent = pub;
                            engine.intersectables.push(tc);
                        }
                    } else {
                        let tc = gkids[g];
                        tc.knoxyParent = pub;
                        engine.intersectables.push(tc);
                    }
                }
            }
        }

        // initialize animations
        const clock = new THREE.Clock();
        clock.autoStart = false;
        const anims = [];
        let amixer;
        function initAnimations(model) {
            amixer = new THREE.AnimationMixer(model);
            for(var i=0; i<model.animations.length; i++) {
                const clip = model.animations[i];
                const anim = amixer.clipAction(clip);
                anim.loop = THREE.LoopOnce;
                anims[i] = anim;
            }
            
            pub.anims = anims;
            pub.amixer = amixer;
        }

        // reposition the root animation track to this model's current position
        this.fixAnims = function() {
            const cx = this.model.position.x;
            const cy = this.model.position.y;
            const cz = this.model.position.z;
            const vtrack = this.anims[0]._clip.tracks[0].values;
            let v = 0;
            for(var vv=0; vv<vtrack.length; vv++) {
                if(v === 0) {
                    vtrack[vv] += cx;
                    v++;
                } else if(v === 1) {
                    vtrack[vv] += cy;
                    v++;
                } else if(v === 2) {
                    vtrack[vv] += cz;
                    v = 0;
                }
            }
        }

        // toggle chair slide in/out animation
        let isOut = false;
        let isMoving = false;
        function toggleSlide() {
            if(!isMoving) {
                clock.start();
                for(var i=0; i<anims.length; i++) {
                    const anim = anims[i];
                    const clip = anim._clip;
                    if(!isOut || clip.duration < 2) {
                        anim.stop().play();
                    } else {
                        anim.play();
                    }
                    anim.paused = false;
                    engine.animating.push(i);
                    isMoving = true;
                    setTimeout(function() {
                        anim.paused = true;
                        engine.animating.shift();
                        isMoving = false;
                        if(isOut) {
                            isOut = false;
                        } else {
                            isOut = true;
                        }
                        pub.updateState();
                    }, 1275);
                }
                engine.callAnimate(true);
            }
        }
        this.toggleSlide = toggleSlide;

        // load model into scene
        engine.loader.load('models/officeChair-anim2.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.scale.set(1.8, 1.8, 1.8);
            model.knoxyParent = pub;
            pub.model = model;
            model.animations = gltf.animations;
            initAnimations(model);
            //initMats(model);
            initIntersectables(model);
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
            //engine.callAnimate();
        });

        // handle mouse events
        this.mousedOver = false;
        this.onMouseover = function(obj) {
            document.body.style.cursor = 'pointer';
            this.knoxyLabel.style.display = '';
            this.mousedOver = true;
            engine.callAnimate();
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.knoxyLabel.style.display = 'none';
            this.mousedOver = false;
            engine.callAnimate();
        };

        this.onClick = function(obj) {
            this.toggleSlide();
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

            // show label on mouseover
            if(this.mousedOver && !engine.mouseDown) {
                const tv = new THREE.Vector3();
                const km = this.model;
                km.updateWorldMatrix(true, true);
                km.getWorldPosition(tv);
                tv.project(engine.camera);
                const x = (tv.x *  .5 + .5) * engine.canvas.clientWidth;
                const y = (tv.y * -.5 + .5) * engine.canvas.clientHeight;
                this.knoxyLabel.style.display = '';
                this.knoxyLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;     
            } else {
                this.knoxyLabel.style.display = 'none';
            }
        }
    }
}
export { OfficeChair }