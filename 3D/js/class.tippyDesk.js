import * as THREE from './three.module.js';
import { DRACOLoader } from './DRACOLoader.js';
import { GLTFLoader } from './GLTFLoader.js';

class TippyDesk {
    constructor( engine, callback ) {

        const pub = this;

        // initialize materials
        let ogBlack, hiBlack;
        function initMaterials() {
            ogBlack = pub.model.getObjectByName('KB_Tray').material;
            hiBlack = ogBlack.clone();
            hiBlack.emissive.setHex(0xffffff);
            hiBlack.emissiveIntensity = 0.004;
            hiBlack.name = 'hiBlack';
        }
        
        // initialize mouse picking
        function initIntersectables(model) {            
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
        function highlightTray(son) {
            const kbTray = pub.model.getObjectByName('KB_Tray');
            kbTray.material = (son ? hiBlack : ogBlack);
            engine.callAnimate();
        }

        // initialize keyboard tray animation
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

        // initialize keyboard tray toggle
        let trayOut = false;
        this.toggleTray = function() {
            clock.start();
            if(trayOut) {
                anim.play();
            } else {
                anim.stop().play();
            }
            anim.paused = false;
            engine.animating.push(1);
            engine.callAnimate(true);
            setTimeout(function() {
                anim.paused = true;
                engine.animating.shift();
                trayOut = (trayOut ? false : true);
            }, 1250);
        }
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
            initMaterials();
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
        });

        // handle mouseover
        this.mousedOver = false;
        this.onMouseover = function(obj) {
            if(obj.name === 'KB_Tray') {
                document.body.style.cursor = 'pointer';
            }
            this.mousedOver = true;
            if(obj.parent.name === 'KeyboardTray') {
                highlightTray(true);
            }
        };

        // handle mouseout
        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.mousedOver = false;
            highlightTray(false);
        };

        // update animations
        this.updateAnimations = function() {
            const delta = clock.getDelta();
            amixer.update(delta);
        }
    }
}
export { TippyDesk }