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
            //rectLight.rotateY(2.70613035);
            //rectLight.rotateZ(1.57079633);
            rectLight.position.set(0.58, 2.249, -0.45);
            rectLight.rotation.set(0, 2.70613035, 1.57079633);
            rectLight.visible = false;
            rectLight.name = 'RectLight2';
            pub.model.add(rectLight);
            pub.screenLight = rectLight;
            // const rectLight = new THREE.RectAreaLight( 0x9cacff , 30, 1.15, 0.6 );
            // rectLight.rotateY(3.14159);
            // rectLight.visible = false;
            // rectLight.name = 'RectLight1';
            // pub.model.add(rectLight);
            // pub.screenLight = rectLight;
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
            const model = this.model;
            const cssScene2 = (engine.cssScene2 ? engine.cssScene2 : new THREE.Scene());
            function createIframe() {
                // Create container
                const container = document.createElement('div');
                container.id = 'monitor2Container';
                pub.screenContainer = container;
        
                // Create iframe
                // const iframe = document.createElement('iframe');
                // iframe.src = './monitor2.html';
                // //iframe.src = 'http://localhost/3d/resume.html';
                // iframe.id = 'monitor2Screen';
                // iframe.onload = (e) => {
                //     //console.log('iframe loaded', e);
                //     const style = document.createElement('style');
                //     style.textContent = 'body { zoom: 0.25 !important; overflow: hidden; }';
                //     e.target.contentDocument.head.appendChild(style);
                //     pub.screenContent = e.target.contentDocument;
                // }
                const iframe = document.getElementById('frame2') || document.createElement('iframe');
                iframe.id = 'monitor2Screen';
                iframe.src = '../2D/monitor2.html';
                iframe.style.display = '';
                iframe.onload = (e) => {
                    // const style = document.createElement('style');
                    // style.textContent = 'body { zoom: 0.25 !important; overflow: hidden; }';
                    // e.target.contentDocument.head.appendChild(style);
                    pub.screenContent = e.target.contentDocument;
                    const monHtml = e.target.contentDocument.getElementsByTagName('html')[0];
                    monHtml.style.transform = 'scale(0.25)';
                    monHtml.style.position = 'absolute';
                    monHtml.style.top = '-412px';
                    monHtml.style.left = '-249px';
                    monHtml.style.width = '664px';
                    monHtml.style.height = '1100px';
                    monHtml.style.overflow = 'hidden';
                }
        
                // Add iframe to container
                container.appendChild(iframe);
        
                // Create CSS object
                createCssObject(container);

                //iframe.src = iframe.src;
            }
            function createCssObject(element) {
                // Create CSS3D object
                const object = new CSS3DObject(element);
                
                // copy monitor position and rotation
                //const monitor = model.getObjectByName('Monitor');
                object.scale.set(0.0039, 0.0039, 0.0039);
                object.position.set(0.58, 2.249, -0.463);
                object.rotateZ(1.5708);
                object.rotateX(-0.43545965);

                // Add to css scene
                cssScene2.add(object);
        
                // Create 3D plane
                const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
                //material.blending = THREE.NoBlending;
                material.transparent = false;
        
                // Create the 3D plane mesh
                const geometry = new THREE.PlaneGeometry(1, 1);
                const mesh = new THREE.Mesh(geometry, material);
        
                // Copy the position, rotation and scale of the CSS plane to the 3D plane
                mesh.position.copy(object.position);
                mesh.rotation.copy(object.rotation);
                mesh.scale.set(1.065, 0.645, 1);

                // Add to gl scene
                mesh.name = 'MonitorMesh2';
                //mesh.knoxyParent = pub;
                engine.scene.add(mesh);
                engine.intersectables.push(mesh);
            }
        
            createIframe();
            return cssScene2;
        }
        function renderScene() {
            const ms = document.getElementById('monitor2Container');
            if(ms) {
                if(!ms.style.transform.includes('rotateZ')) ms.style.transform += 'rotateZ(90deg)';
            }
            
            if(renderCss()) {
                showCssScene();
            }
            function renderCss() {
                if(engine.cssScene2) {
                    const mm = engine.scene.getObjectByName('MonitorMesh2');
                    if(scene.monitor2.power==='OFF') {
                        mm.visible = false;
                        scene.monitor2.model.add(mm);
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
                const mesh = engine.scene.getObjectByName('MonitorMesh2');
                mesh.updateWorldMatrix(true, false);
                mesh.getWorldPosition(tv);
                tv.project(engine.camera);
                engine.ray.setFromCamera(tv, engine.camera);
                const io = engine.ray.intersectObjects(engine.intersectables);
                const show = (io.length ? showScene(io[0].object) : false);
                function showScene(obj) {
                    return (obj.name==='MonitorMesh2' || obj.name==='Screen' ? true : false);
                }
                if(!show) {
                    engine.cssScene2.visible = false;
                    if(ms) ms.style.display = 'none';
                } else {
                    engine.cssScene2.visible = true;
                    if(ms) ms.style.display = '';
                    engine.cssRenderer.render( engine.cssScene2, engine.camera );
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
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.knoxyLabel.style.display = 'none';
            
            this.mousedOver = false;
            engine.callAnimate();
        };

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