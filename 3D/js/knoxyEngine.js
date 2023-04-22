import * as THREE from './three.module.js';
import { TWEEN } from './tween.module.min.js';
import { OrbitControls } from './OrbitControls.js';
import { DRACOLoader } from './DRACOLoader.js';
import { GLTFLoader } from './GLTFLoader.js';
import { KnoxyUI } from './knoxyUI.js';
import { SceneX } from './knoxyScenes.js';
import { CSS3DRenderer } from './CSS3DRenderer.js';


// Define engine globals
let knoxy = {
    animated: [],
    animating: [],
    kp: null,
    objects: [],
    paused: false,
    ui: null,
    renderQueue: [],
    renderScenes: ()=>{
        for(let i=0; i<knoxy.renderQueue.length; i++) {
            const func = knoxy.renderQueue[i];
            func();
        }
    },
    tweening: false,
    view: false
};

// Initialize loader
let et = new Date();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./js/lib/');
dracoLoader.preload();
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.filesLoaded = [];
loader.manager.onLoad = function() {
    let nt = new Date();
    let te = (nt.getTime() - et.getTime()) / 1000;
    window.loadedModels = true;
    console.info(`Knoxy3D loaded in ${te} seconds`);
}
knoxy.loader = loader;




// Initialize camera
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100 );
camera.position.z = 25;
camera.position.y = 15;
camera.position.x = -5;
knoxy.camera = camera;


// Initialize pointer
const pointer = new THREE.Vector2();
let INTERSECTED = null;
let raycaster = new THREE.Raycaster();
let intersectables = [];
knoxy.pointer = pointer;
knoxy.ray = raycaster;
knoxy.intersectables = intersectables;


// Initialize renderer
const canvas = document.querySelector('#knoxy');
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true,
    alpha: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
//renderer.toneMapping = THREE.ACESFilmicToneMapping;
//renderer.outputEncoding = THREE.BasicDepthPacking;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 0.0);
knoxy.canvas = canvas;
knoxy.renderer = renderer;


// CSS Renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize( window.innerWidth, window.innerHeight );
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0px';
//cssRenderer.domElement.style.pointerEvents = 'none';
document.getElementById( 'wrapper' ).appendChild( cssRenderer.domElement );
knoxy.cssRenderer = cssRenderer;


// Initialize controls
const controls = new OrbitControls(camera, renderer.domElement);
let controlsInitialized = false;
controls.target = new THREE.Vector3(0, 2, 0.75);
controls.enableDamping = true;
controls.maxPolarAngle = 1.5;
//controls.minDistance = 2;
controls.maxDistance = 8;
controls.addEventListener('change', function() {
    if(!controlsInitialized) {
        controlsInitialized = true;
    } else {
        if(knoxy.animating.indexOf('controls') === -1) {
            let needsRender = (knoxy.animating.length===0 ? true : false);
            knoxy.animating.push('controls');
            findPointerIntersections();
            if(needsRender) render();
            setTimeout(function() {
                knoxy.animating.shift();
            }, 1000);
        }
    }
    knoxy.view = false;
});
knoxy.controls = controls;


// Initialize scene
knoxy.ui = new KnoxyUI(knoxy);
const scene = SceneX(knoxy);




// Initialize event listeners
// -- Mouse move
document.addEventListener('mousemove', onPointerMove);
function onPointerMove(event) {
    if(!knoxy.paused) {
        pointer.ax = event.clientX;
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.ay = event.clientY;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        findPointerIntersections();
    }
}


// -- MouseDown
document.addEventListener('mousedown', function(e) {
    setTimeout(()=>{
        knoxy.mouseDown = true;
    }, 250);
    if(e.button === 2) {
        if(e.target.id !== 'knoxy') {
            e.preventDefault();
            console.log('rc', e);
        } 
    }
    //console.log(e);
});


// -- MouseUp
document.addEventListener('mouseup', function() {
    setTimeout(()=>{
        knoxy.mouseDown = false;
        if(!knoxy.paused) findPointerIntersections();
    }, 250);
});


