import * as THREE from './three.module.js';

class PCTower {
    constructor( engine, callback ) {

        // initialize scene & global scope
        const scene = engine.scene;
        const pub = this;

        // initialize label/tooltip
        const label = document.createElement('div');
        label.addEventListener('click', showContextMenu);
        label.textContent = 'PC';
        label.style.display = 'none';
        document.querySelector('#labels').appendChild(label);
        this.knoxyLabel = label;
        
        // show info window
        function showInfoWindow() {
            let infoContent = '<p>TO DO: Add some interactivity or purpose to this</p>';
            engine.ui.overlay.show('PC Tower', infoContent);
        }

        // show context menu
        function showContextMenu() {
            let menuItems = [
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

        // initialize intersectable meshes
        function initIntersectables(model) {
            let meshes = model.children[0].children[0].children;
            for(var m=0; m<meshes.length; m++) {
                let tc = meshes[m];
                tc.knoxyParent = pub;
                engine.intersectables.push(tc);
            }
            // for(let c=0; c<model.children.length; c++) {
            //     const gkids = model.children[c].children;
            //     for(var g=0; g<gkids.length; g++) {
            //         if(gkids[g].hasOwnProperty('isGroup')) {
            //             const meshes = gkids[g].children;
            //             for(var m=0; m<meshes.length; m++) {
            //                 let tc = meshes[m];
            //                 tc.knoxyParent = pub;
            //                 engine.intersectables.push(tc);
            //             }
            //         } else {
            //             let tc = gkids[g];
            //             tc.knoxyParent = pub;
            //             engine.intersectables.push(tc);
            //         }
            //     }
            // }
        }

        // load model into scene
        engine.loader.load('models/tower2.glb', function(gltf) {
            const model = gltf.scene.children[0];
            model.knoxyParent = pub;
            pub.model = model;
            model.animations = gltf.animations;
            initIntersectables(model);
            if(callback) callback(model);
            engine.objects.push(pub);
            engine.animated.push(pub);
            //engine.callAnimate();
        });


        // handle mouse events
        this.mousedOver = false;
        this.onMouseover = function(obj) {
            document.body.style.cursor = 'pointer';
            this.knoxyLabel.style.display = '';
            this.mousedOver = true;
            engine.callAnimate();
        };

        this.onMouseout = function() {
            document.body.style.cursor = 'default';
            this.knoxyLabel.style.display = 'none';
            this.mousedOver = false;
            engine.callAnimate();
        };

        this.onClick = function(obj) {
            console.log('click');
        }

        this.onRightClick = function(obj) {
            // add 5ms delay to prevent browser contextmenu event blocking
            setTimeout(function() {
                // show context menu
                showContextMenu();
            }, 5);
        }


        // update animations
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
export { PCTower }