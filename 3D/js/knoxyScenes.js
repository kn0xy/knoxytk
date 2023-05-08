import * as THREE from './three.module.js';
import { AideeDesk } from './class.aideeDesk.js';
import { Lamp } from './class.lamp.js';
import { LGMonitor } from './class.lgMonitor.js';
import { TippyDesk } from './class.tippyDesk.js';
import { AcerMonitor } from './class.acerMonitor.js';
import { OfficeChair } from './class.officeChair.js';
import { PCTower } from './class.pcTower.js';
import { Ender3v2 } from './class.ender3v2.js';

function SceneX(knoxy) {
    // create scene
    const scene = new THREE.Scene();
    //scene.background = new THREE.Color().setHSL( 0.6, 1, 0.5 );
    scene.background = new THREE.Color( 0x04328f );
    knoxy.scene = scene;

    // add lights
    const light = new THREE.AmbientLight( 0xFFFFFF, 1);
    const plight = new THREE.PointLight( 0xFFFFFF, 1 );
    plight.position.set(-2, 5, 3);
    scene.add( plight );
    scene.add( light );

    // add floor
    knoxy.loader.load('models/floor.glb', function(gltf) {
        const fm = gltf.scene.children[0];
        fm.scale.set(3.25, 1, 3.1);
        fm.position.set(-1.4, 0, 2);
        fm.rotateY(THREE.MathUtils.degToRad(90));

        // fm.rotateZ(THREE.MathUtils.degToRad(90));
        // fm.scale.set(3.25, 1.5, 2);
        // fm.position.set(-4.45, 1.992, 2);

        //fm.receiveShadow = true;
        scene.add(fm);
    });


    // load models
    // ******************************************
    // ******************************************

    // Initialize 3D Printer
    const ender3v2 = new Ender3v2(knoxy, (model) => {
        model.position.set(-1.8, 1.388, -0.455);
        scene.add(model);
        ender3v2.onClick = function() {
            if(knoxy.view !== 'ender3v2') {
                let target = knoxy.ui.getCmhCoordsFor('ender3v2').cam;
                let distance = parseInt(knoxy.camera.position.distanceTo(target));
                if(distance > 2) {
                    let time = distance * 400 || 500;
                    knoxy.ui.moveCameraTo('ender3v2', time);
                } else {
                    this.PowerOn((this.power==='OFF' ? true : false));
                }
            } else {
                this.PowerOn((this.power==='OFF' ? true : false));
            }
        }
    });

    // Initialize Right Desk
    const tippyDesk = new TippyDesk(knoxy, (model) => {
        model.rotation.set(0, -1.5708, 0);
        model.position.set(-1.011, 0, -0.9);
        scene.add(model);
        tippyDesk.onClick = function(obj) {
            if(obj.name === 'KB_Tray') {
                if(tippyDesk.isTrayOut()) {
                    // tray coming in
                    if(knoxy.view === 'tippyDesk') {
                        knoxy.ui.moveCameraTo('chairOut', 1500, function() {
                            setTimeout(function() {
                                if(knoxy.officeChair.state==='IN') {
                                    knoxy.officeChair.toggleSlide();
                                }
                            }, 500);
                        });
                    }
                } else {
                    // tray coming out
                    setTimeout(function() {
                        if(knoxy.officeChair.state==='OUT') {
                            knoxy.officeChair.toggleSlide();
                        }
                    }, 500);
                }
                this.toggleTray();
                if(tippyDesk.isTrayOut() && knoxy.officeChair.state==='IN') return;
            }
            let kv = knoxy.view;
            if(kv !== 'tippyDesk') {
                knoxy.ui.moveCameraTo('tippyDesk', (kv==='mon1'||kv==='mon2' ? 750 : 2000));
            }
        }
    });
    knoxy.tippyDesk = tippyDesk;

    function kbAttach(model) {
        try {
            const kbTray = knoxy.scene.getObjectByName('KeyboardTray');
            if(kbTray) {
                kbTray.attach(model);
            } else {
                setTimeout(function() {
                    kbAttach(model);
                }, 500);
            }
        } catch(e) {
            console.error(e);
        }
    }

    // Load keyboard
    knoxy.loader.load('models/keyboard5.glb', function(gltf) {
        const kbModel = gltf.scene.children[0];
        kbModel.scale.set(0.4, 0.4, 0.4);
        kbModel.position.set(-0.415, 1.249, 0.064);
        scene.add(kbModel);
        kbAttach(kbModel);
    });

    // Load mouse
    knoxy.loader.load('models/mouse2.glb', function(gltf) {
        const kbTray = knoxy.scene.getObjectByName('KeyboardTray');
        const mouse = gltf.scene.children[0];
        //console.log('mouse', mouse);
        mouse.scale.set(0.0005, 0.0005, 0.0005);
        mouse.position.set(0.3, 1.275, 0.064);
        mouse.rotation.set(0, 3.14159265, -0.0872665);
        mouse.children[2].material.transparent = true;
        scene.add(mouse);
        kbAttach(mouse);
    });

    // Load speakers
    knoxy.loader.load('models/speaker2.glb', function(gltf) {
        // left speaker
        const speaker = gltf.scene.children[0];
        speaker.scale.set(7, 7, 7);
        speaker.position.set(-0.884, 1.448, -0.35);
        speaker.rotateY(0.349066);
        
        // make speaker screen translucent
        const spkrScrn = speaker.getObjectByName('Screen');
        spkrScrn.material.transparent = true;
        spkrScrn.material.opacity = 0.65;
        scene.add(speaker);
        
        // right speaker
        const speaker2 = speaker.clone();
        speaker2.position.set(0.6, 1.448, -0.35);
        speaker2.rotateY(-0.698132);
        scene.add(speaker2);
    });

    // Load PC Tower
    const pcTower = new PCTower(knoxy, (model) => {
        model.position.set(1.101, 0.077, -0.386);
        model.rotateY(-1.57079633);
        scene.add(model);
        pcTower.onClick = function() {
            if(knoxy.view !== 'PC') {
                knoxy.ui.moveCameraTo('PC');
            }
        }
    });

    // Initialize Office Chair
    const officeChair = new OfficeChair(knoxy, (model) => {
        model.position.set(-0.309, 0.1125, 0.75);
        model.rotation.set(-3.14159265, 0, -3.14159265);
        scene.add(model);
        officeChair.fixAnims();
        officeChair.onClick = function() {
            let isOut = (this.state==='OUT');
            if(!isOut) {
                // coming out, push in kb tray
                knoxy.ui.moveCameraTo('chairOut', 1000);
                if(knoxy.tippyDesk.isTrayOut()) {
                    knoxy.tippyDesk.toggleTray();
                }
            } else {
                // we goin in
                if(knoxy.view === 'chairOut') {
                    setTimeout(function() {
                        if(!knoxy.tippyDesk.isTrayOut()) knoxy.tippyDesk.toggleTray();
                    }, 1000);
                    knoxy.ui.moveCameraTo('tippyDesk');
                }
            }
            this.toggleSlide();
        }
    });
    knoxy.officeChair = officeChair;

    // Initialize Left Desk
    const aideeDesk = new AideeDesk(knoxy, (model) => {
        model.position.set(-4, 0, 0);
        scene.add( model );

        // Load desk chair
        knoxy.loader.load('models/aideeDeskChair2.glb', function(gltf) {
            const adc = gltf.scene.children[0];
            adc.scale.set(20, 20, 20);
            adc.position.set(-3.01, 0, 0.25);
            scene.add(adc);
            aideeDesk.setChairTextures(adc);
        });
    });



    // Initialize Lamp
    const lamp = new Lamp(knoxy, (model) => {
        model.position.set(-3.77, 1.47, -0.79);
        model.rotateY(0.69132492);
        scene.add(model);
        setTimeout(function() { lamp.PowerOn(true) }, 500);
        setTimeout(function() { lamp.PowerOn(false) }, 1000);
    });

    
    // Initialize LG Monitor
    const monitor = new LGMonitor(knoxy, (model) => {
        model.position.set(-0.3, 2.111, -0.63);
        scene.add(model);
        monitor.screenLight.position.set(-0.31, 2.216, -0.62);
        monitor.screenLight.visible = true;
        knoxy.cssScene = monitor.initDisplay();
        scene.monitor1 = monitor;
        monitor.onClick = function() {
            console.log('monclicked');
            let kv = knoxy.view;
            if(kv !== 'mon1' && kv !== 'mon1zoom') {
                let dur = (kv==='mon2' || kv==='tippyDesk' ? 750 : 2000);
                knoxy.ui.moveCameraTo('mon1', dur);
            } else {
                if(kv === 'mon1') {
                    knoxy.ui.moveCameraTo('mon1zoom', 500);
                } else {
                    knoxy.ui.moveCameraTo('mon1', 500);
                }
            }
        }
    });

    // Initialize Acer Monitor
    const mon2 = new AcerMonitor(knoxy, (model) => {
        model.position.set(0.509, 1.693, -0.812);
        scene.add(model);
        knoxy.cssScene2 = mon2.initDisplay();
        scene.monitor2 = mon2;
        setTimeout(knoxy.callAnimate, 100);
        mon2.onClick = function() {
            if(knoxy.view === 'mon2') {
                if(this.power === 'OFF') {
                    this.PowerOn(true);
                } else {
                    this.PowerOn(false);
                }
            } else {
                knoxy.ui.moveCameraTo('mon2', (knoxy.view==='mon1' ? 750 : 2000));
            }
        }
        mon2.clickEvents = initClickHandlersM2(knoxy);
    });

    initCameraToggles(knoxy);
    return scene;
}

