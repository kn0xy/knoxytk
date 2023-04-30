import * as THREE from './three.module.js';
import { CSS3DObject } from './CSS3DRenderer.js';

class AcerMonitor {
    constructor( engine, callback ) {

        const scene = engine.scene;
        const pub = this;

        this.power = 'ON';
        this.PowerOn = function(b) {
            if(b) {
                this.power = 'ON';
                this.screenLight.visible = true;
            } else {
                this.power = 'OFF';
                this.screenLight.visible = false;
            }
            engine.callAnimate();
        }

        // init rect light for screen
        function initRectLight() {
            const rectLight = new THREE.RectAreaLight( 0x9cacff , 30, 1, 0.6 );
            rectLight.position.set(0.58, 2.249, -0.45);
            rectLight.rotation.set(0, 2.70613035, 1.57079633);
            rectLight.visible = false;
            rectLight.name = 'RectLight2';
            pub.model.add(rectLight);
            pub.screenLight = rectLight;
        }

        // initialize interactive mouseover
        function initIntersectables(model) {
            // screen
            const mScreen = model.getObjectByName('Screen');
            mScreen.knoxyParent = pub;
            engine.intersectables.push(mScreen);

            // bezel
            const bezel = model.getObjectByName('OuterBezel');
            bezel.knoxyParent = pub;
            engine.intersectables.push(bezel);

            // mount
            const mount = model.children[1];
            for(let c=0; c<mount.children.length; c++) {
                let tc = mount.children[c];
                tc.knoxyParent = pub;
                engine.intersectables.push(tc);
            }
        }


        // initialize label/tooltip
        const label = document.createElement('div');
        label.addEventListener('click', showInfoWindow);
        label.textContent = 'Acer';
        label.style.display = 'none';
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;
        function showInfoWindow() {
            let infoContent = '<p><strong>Power:</strong> &nbsp; <button id="btnPowerM2">'+pub.power+'</button>';
            engine.ui.overlay.show('Acer Monitor', infoContent);
        }
        function initOverlayHandlers() {
            engine.ui.overlay.addClickHandler('btnPowerM2', (e) => {
                //console.log(e);
                const elem = document.getElementById('btnPowerM2');
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
        }
        this.showInfoWindow = showInfoWindow;


        // initialize display content
        this.initDisplay = function() {
            //const model = this.model;
            const cssScene = (engine.cssScene2 ? engine.cssScene2 : new THREE.Scene());
            
            // Create container
            const container = document.createElement('div');
            container.id = 'monitor2Container';
            pub.screenContainer = container;

            // Create iframe
            const iframe = document.getElementById('frame2') || document.createElement('iframe');
            iframe.id = 'monitor2Screen';
            iframe.src = '../2D/monitor2.html';
            iframe.onload = (e) => {
                pub.screenContent = e.target.contentDocument;
                let scale = 'scale(0.171, 0.183)';
                if(!container.style.transform.includes(scale)) {
                    container.style.transform += ' '+scale;
                }
                if(!container.style.transform.includes('rotateZ')) {
                    container.style.transform += ' rotateZ(90deg)';
                } 
            }
        
            // Add iframe to container
            container.appendChild(iframe);
        
            // Create CSS3D object and add to cssScene
            const object = new CSS3DObject(container);
            object.scale.set(0.0039, 0.0039, 0.0039);
            object.position.set(0.58, 2.249, -0.463);
            object.rotateZ(1.5708);
            object.rotateX(-0.43545965);
            cssScene.add(object);

            // Initialize transparent material (to reveal the CSS scene rendered underneath)
            const material = new THREE.MeshBasicMaterial({
                blending: THREE.NoBlending,
                color: 0x000000,
                opacity: 0,
                side: THREE.DoubleSide,
                transparent: true
            });

            // Create transparent 3D mesh
            const geometry = new THREE.PlaneGeometry(1, 1);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(object.position);
            mesh.rotation.copy(object.rotation);
            mesh.scale.set(1.065, 0.642, 1);

            // Add mesh to 3D scene
            engine.scene.add(mesh);
            engine.intersectables.push(mesh);
            mesh.knoxyParent = pub;
            pub.glMesh = mesh;
            return cssScene;
        }

        // Determine whether or not to display the CSS scene
        function renderScene() {
            if(engine.cssScene2) {
                const mm = pub.glMesh;
                if(pub.power==='OFF') {
                    mm.visible = false;
                    pub.model.add(mm);
                    pub.screenContainer.style.display = 'none';
                } else {
                    mm.visible = true;
                    scene.add(mm);
                    engine.cssRenderer2.render( engine.cssScene2, engine.camera );
                }
            }
        }
        engine.renderQueue.push(renderScene);


        // load model into scene
        engine.loader.load('models/Monitor2m.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.scale.set(0.3, 0.3, 0.3);
            model.getObjectByName('Monitor').scale.set(0.12, 0.12, 0.14);
            model.knoxyParent = pub;
            pub.model = model;
            initIntersectables(model);
            initRectLight();
            initOverlayHandlers();
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
        });


        this.mousedOver = false;
        this.onMouseover = function(obj) {
            document.body.style.cursor = 'crosshair';
            this.mousedOver = true;
            engine.callAnimate();
            if(obj === this.glMesh) engine.canvas.style.pointerEvents = 'none';
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.knoxyLabel.style.display = 'none';
            this.mousedOver = false;
            engine.callAnimate();
            engine.canvas.style.pointerEvents = '';
        };

        this.activePage = 'null';

        this.showContextMenu = function(tf) {
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
            if(pub.power === 'ON' && pub.activePage === 'resume') {
                menuItems.unshift({    
                    content: 'Open in New Tab',
                    click: function() {
                        window.open("https://www.knoxy.tk/2D/monitor2.html", "_blank");
                        engine.ui.contextMenu.close();
                    }
                });
            }
            engine.ui.contextMenu.show('AcerMonitor', menuItems, tf);
        }

        this.onClick = function(obj) {
            if(this.power === 'OFF') {
                this.PowerOn(true);
            } else {
                this.PowerOn(false);
            }
        }

        this.onRightClick = function(obj) {
            // add 5ms delay to prevent browser contextmenu event blocking
            setTimeout(function() {
                // show context menu
                pub.showContextMenu();
            }, 5);
        }

        this.updateAnimations = function() {
            // show label on mouseover
            if(this.mousedOver && !engine.mouseDown && engine.camera.position.z < 0.3) {
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

        this.clickEvents = [];
        this.ceExists = function(elemId) {
            const ce = this.clickEvents;
            for(var e=0; e<ce.length; e++) {
                if(ce[e].id === elemId) {
                    return ce[e].cb;
                }
            }
            return false;
        }
    }
}
export { AcerMonitor }