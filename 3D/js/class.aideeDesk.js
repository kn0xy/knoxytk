import * as THREE from './three.module.js';


const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class AideeDesk extends THREE.EventDispatcher {
    constructor( engine, callback ) {

		super();

        const scene = engine.scene;
        const pub = this;

        
        // Drawer animations
        const drawerAnim = [null, null, null, null, null, null];
        const drawerActive = [false, false, false, false, false, false];
        const drawerOpen = [false, false, false, false, false, false];
        const clock = new THREE.Clock();
        clock.autoStart = false;
        let amixer;
        this.toggleDrawer = function(drawer) {
            const num = drawer - 1;
            const obj = this.drawers[num];
            let anim = drawerAnim[num];
            let active = drawerActive[num];
            let open = drawerOpen[num];
            if(!active) {
                // start the animation
                clock.start();
                if(!open) {
                    anim.stop();
                    anim.timeScale = 1;
                } else {
                    anim.timeScale = -1;
                }
                anim.play();
                drawerActive[num] = true;
                if(anim.paused) anim.paused = false;
                let desc = 'ad-'+num;
                engine.animating.push(desc);

                // capture containable contents as children
                const containables = scene.getObjectsByProperty('containable', true);
                const box = new THREE.Box3();
                box.setFromObject(obj);
                for(let i=0; i<containables.length; i++) {
                    const vec = new THREE.Vector3();
                    containables[i].getWorldPosition(vec);
                    const contained = box.containsPoint(vec);
                    if(contained && !obj.getObjectById(containables[i].id)) {
                        obj.attach(containables[i]);
                        console.log('[AideeDesk] [Drawer '+drawer+']    attached object ('+containables[i].id+')');
                    }
                }

                // update drawer status after animation complete (1.25s)
                setTimeout(function() {
                    if(!open) {
                        drawerOpen[num] = true;
                    } else {
                        drawerOpen[num] = false;
                    }
                    drawerActive[num] = false;
                }, 1250);
            }
        }

        this.toggleAllDrawers = function() {
            for(let d=0; d<6; d++) {
                this.toggleDrawer(d+1);
            }
        }
        
        
        

        
        // initialize textures for highlighting on mouseover
        let ogBlackMat;
        let ogLeatherMat;
        let ogChromeMat;
        let blackMat;
        let leatherMat;
        let chromeMat;

        function initHighlightTextures(model) {
            // set up textures for highlighting on mouseover
            const d1 = model.children[0];
            for(let c=0; c<d1.children.length; c++) {
                if(ogBlackMat && ogLeatherMat && ogChromeMat) break;
                const thisMat = d1.children[c].material;
                if(!ogBlackMat) {
                    if(thisMat.name === 'Black') ogBlackMat = thisMat;
                }
                if(!ogLeatherMat) {
                    if(thisMat.name === 'Leather') ogLeatherMat = thisMat;
                }
                if(!ogChromeMat) {
                    if(thisMat.name === 'Chrome') ogChromeMat = thisMat;
                }
            }
            blackMat = ogBlackMat.clone();
            leatherMat = ogLeatherMat.clone();
            chromeMat = ogChromeMat.clone();
            blackMat.emissive.setHex(0xffffff);
            leatherMat.emissive.setHex(0xffffff);
            chromeMat.emissive.setHex(0xffffff);
            blackMat.emissiveIntensity = 0.004;
            leatherMat.emissiveIntensity = 0.008;
            chromeMat.emissiveIntensity = 0.1;
        }

        this.setChairTextures = function(chairModel) {
            const seat = chairModel.getObjectByName('Seat');
            const rivets = chairModel.getObjectByName('Rivets');
            const legs = chairModel.getObjectByName('Legs');
            seat.material = ogBlackMat;
            rivets.material = ogChromeMat;
            seat.receiveShadow = true;
            legs.receiveShadow = true;
        }


        // drawer positions
        const drawerSlotOffsets = [
            { x: -0.3, z: -0.3 },       // 1
            { x: -0.025, z: -0.3 },     // 2
            { x: 0.23, z: -0.3 },       // 3
            { x: -0.3, z: 0 },          // 4
            { x: -0.025, z: 0 },        // 5
            { x: 0.23, z: 0 },          // 6
            { x: -0.3, z: 0.3 },        // 7
            { x: -0.025, z: 0.3 },      // 8
            { x: 0.23, z: 0.3 }         // 9
        ];

        function initDrawers(model) {
            let drawer1 = model.children[0];
            let drawer2 = model.children[1];
            let drawer3 = model.children[2];
            let drawer4 = model.children[3];
            let drawer5 = model.children[4];
            let drawer6 = model.children[5];
            const drawers = [drawer1, drawer2, drawer3, drawer4, drawer5, drawer6];
            const frame = model.getObjectByName('Frame');
            frame.castShadow = true;
            frame.receiveShadow = true;
            frame.knoxyParent = pub;
            engine.intersectables = engine.intersectables.concat(frame);

            for(let d=0; d<drawers.length; d++) {
                // init children
                let meshes = drawers[d].children;
                for(let m=0; m<meshes.length; m++) {
                    drawers[d].children[m].knoxyParent = pub;
                }

                // init label
                const label = createDrawerLabel(d);
                drawers[d].knoxyLabel = label;

                // init container
                drawers[d].addContainable = function(containable, slot) {
                    const tv = new THREE.Vector3();
                    this.updateWorldMatrix();
                    this.getWorldPosition(tv);
                    slot -= 1;
                    let x = tv.x + drawerSlotOffsets[slot].x;
                    let y = tv.y - 0.12944;
                    let z = tv.z + drawerSlotOffsets[slot].z;
                    containable.position.set(x, y, z);
                    containable.visible = true;
                    scene.add(containable);
                    engine.callAnimate();
                }

                // register intersectables with knoxyEngine
                engine.intersectables = engine.intersectables.concat(drawers[d].children);
            }

            // update references
            pub.drawers = drawers;
            initHighlightTextures(model);
        }

        function createDrawerLabel(i) {
            const labels = document.querySelector('#labels');
            const dn = i + 1;
            const label = document.createElement('div');
            label.addEventListener('click', () => {
                console.warn('clicked drawer '+dn+' action label');
                //pub.onClick(dn);
            });
            label.textContent = 'Drawer '+dn;
            label.style.display = 'none';
            labels.appendChild(label);
            return label;
        }

        function showLabel(io, drawer) {
            if(io.parent.name === drawer) {
                const dn = parseInt(drawer.substring(6)) - 1;
                const open = drawerOpen[dn];
                const active = drawerActive[dn];
                if(!open && !active) {
                    return false;
                } else if(!open && io.name.substring(3) !== 'Box') {
                    return false;
                } else if(active && io.name.substring(3) !== 'Box') {
                    return false;
                } else if(engine.camera.position.y < 3) {
                    return false;
                }
                return true;
            } else {
                return false;
            }
        }



        // load model into scene
        engine.loader.load('models/AideeDesk3m.glb', function(gltf) {
            //console.log('gltf', gltf);
            const model = gltf.scene.children[0];
            model.animations = gltf.animations;
            initDrawers(model);
            pub.model = model;

            // animations
            amixer = new THREE.AnimationMixer(model);
            amixer.addEventListener( 'finished', function( e	) {
                let action = e.action._clip.name;
                let dn = parseInt(action.substring(6, 7));
                let ai = engine.animating.indexOf('ad-'+dn);
                engine.animating.splice(ai, 1);
            });
            for(let a=0; a<6; a++) {
                const aNum = a + 1;
                const aName = 'Drawer'+aNum+'Action';
                const clip = THREE.AnimationClip.findByName( model.animations, aName );
                const anim = amixer.clipAction(clip);
                anim.loop = THREE.LoopOnce;
                anim.clampWhenFinished = true;
                drawerAnim[a] = anim;
            }
            engine.animated.push(pub);
            
            if(callback) callback(model);
            //engine.callAnimate();
            engine.objects.push(pub);
        });

        

        this.onMouseover = function(obj) {
            //console.log('moused over', obj.name);
            if(obj.name !== 'Frame') {
                document.body.style.cursor = 'pointer';

                // get parent drawer
                const drwrs = this.drawers;
                const indx = drwrs.indexOf(obj.parent);
                const drawer = drwrs[indx];

                // set the highlight materials on the parent drawer
                resetDrawerHighlights();
                for(let i=0; i<drawer.children.length; i++) {
                    const thisMat = drawer.children[i].material;
                    if(thisMat.name === 'Black') {
                        drawer.children[i].material = blackMat;
                    } else if(thisMat.name === 'Leather') {
                        drawer.children[i].material = leatherMat;
                    } else if(thisMat.name === 'Chrome') {
                        drawer.children[i].material = chromeMat;
                    }
                }

                engine.callAnimate();
            }
        };

        function resetMouseover() {
            document.body.style.cursor = 'default';
            resetDrawerHighlights();
            engine.callAnimate();
            // TODO: emit event: mousedout
        }

        function resetDrawerHighlights() {
            for(let d=0; d<6; d++) {
                const thisDrawer = pub.drawers[d];
                for(let i=0; i<thisDrawer.children.length; i++) {
                    const thisMat = thisDrawer.children[i].material;
                    if(thisMat.name === 'Black') {
                        thisDrawer.children[i].material = ogBlackMat;
                    } else if(thisMat.name === 'Leather') {
                        thisDrawer.children[i].material = ogLeatherMat;
                    } else if(thisMat.name === 'Chrome') {
                        thisDrawer.children[i].material = ogChromeMat;
                    }
                }
            }
        }

        this.onMouseout = resetMouseover;

        this.onClick = function(obj) {
            if(obj.name === 'Frame') {
                // move camera
                engine.ui.zoomTo('aideeDesk');
            } else {
                // toggle drawer
                let drawer = 0;
                if(typeof obj === 'number') {
                    drawer = obj;
                } else {
                    // get parent drawer
                    const drwrs = this.drawers;
                    const indx = drwrs.indexOf(obj.parent);
                    drawer = indx+1;
                }
                this.toggleDrawer(drawer); 
            }
        }


        this.updateAnimations = function() {
            const delta = clock.getDelta();
            amixer.update(delta);

            // update labels
            // for(let d=0; d<6; d++) {
            //     if(!drawerActive[d] && !drawerOpen[d]) continue;
            //     const drawer = this.drawers[d];
            //     console.log(drawer);
            //     const label = drawer.knoxyLabel;
            //     const tv = new THREE.Vector3();
            //     drawer.updateWorldMatrix(true, false);
            //     drawer.getWorldPosition(tv);
            //     tv.project(engine.camera);
            //     engine.ray.setFromCamera(tv, engine.camera);
            //     const io = engine.ray.intersectObjects(pub.model.children);
            //     const show = (io.length ? showLabel(io[0].object, drawer.name) : false);
            //     if(!show) {
            //         label.style.display = 'none';
            //     } else {
            //         const x = (tv.x *  .5 + .5) * engine.canvas.clientWidth;
            //         const y = (tv.y * -.5 + .5) * engine.canvas.clientHeight;
            //         label.style.display = '';
            //         label.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
            //     }
            // }
        }
    }
}
export { AideeDesk };