function initCameraToggles(knoxy) {
    knoxy.ui.cmh = [
        {
            key: 'mon1',
            cam: new THREE.Vector3(-0.4036609339861916, 2.6182838687775716, 1.6773790144749245),
            tar: new THREE.Vector3(-0.34873606375886285, 2.3885330423379787, 0.7296839994928066)
        },
        {
            key: 'mon1zoom',
            cam: new THREE.Vector3(-0.29573856644784124, 2.2505756564752897, 0.33324486463263425),
            tar: new THREE.Vector3(-0.3004068190873301, 2.1740293739558565, -0.7461563158601208)
        },
        {
            key: 'mon2',
            cam: new THREE.Vector3(-0.5531947700514132, 2.503462339671851, 1.3419132327237846),
            tar: new THREE.Vector3(-0.1457542754700358, 2.3815007982089242, 0.7171976400369243)
        },
        {
            key: 'mon2zoom',
            cam: new THREE.Vector3(0.04548853380086276, 2.354154206493859, 0.7129483425836094),
            tar: new THREE.Vector3(0.3144272268077687, 2.308319492850956, 0.12522364191978907)
        },
        {
            key: 'overview',
            cam: new THREE.Vector3(-5.126550801991063, 6.384457929773648, 5.605919495347731),
            tar: new THREE.Vector3(-0.40819038449883044, 2.3273198214574022, 0.5783251063093102)
        },
        {
            key: 'tippyDesk',
            cam: new THREE.Vector3(-1.507709594446675, 2.621378651802916, 1.9589088214376014),
            tar: new THREE.Vector3(-0.3205883095099327, 1.8600829955915132, -0.0553254259872856)
        },
        {
            key: 'chairOut',
            cam: new THREE.Vector3(-4.893127062041322, 1.7077027743285658, 1.978666242337409),
            tar: new THREE.Vector3(-1.2865348656331865, 1.439727767814559, 1.1677636474197202)
        },
        {
            key: 'PC',
            cam: new THREE.Vector3(2.9467985487561514, 1.3334936357206137, 1.6601909760944724),
            tar: new THREE.Vector3(0.6411900948943258, 0.40490344524389055, -0.8336865110677918)
        },
        {
            key: 'ender3v2',
            cam: new THREE.Vector3(-2.2965855467777767, 2.7031978321759578, 1.5404571687822501),
            tar: new THREE.Vector3(-1.491321676367159, 1.4370050953195042, -0.9035094304172777)
        }
    ];
    let toggled = false;
    knoxy.controls.addEventListener('change', function() {
        if(!toggled && !knoxy.mouseDown) {
            if(knoxy.ui.camView && !knoxy.tweening) {
                if(knoxy.ui.camView === 'tippyDesk') {
                    if(knoxy.camera.position.z >= 2) {
                        toggled = true;
                        setTimeout(function() { toggled = false }, 250);
                        knoxy.ui.moveCameraTo('overview', 1250);
                    }
                }
                if(knoxy.ui.camView === 'mon1') {
                    if(!knoxy.tweening && knoxy.camera.position.z >= 1.7) {
                        toggled = true;
                        setTimeout(function() { toggled = false }, 250);
                        knoxy.ui.moveCameraTo('tippyDesk', 500);
                    }
                }
                if(knoxy.ui.camView === 'mon2') {
                    toggled = true;
                    setTimeout(function() { toggled = false }, 500);
                    if(knoxy.camera.position.z >= 1.35) {
                        knoxy.ui.moveCameraTo('tippyDesk', 500);
                    } else {
                        knoxy.ui.moveCameraTo('mon2zoom', 500, () => {
                            knoxy.ui.panel.fadeOut();
                        });
                    }
                }
                if(knoxy.ui.camView === 'mon2zoom') {
                    toggled = true;
                    setTimeout(function() { toggled = false }, 500);
                    if(knoxy.camera.position.z >= 0.72) {
                        knoxy.ui.moveCameraTo('mon2', 500, () => {
                            // knoxy.ui.panel.fadeIn();
                        });
                    }
                }
                if(knoxy.ui.camView === 'chairOut') {
                    toggled = true;
                    setTimeout(function() { toggled = false }, 500);
                    if(knoxy.camera.position.x < -5) {
                        // zoomed out, go to overview
                        knoxy.ui.moveCameraTo('overview', 500);
                        if(knoxy.officeChair.state === 'OUT') knoxy.officeChair.toggleSlide();
                    } else if(knoxy.camera.position.x > -4.7) {
                        // zoomed in, go to tippyDesk
                        knoxy.ui.moveCameraTo('tippyDesk', null, function() {
                            // toggle kb tray after 1 sec if not slid out
                            setTimeout(function() {
                                if(!knoxy.tippyDesk.isTrayOut()) knoxy.tippyDesk.toggleTray();
                            }, 1000);
                        });
                        if(knoxy.officeChair.state === 'OUT') knoxy.officeChair.toggleSlide();
                    }
                }
                knoxy.ui.camView = false;
                if(knoxy.ui.panel.isHidden) {
                    knoxy.ui.panel.fadeIn();
                }
            }
        }
    });
}

function initClickHandlersM2(knoxy) {
    const events = [
        {
            'id': 'btnNewTab',
            'cb': () => {
                console.log('btnNewTab clicked');
            }
        }
    ];
    return events;
}

export { SceneX }
    