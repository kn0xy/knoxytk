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
            function createIframe() {
                // Create container
                const container = document.createElement('div');
                container.id = 'monitorContainer';
                pub.screenContainer = container;

                // Create iframe
                // const iframe = document.createElement('iframe');
                // iframe.src = './monitor.html';
                // iframe.style.boxSizing = 'border-box';
                // iframe.style.opacity = '1';
                // iframe.id = 'monitorScreen';
                // iframe.title = 'KnoxyOS';
                // iframe.onload = (e) => {
                //     //console.log('iframe loaded', e);
                //     pub.screenElem = iframe;
                //     iframe.getDaddy = function() {
                //         // return iframe.offsetParent;
                //         return iframe.getBoundingClientRect();
                //     }
                //     const style = document.createElement('style');
                //     style.textContent = 'body { zoom: 0.25 !important; }';
                //     e.target.contentDocument.head.appendChild(style);
                //     pub.screenContent = e.target.contentDocument;
                // }
                const iframe = document.getElementById('frame1') || document.createElement('iframe');
                iframe.id = 'monitorScreen';
                iframe.src = '../2D/monitor.html';
                iframe.style.display = '';
                iframe.onload = (e) => {
                    // const style = document.createElement('style');
                    // style.textContent = 'body { position: relative; top: -24px; }';
                    // e.target.contentDocument.head.appendChild(style);
                    pub.screenContent = e.target.contentDocument;

                }
            
                // Add iframe to container
                container.appendChild(iframe);
        
                // Create CSS object
                createCssObject(container);
            }
            function createCssObject(element) {
                // Create CSS3D object
                const object = new CSS3DObject(element);
        
                // copy monitor position and rotation
                object.scale.set(0.0039, 0.0039, 0.0039);
                object.position.copy(model.position);
                object.position.set(object.position.x-0.0075, object.position.y+0.12, object.position.z-0.005);
                object.rotation.copy(model.rotation);
        
                // Add to css scene
                cssScene.add(object);
        
                // Create 3D plane
                const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
                //material.blending = THREE.NoBlending;
                material.transparent = false;
        
                // Create the 3D plane mesh
                const geometry = new THREE.PlaneGeometry(0.5, 0.5);
                const mesh = new THREE.Mesh(geometry, material);
        
                // Copy the position, rotation and scale of the CSS plane to the 3D plane
                mesh.position.copy(object.position);
                mesh.rotation.copy(object.rotation);
                mesh.scale.set(2.3, 1.29, 1);
        
                // Add to gl scene
                mesh.name = 'MonitorMesh';
                //mesh.knoxyParent = pub;
                engine.scene.add(mesh);
                engine.intersectables.push(mesh);
            }
        
            createIframe();
            
            return cssScene;
        }
        function renderScene() {
            const ms = document.getElementById('monitorContainer');
            if(renderCss()) {
                showCssScene();
            }
            function renderCss() {
                if(engine.cssScene) {
                    const mm = engine.scene.getObjectByName('MonitorMesh');
                    if(scene.monitor1.power==='OFF') {
                        mm.visible = false;
                        scene.monitor1.model.add(mm);
                        if(ms) ms.style.display = 'none';
                        return false;
                    } else {
                        mm.visible = true;
                        scene.add(mm);
                        return true;
                    }
                }
                return false;
            }
            
            function showCssScene() {
                const tv = new THREE.Vector3();
                const mesh = engine.scene.getObjectByName('MonitorMesh');
                mesh.updateWorldMatrix(true, false);
                mesh.getWorldPosition(tv);
                tv.project(engine.camera);
                engine.ray.setFromCamera(tv, engine.camera);
                const io = engine.ray.intersectObjects(engine.intersectables);
                const show = (io.length ? showScene(io[0].object) : false);
                function showScene(obj) {
                    const cz = engine.camera.position.z;
                    return (obj.name==='MonitorMesh' || obj.name==='Screen' || cz > 1 ? true : false);
                }
            
                if(!show) {
                    engine.cssScene.visible = false;
                    if(ms) ms.style.display = 'none';
                } else {
                    engine.cssScene.visible = true;
                    if(ms) {
                        ms.style.display = '';
                        // if(!ms.style.transform.includes('scale(0.1877)')) {
                        //     console.log('set scale');
                        //     ms.style.transform += ' scale(0.1877)';
                        // }
                    } 
                    
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
export { LGMonitor }