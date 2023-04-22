import * as THREE from './three.module.js';
import { CSS3DObject } from './CSS3DRenderer.js';

class LGMonitor {
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
            try {
                engine.callAnimate();
            } catch(e) {
                console.log('lg mon failed to animate');
            }
            
        }

        // initialize interactive mouseover
        function initIntersectables(model) {
            for(let c=0; c<model.children.length; c++) {
                let tc = model.children[c];
                tc.knoxyParent = pub;
                engine.intersectables.push(tc);
            }
        }


        // initialize label/tooltip
        const label = document.createElement('div');
        label.textContent = 'LG 4K HDR';
        label.style.display = 'none';
        label.addEventListener('click', showContextMenu);
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;
        

        // initialize overlay / info window
        function showInfoWindow() {
            let infoContent = '<p><strong>Power:</strong> &nbsp; <button id="btnPowerM1">'+pub.power+'</button>';
            engine.ui.overlay.show('LG HDR 4K', infoContent);
        }
        function initOverlayHandlers() {
            engine.ui.overlay.addClickHandler('btnPowerM1', (e) => {
                //console.log(e);
                const elem = document.getElementById('btnPowerM1');
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

        // initialize baby tooltips (back panel ports)
        const tip = document.createElement('div');
        tip.style.fontSize = '0.9rem';
        tip.style.color = '#CECECE';
        tip.style.display = 'none';
        document.querySelector('#labels').appendChild(tip);
        this.knoxyTip = tip;

        function showTip(name) {
            let tipText = name;
            if(name === 'BA') {
                tipText = 'H/P';
            } else if(name === 'DC_Outer' || name === 'DC_Inner') {
                tipText = 'DC IN';
            }
            const t = pub.knoxyTip;
            const x = engine.pointer.ax;
            const y = engine.pointer.ay - 15;
            t.textContent = tipText;
            t.style.display = '';
            t.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        }

        // init rect light for screen
        function initRectLight() {
            const rectLight = new THREE.RectAreaLight( 0x9cacff , 30, 1.15, 0.6 );
            rectLight.rotateY(3.14159);
            rectLight.visible = false;
            rectLight.name = 'RectLight1';
            pub.model.add(rectLight);
            pub.screenLight = rectLight;
        }


        // initialize display content
        this.initDisplay = function() {
            const model = this.model;
            const cssScene = (engine.cssScene ? engine.cssScene : new THREE.Scene());
            
            // Create container
            const container = document.createElement('div');
            container.id = 'monitorContainer';
            pub.screenContainer = container;

            // Create iframe
            const iframe = document.getElementById('frame1') || document.createElement('iframe');
            iframe.id = 'monitorScreen';
            iframe.src = '../2D/monitor.html';
            iframe.style.boxSizing = 'border-box';
            iframe.style.opacity = '1';
            iframe.onload = (e) => {
                pub.screenContent = e.target.contentDocument;
                let scale = 'scale(0.1877)';
                if(!container.style.transform.includes(scale)) {
                    container.style.transform += ' '+scale;
                }
            }
        
            // Add iframe to container
            container.appendChild(iframe);
        
            // Create CSS3D object and add to cssScene
            const object = new CSS3DObject(container);
            object.scale.set(0.0039, 0.0039, 0.0039);
            object.position.copy(model.position);
            object.position.set(object.position.x-0.0075, object.position.y+0.12, object.position.z-0.005);
            object.rotation.copy(model.rotation);
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
            const geometry = new THREE.PlaneGeometry(0.5, 0.5);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(object.position);
            mesh.rotation.copy(object.rotation);
            mesh.scale.set(2.3, 1.29, 1);

            // Add mesh to 3D scene
            engine.scene.add(mesh);
            engine.intersectables.push(mesh);
            mesh.knoxyParent = pub;
            pub.glMesh = mesh;
            
            return cssScene;
        }

        // Determine whether or not to display the CSS scene
        function renderScene() {
            if(engine.cssScene) {
                const mm = pub.glMesh;
                if(scene.monitor1.power==='OFF') {
                    mm.visible = false;
                    scene.monitor1.model.add(mm);
                    pub.screenContainer.style.display = 'none';
                } else {
                    mm.visible = true;
                    scene.add(mm);
                    engine.cssRenderer.render( engine.cssScene, engine.camera );
                }
            }
        }
        engine.renderQueue.push(renderScene);


        this.setInteractive = (b) => {
            if(b) {
                this.screenContainer.style.pointerEvents = '';
            } else {
                this.screenContainer.style.pointerEvents = 'none';
            }
        }

        // set monitor resolution 16:9 and scale to fit mesh
        // @dev: called by this.screenContent onload handler
        this.setMonitorScale = () => {
            const mc = this.screenContainer;
            const scale = 'scale(0.1877)';
            if(!mc.style.transform.includes(scale)) {
                mc.style.transform += ' '+scale;
            }
        }
        

        

        // load model into scene
        engine.loader.load('models/LG-HDR-4K3m.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.scale.set(0.05, 0.05, 0.05);
            model.knoxyParent = pub;
            pub.model = model;
            initIntersectables(model);
            initRectLight();
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
            //engine.callAnimate();
            initOverlayHandlers();
        });


        this.mousedOver = false;
        const tips = ['DisplayPort', 'HDMI1', 'HDMI2', 'BA', 'DC_Inner', 'DC_Outer'];
        this.onMouseover = function(obj) {
            document.body.style.cursor = 'crosshair';
            this.mousedOver = true;
            engine.callAnimate();
            if(obj === this.glMesh) engine.canvas.style.pointerEvents = 'none';

            if(engine.controls.getDistance() < 4) {
                if(tips.includes(obj.name)) {
                    showTip(obj.name);
                } else {
                    this.knoxyTip.style.display = 'none';
                }
            } else {
                this.knoxyTip.style.display = 'none';
            }
        };

        this.onMouseout = function() {
            engine.canvas.style.pointerEvents = '';
            document.body.style.cursor = 'default';
            this.knoxyLabel.style.display = 'none';
            this.knoxyTip.style.display = 'none';
            this.mousedOver = false;
            engine.callAnimate();
        };

        this.onClick = function(obj) {
            if(this.power === 'OFF') {
                this.PowerOn(true);
            } else {
                this.PowerOn(false);
            }
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
            engine.ui.contextMenu.show('Lamp', menuItems, false);
        }
        this.showContextMenu = showContextMenu;


        this.onRightClick = function(obj) {
            // add 5ms delay to prevent browser contextmenu event blocking
            setTimeout(function() {
                // show context menu
                showContextMenu();
            }, 5);
        }

        

        this.updateAnimations = function() {
            // show label on mouseover
            if(this.mousedOver && !engine.mouseDown && engine.camera.position.z < 0) {
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
export { LGMonitor }