// -- Click
canvas.addEventListener('click', function(e) {
    if(!knoxy.mouseDown && !knoxy.paused) {
        if(knoxy.kp) {
            knoxy.kp.knoxyParent.onClick(INTERSECTED);
        }
    }
    if(!knoxy.ui.contextMenu.hidden) {
        knoxy.ui.contextMenu.close();
    }
});


// -- Right Click
document.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('mousedown', function(e) {
    if(e.button === 2) {
        e.preventDefault();
        if(!knoxy.mouseDown) {
            if(knoxy.kp) {
                try {
                    knoxy.kp.knoxyParent.onRightClick(INTERSECTED);
                } catch(err) {}
            }
        }
        if(!knoxy.ui.contextMenu.hidden) {
            knoxy.ui.contextMenu.close();
        }
    }
});


// -- Window resized
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    knoxy.ui.contextMenu.close();
    animate();
}



function findPointerIntersections(check) {
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( knoxy.intersectables, false );
    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {
            INTERSECTED = intersects[ 0 ].object;
            if(INTERSECTED.knoxyParent) {
                //console.log(INTERSECTED.knoxyParent);
                if(knoxy.kp) {
                    if(knoxy.kp !== INTERSECTED) {
                        try {
                            knoxy.kp.knoxyParent.onMouseout();
                        } catch(e) {
                            console.error(e);
                            console.log('failed main', knoxy.kp);
                            knoxy.kp = null;
                        }
                        
                    }
                }
                INTERSECTED.knoxyParent.onMouseover(INTERSECTED);
                knoxy.kp = INTERSECTED;
                
            } else {
                //console.log(INTERSECTED.name);
                if(knoxy.kp) {
                    try {
                        knoxy.kp.knoxyParent.onMouseout();
                    } catch(e) {
                        console.error(e);
                        console.log('failed high', knoxy.kp);
                    }
                    knoxy.kp = null;
                }
            }
        } else {
            if(check) {
                if(knoxy.kp) {
                    if(knoxy.kp !== INTERSECTED) {
                        try {
                            knoxy.kp.knoxyParent.onMouseout();
                        } catch(e) {
                            console.error(e);
                            knoxy.kp = null;
                        }
                        
                    }
                }
                if(INTERSECTED.knoxyParent) {
                    try {
                        INTERSECTED.knoxyParent.onMouseover(INTERSECTED);
                        knoxy.kp = INTERSECTED;
                    } catch(e) {
                        console.error(e);
                        knoxy.kp = null;
                    }
                    
                }
            }
        }
    } else {
        if (INTERSECTED) {
            if(INTERSECTED.knoxyParent) {
                try {
                    INTERSECTED.knoxyParent.onMouseout();
                } catch(e) {
                    console.error(e);
                    console.log('INTERSECTED', INTERSECTED);
                }
                
            }
            if(knoxy.kp) {
                try {
                    knoxy.kp.knoxyParent.onMouseout();
                    knoxy.kp = null;
                } catch(e) {
                    console.error(e);
                    console.log('failed low', knoxy.kp);
                }
                
            }
            INTERSECTED = null;
        }
    }
}
knoxy.updateMouseover = findPointerIntersections;

function render() {
    try {
        if(knoxy.animating.length > 0 || knoxy.tweening) {
            requestAnimationFrame( render );
        }
        updateAnimated();
        controls.update();
        if(knoxy.tweening) TWEEN.update();
        knoxy.renderScenes();
        renderer.render( scene, camera );
    } catch(e) {
        console.error('render', e);
    }
};

function animate(forceIt) {
    if(!knoxy.animating.length) {
        render();
    } else if(forceIt) {
        render();
    }
}
knoxy.callAnimate = animate;

function updateAnimated() {
    for(let i=0; i<knoxy.animated.length; i++) {
        knoxy.animated[i].updateAnimations();
    }
}
engine = knoxy;
window.Knoxy = knoxy;