import * as THREE from './three.module.js';
import { DRACOLoader } from './DRACOLoader.js';
import { GLTFLoader } from './GLTFLoader.js';

class TippyDesk {
    constructor( engine, callback ) {

        const scene = engine.scene;
        const pub = this;

        // initialize materials
        const materials = [];
        const highlights = [];
        this.materials = materials;
        function initMaterials(obj) {
            let kids = obj.children;
            if(kids.length) {
                for(let k=0; k<kids.length; k++) {
                    initMaterials(kids[k]);
                }
            } else {
                let thisMat = obj.material;
                if(!materials.includes(thisMat)) {
                    materials.push(thisMat);
                }
            }
        }
        function setupHighlightMaterials() {
            for(let m=0; m<materials.length; m++) {
                const hMat = materials[m].clone();
                hMat.emissive.setHex(0xffffff);
                if(hMat.name === 'Black') {
                    hMat.emissiveIntensity = 0.004;
                } else {
                    hMat.emissiveIntensity = 0.02;
                }
                
                highlights.push(hMat);
            }
        }
        function applyTextures(obj, btf) {
            if(!obj.hasOwnProperty('knoxyParent')) return;
            let kids = obj.children;
            if(kids && kids.length) {
                for(let k=0; k<kids.length; k++) {
                    applyTextures(kids[k], btf);
                }
            } else {
                try {
                    // apply the appropriate texture to the mesh
                    //if(obj.hasOwnProperty('isMesh') && obj.isMesh) {
                        let tmName = obj.material.name;
                        let tma = (btf ? materials : highlights);
                        obj.material = getMatByName(tmName, tma);
                        engine.callAnimate();
                    //}
                    
                } catch(e) {
                    console.error('applyTextures', e);
                }
                
            }
        }
        function getMatByName(name, mats) {
            for(let m=0; m<mats.length; m++) {
                if(mats[m].name === name) return mats[m];
            }
        }
        



        // initialize label/tooltip
        let preventFade = false;
        const label = document.createElement('div');
        label.addEventListener('click', handleLabelClick);
        label.addEventListener('mouseover', ()=>{
            applyTextures(pub.model, false);
            preventFade = true;
        });
        label.addEventListener('mouseout', ()=>{
            applyTextures(pub.model, true);
            preventFade = false;
            fadeLabel(500);
        });
        //label.innerHTML = '<img src="keeks.jpg" style="height:5rem;width:5rem;">';
        
        label.innerHTML = '<h3>View Portfolio</h3>'
        label.style.display = 'none';
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;
        function handleLabelClick() {
            //engine.ui.overlay.show('TippyDesk.net', '<p>Father me randy</p>');
            engine.ui.moveCameraTo('tippyDesk');
            label.style.display = 'none';
            //fadeLabel(100);
        }
        // function applyHighlight() {
        //     applyTextures(pub.model, false);
        // }
        // function resetHighlight() {
        //     applyTextures(pub.model, true);
        // }

        function initIntersectables(model) {
            // let kbTray = model.children[2].children;
            // for(let i=0; i<kbTray.length; i++) {
            //     kbTray[i].knoxyParent = pub;
            //     engine.intersectables.push(kbTray[i]);
            // }
            
            for(let g=0; g<model.children.length; g++) {
                let tg = model.children[g];
                tg.knoxyParent = pub;
                let gc = tg.children;
                for(let c=0; c<gc.length; c++) {
                    gc[c].knoxyParent = pub;
                    engine.intersectables.push(gc[c]);
                }
            }
        }


        // initialize animations
        const clock = new THREE.Clock();
        clock.autoStart = false;
        let anim = false;
        let amixer;
        function initAnimations(model) {
            amixer = new THREE.AnimationMixer(model);
            const clip = THREE.AnimationClip.findByName( model.animations, 'KBTrayAction' );
            anim = amixer.clipAction(clip);
            anim.loop = THREE.LoopPingPong;
            pub.animaction = anim;
        }
        let trayOut = false;
        this.onToggle = ()=>{};
        this.toggleTray = function() {
            clock.start();
            if(trayOut) {
                anim.play();
            } else {
                anim.stop().play();
            }
            //anim.play();
            anim.paused = false;
            engine.animating.push(1);
            engine.callAnimate(true);
            setTimeout(function() {
                anim.paused = true;
                engine.animating.shift();
                trayOut = (trayOut ? false : true);
            }, 1250);
        }
        //this.kbTrayOut = trayOut;
        this.isTrayOut = function() {
            return trayOut;
        }


        // load model into scene
        engine.loader.load('models/TippyDesk2.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.animations = gltf.animations;
            model.scale.set(1.36, 1.36, 1.36);
            model.knoxyParent = pub;
            pub.model = model;
            initAnimations(model);
            initIntersectables(model);
            initMaterials(model);
            setupHighlightMaterials();
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
            //engine.callAnimate();
        });


        this.mousedOver = false;
        this.onMouseover = function(obj) {
            if(obj.name === 'KB_Tray') {
                document.body.style.cursor = 'pointer';
            }
            this.mousedOver = true;
            if(obj.parent.name === 'KeyboardTray') {
                applyTextures(obj.parent, false);
                this.knoxyLabel.innerHTML = `<h3>${(trayOut ? 'Exit':'View')} Portfolio</h3>`;
                engine.callAnimate();
            }
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.mousedOver = false;
            applyTextures(this.model, true);
            if(recentlyShown) {
                recentlyShown = false;
                fadeLabel();
            }
        };

        let recentlyShown = false;
        let isFading = false;
        // function fadeLabel(delay) {
        //     if(!isFading) {
        //         // after specified delay (2 sec default)
        //         let td = delay || 2000;
        //         console.log('td',td);
        //         setTimeout(function() {
        //             // hide (400ms transition)
        //             if(!preventFade) {
        //                 const cl = pub.knoxyLabel;
        //                 cl.classList.replace('show', 'hide');
                        
        //                 // reset after 500ms (100ms buffer)
        //                 setTimeout(function() {
        //                     recentlyShown = false;
        //                     cl.style.display = 'none';
        //                     cl.classList.replace('hide', 'show');
        //                     preventFade = false;
        //                     isFading = false;
        //                 }, 500);
        //                 //preventFade = true;
        //             } else {
        //                 //console.log('fade prevented');
        //                 //recentlyShown = false;
        //                 preventFade = false;
        //                 isFading = false;
        //             }
                    
        //         }, td);
        //         isFading = true;
        //     }
        // }
        this.updateAnimations = function() {
            const delta = clock.getDelta();
            amixer.update(delta);

            // if(this.mousedOver && !engine.mouseDown && !engine.tweening) {
            //     const tv = new THREE.Vector3(0.345, 1.704, 0);
            //     tv.project(engine.camera);
            //     const x = (tv.x *  .5 + .5) * engine.canvas.clientWidth;
            //     const y = (tv.y * -.5 + .5) * engine.canvas.clientHeight;
            //     this.knoxyLabel.style.display = '';
            //     this.knoxyLabel.classList.add('show');
            //     this.knoxyLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
            
            // } else {
                // if(!recentlyShown) {
                //     console.log('was shown');
                //     if(engine.tweening) {
                //         this.knoxyLabel.style.display = 'none';
                //     } else if(this.knoxyLabel.style.display !== 'none') {
                //         fadeLabel();
                //     } else {
                //         preventFade = true;
                //     }
                //     recentlyShown = true;
                // }
            }
        }
    }
//}
export { TippyDesk }