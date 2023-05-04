import * as THREE from './three.module.js';

class Ender3v2 {
    constructor( engine, callback ) {

        const scene = engine.scene;
        const pub = this;

        // initialize power toggle
        this.power = 'OFF';
        this.PowerOn = function(b) {
            if(b) {
                screenPower(true);
                this.power = 'ON';
            } else {
                this.power = 'OFF';
                screenPower(false);
            }
            try {
                engine.callAnimate();
            } catch(e) {
                console.log('ender3v2 failed to animate');
            }
        }
        function screenPower(on) {
            if(on) {
                screen.material = blueMat;
            } else {
                screen.material = screenMat;
            }
        }

        // initialize label/tooltip
        const label = document.createElement('div');
        label.addEventListener('click', showContextMenu);
        label.textContent = 'Ender 3 v2';
        label.style.display = 'none';
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;

        // initialize info window
        function showInfoWindow() {
            let infoContent = '<p>Power: <button id="btnPowerE3">'+pub.power+'</button></p>';
            engine.ui.overlay.show('Ender 3 v2', infoContent);
        }
        engine.ui.overlay.addClickHandler('btnPowerE3', (e) => {
            //console.log(e);
            const elem = document.getElementById('btnPowerE3');
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
        let screen, screenMat, blueMat;
        function initMats(model) {
            // initialize screen
            screen = model.getObjectByName('Screen');
            blueMat = screen.material;
            screenMat = model.getObjectByName('Hotend_Shroud').material;
            screen.material = screenMat;

            // initialize bed glass
            let glassMat = model.getObjectByName('Bed_Glass').children[0].material;
            glassMat.transparent = true;
            glassMat.opacity = 0.5;
        }


        // initialize interactive mouseover
        const ogMats = [];
        const highlightMats = [];
        const intersectables = [];
        function initIntersectables(model) {
            for(let c=0; c<model.children.length; c++) {
                let tc = model.children[c];
                for(let gc=0; gc<tc.children.length; gc++) {
                    // Initialize intersectable mesh
                    let mesh = tc.children[gc];
                    mesh.knoxyParent = pub;
                    intersectables.push(mesh);
                    engine.intersectables.push(mesh);

                    // Initialize materials
                    let tm = mesh.material;
                    if(tm && !ogMats.includes(tm)) ogMats.push(tm);
                }
            }
            initHighlightMats();
        }

        function initHighlightMats() {
            for(let og=0; og<ogMats.length; og++) {
                // clone each original material
                let ogMat = ogMats[og];
                let newMat = ogMat.clone();
                newMat.emissive.setHex(0xffffff);
                newMat.emissiveIntensity = 0.005;
                highlightMats.push(newMat);
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
            // show highlight materials
            for(let i=0; i<intersectables.length; i++) {
                const mesh = intersectables[i];
                if(mesh.name === 'Screen') continue;
                let mat = mesh.material;
                if(!mat) continue;
                let hiMat = getHighlightMat(mat.name);
                if(hiMat !== false) {
                    mesh.material = hiMat;
                }
            }
        }

        function resetHighlights() {
            // revert to original materials
            for(let i=0; i<intersectables.length; i++) {
                const mesh = intersectables[i];
                if(mesh.name === 'Screen') continue;
                let mat = mesh.material;
                if(!mat) continue;
                let ogMat = getOgMat(mat.name);
                if(ogMat !== false) {
                    mesh.material = ogMat;
                }
            }
        }
        
        
        // load model into scene
        engine.loader.load('models/Ender3v2.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.scale.set(0.6, 0.6, 0.65);
            pub.model = model;
            initMats(model);
            initIntersectables(model);
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
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
            // default click handler
            
        }

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
            engine.ui.contextMenu.show('Ender3v2', menuItems, false);
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
export { Ender3v2 }