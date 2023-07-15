import * as THREE from './three.module.js';

class TvStand {
    constructor( engine, callback ) {

        const scene = engine.scene;
        const pub = this;

        // Initialize mouseover highlights
        let ogHandle, hiHandle, ogDoor, hiDoor;
        function initHighlights(model) {
            ogDoor = model.getObjectByName('Door1Mesh').material;
            ogHandle = model.getObjectByName('Door1Mesh_1').material;
            hiDoor = ogDoor.clone();
            hiDoor.emissive.setHex(0xffffff);
            hiDoor.emissiveIntensity = 0.004;
            hiHandle = ogHandle.clone();
            hiHandle.emissive.setHex(0xffffff);
            hiHandle.emissiveIntensity = 0.005;
        }
        function applyHighlight(mesh) {
            let dn = mesh.name.substring(4,5);
            pub.model.getObjectByName('Door'+dn+'Mesh').material = hiDoor;
            pub.model.getObjectByName('Door'+dn+'Mesh_1').material = hiHandle;
            engine.callAnimate();
        }
        function resetHighlights() {
            for(let i=1; i<=3; i++) {
                pub.model.getObjectByName('Door'+i+'Mesh').material = ogDoor;
                pub.model.getObjectByName('Door'+i+'Mesh_1').material = ogHandle;
            }
            engine.callAnimate();
        }
        
        // Initialize intersectable meshes
        function initIntersectables(model) {
            model.traverse((obj) => {
                if(obj.hasOwnProperty('isMesh')) {
                    obj.knoxyParent = pub;
                    engine.intersectables.push(obj);
                }
            });
        }

        // Initialize door animations
        const clock = new THREE.Clock(false);
        let amixer, anims;
        function initAnimations(model) {
            amixer = new THREE.AnimationMixer(model);
            amixer.addEventListener( 'finished', function( e	) {
                let action = e.action._clip.name;
                let dn = parseInt(action.substring(4, 5));
                let ai = engine.animating.indexOf('tvs-'+dn);
                engine.animating.splice(ai, 1);
            });
            anims = [];
            for(let i=1; i<=3; i++) {
                let action = 'Door'+i+'Action';
                const clip = THREE.AnimationClip.findByName(model.animations, action);
                const anim = amixer.clipAction(clip);
                anim.loop = THREE.LoopOnce;
                anim.clampWhenFinished = true;
                anims.push(anim);
            }
            pub.anims = anims;
        }

        // Toggle door animations
        let doorOpen = [false, false, false];
        let doorActive = [false, false, false];
        this.toggleDoor = function(door) {
            let di = door - 1;
            let anim = this.anims[di];
            let open = doorOpen[di];
            let active = doorActive[di];
            let desc = 'tvs-'+di;
            if(!active) {
                // start the animation
                clock.start();
                if(!open) anim.stop();
                anim.timeScale = (doorOpen[di] ? -1 : 1);
                anim.play();
                doorActive[di] = true;
                if(anim.paused) anim.paused = false;
                engine.animating.push(desc);

                // update door status after animation complete (0.625s)
                setTimeout(function() {
                    if(!open) {
                        doorOpen[di] = true;
                    } else {
                        doorOpen[di] = false;
                    }
                    //anims[di].paused = true;
                    doorActive[di] = false;
                    let ai = engine.animating.indexOf(desc);
                    engine.animating.splice(ai, 1);
                }, 625);
            }
        }
        
        // Load model into scene
        engine.loader.load('models/tvStand.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.animations = gltf.animations;
            model.scale.set(0.0065, 0.0065, 0.0065);
            model.knoxyParent = pub;
            pub.model = model;
            initHighlights(model);
            initIntersectables(model);
            initAnimations(model);
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
        });

        // Handle mouseover
        this.mousedOver = false;
        this.onMouseover = function(obj) {
            let regx = new RegExp(/Door\dMesh[_1]?/);
            if(obj.name.match(regx)) {
                document.body.style.cursor = 'pointer';
                applyHighlight(obj);
            }
            this.mousedOver = true;
        };

        // Handle mouse out
        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.mousedOver = false;
            resetHighlights();
        };

        // Update animations
        this.updateAnimations = function() {
            const delta = clock.getDelta();
            amixer.update(delta);
        }
    }
}
export { TvStand }