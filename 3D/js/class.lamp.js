import * as THREE from './three.module.js';

class Lamp {
    constructor( engine, callback ) {

        const scene = engine.scene;
        const pub = this;

        // initialize lightbulb
        const light = new THREE.PointLight(0xd6c99a, 2, 5.75, 1);
        light.position.set(-3.55, 2.25, -0.52)
        light.visible = false;
        light.castShadow = true;
        scene.add(light);
        this.light = light;
        // const helper = new THREE.PointLightHelper(light, 0.1);
        // scene.add(helper);
        

        // initialize power toggle
        this.power = 'OFF';
        this.PowerOn = function(b) {
            if(b) {
                this.light.visible = true;
                glassMat.opacity = 0.75;
                fillyMat.opacity = 1;
                bulbMat.opacity = 0.5;
                this.power = 'ON';
            } else {
                this.light.visible = false;
                glassMat.opacity = 0.95;
                fillyMat.opacity = 0.1;
                bulbMat.opacity = 1;
                this.power = 'OFF';
            }
            try {
                engine.callAnimate();
            } catch(e) {
                console.log('lamp failed to animate');
            }
            
        }

        // initialize label/tooltip
        const label = document.createElement('div');
        label.addEventListener('click', showContextMenu);
        label.textContent = 'Lamp';
        label.style.display = 'none';
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;


        // initialize overlay info window
        function showInfoWindow() {
            let infoContent = '<p><strong>Power:</strong> &nbsp; <button id="btnPowerLamp">'+pub.power+'</button>';
            engine.ui.overlay.show('Lamp', infoContent);
        }
        engine.ui.overlay.addClickHandler('btnPowerLamp', (e) => {
            //console.log(e);
            const elem = document.getElementById('btnPowerLamp');
            if(elem.innerText === 'OFF') {
                // Power On
                elem.innerText = 'ON';
                pub.PowerOn(true);
            } else {
                // Power Off
                elem.innerText = 'OFF';
                pub.PowerOn(false);
            }
        });
        


        // initialize materials
        const ogMats = [];
        const highlightMats = [];
        const highlights = ['Base', 'PowerKnob', 'Ring', 'Rod', 'TopPiece', 'Bulb_Stem'];
        let glassMat, bulbMat, fillyMat;
        function initMats(model) {
            // glass texture
            glassMat = model.getObjectByName('Outer_Glass').material;
            glassMat.blending = THREE.MultiplyBlending;
            glassMat.metalness = 0.45;
            glassMat.roughness = 0.05;

            // inner bulb texture
            bulbMat = glassMat.clone();
            bulbMat.roughness = 0.5;
            bulbMat.metalness = 0.5;
            model.getObjectByName('Bulb_Inner').material = bulbMat;

            // filament texture
            fillyMat = model.getObjectByName('Filly1').material;
            fillyMat.emissive.setHex(0xffff80);
            fillyMat.emissiveIntensity = 0.25;
            fillyMat.transparent = true;
            fillyMat.opacity = 0.1;

            // mouseover highlights
            let hi = [];
            for(let h=0; h<highlights.length; h++) {
                const hilite = model.getObjectByName(highlights[h]);
                const m = hilite.material.name;
                if(!hi.includes(m)) {
                    const mat = hilite.material.clone();
                    mat.emissive.setHex(0xffffff);
                    mat.emissiveIntensity = 0.04;
                    ogMats.push(hilite.material);
                    highlightMats.push(mat);
                    hi.push(m);
                }
            }            
        }
        function getHighlightMat(matName) {
            for(let i=0; i<highlightMats.length; i++) {
                const h = highlightMats[i];
                if(h.name === matName) return h;
            }
            return false;
        }
        function getOgMat(matName) {
            for(let i=0; i<ogMats.length; i++) {
                const h = ogMats[i];
                if(h.name === matName) return h;
            }
        }
        function showHighlights() {
            // show highlight textures
            for(let m=0; m<highlights.length; m++) {
                const hp = pub.model.getObjectByName(highlights[m]);
                let mat = hp.material.name;
                const hMat = getHighlightMat(mat);
                if(hMat !== false) {
                    hp.material = hMat;
                }
            }
            if(pub.power === 'OFF') {
                fillyMat.opacity = 0.25;
                glassMat.opacity = 0.9;
            }
        }
        function resetHighlights() {
            // show og textures
            for(let m=0; m<highlights.length; m++) {
                const hp = pub.model.getObjectByName(highlights[m]);
                let mat = hp.material.name;
                const ogMat = getOgMat(mat);
                if(ogMat !== false) {
                    hp.material = ogMat;
                }
            }
            if(pub.power === 'OFF') {
                fillyMat.opacity = 0.1;
                glassMat.opacity = 0.95;
            }
        }

        function initIntersectables(model) {
            for(let c=0; c<model.children.length; c++) {
                let tc = model.children[c];
                tc.knoxyParent = pub;
                engine.intersectables.push(tc);
            }
        }

        


        // load model into scene
        engine.loader.load('models/lamp.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.scale.set(4, 4, 4);
            model.knoxyParent = pub;
            pub.model = model;
            initMats(model);
            initIntersectables(model);
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
            //engine.callAnimate();
        });


        this.mousedOver = false;
        this.onMouseover = function(obj) {
            document.body.style.cursor = 'pointer';
            this.knoxyLabel.style.display = '';
            showHighlights();
            this.mousedOver = true;
            engine.callAnimate();
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.knoxyLabel.style.display = 'none';
            resetHighlights();
            this.mousedOver = false;
            engine.callAnimate();
        };

        
        this.onClick = function(obj) {
            // toggle power on/off
            let po = (pub.power==='OFF' ? true : false);
            this.PowerOn(po);
        }

        // context menu
        function showContextMenu() {
            let menuItems = [
                {
                    content: 'Power '+(pub.power==='OFF' ? 'On' : 'Off'),
                    click: function() {
                        let po = (pub.power==='OFF' ? true : false);
                        pub.PowerOn(po);
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


        this.onRightClick = function(obj) {
            // add 5ms delay to prevent browser contextmenu event blocking
            setTimeout(function() {
                // show context menu
                showContextMenu();
            }, 5);
        }

        
        this.updateAnimations = function() {
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
export { Lamp }