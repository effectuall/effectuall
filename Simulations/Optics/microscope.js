import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as TWEEN from '@tweenjs/tween.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// //global variables
let camera, scene,  controls;
let fov, model;
let labelRenderer;
let  renderer;
let INTERSECTED;
let meshObjects = [];
let labels = [];
let rayObjects = [];
const parts = {
	"Eyepiece": [
		"Eyepiece (ocular lens)",
		"It's a cylinder containing two or more lenses; its function is to bring the image into focus for the eye. "	
	],

	"Coarse_knob": [
		"Coarse Knob",
		"Adjustment knobs move the stage up and down with separate adjustment for coarse and fine focusing. The same controls enable the microscope to adjust to specimens of different thickness. "
	],

	"Objective_lens": [
		"Objective Lens",
		"The set of objective lenses are part of the Objective turret, revolver, or revolving nose piece. Microscope objectives are characterized by two parameters, namely, magnification and numerical aperture. The former typically ranges from 5× to 100× while the latter ranges from 0.14 to 0.7, corresponding to focal lengths of about 40 to 2 mm, respectively."
	],

	"Light_source": [
		"Light Source",
		"Many sources of light can be used. At its simplest, daylight is directed via a mirror. Most microscopes, however, have their own adjustable and controllable light source."
	],

	"Focus_stop": [
		"Focus Stop",
		"Focus stop for the objective lenses movement."
	],

	"Condenser": [
		"Condenser",
		"The condenser is a lens designed to focus light from the illumination source onto the sample. The condenser may also include other features, such as a diaphragm and/or filters, to manage the quality and intensity of the illumination."
	],

	"Sample_stage": [
		"Sample Stage",
		"The stage is a platform below the objective lens which supports the specimen being viewed. In the center of the stage is a hole through which light passes to illuminate the specimen. The stage usually has arms to hold slides."
	],

	"Fine_knob": [
		"Fine Knob",
		"Adjustment knobs move the stage up and down with separate adjustment for coarse and fine focusing. The same controls enable the microscope to adjust to specimens of different thickness."
	],
	
	"Frame": [
		"Frame",
		"The whole of the optical assembly is traditionally attached to a rigid arm, which in turn is attached to a robust U-shaped foot to provide the necessary rigidity. The arm angle may be adjustable to allow the viewing angle to be adjusted. The frame provides a mounting point for various microscope controls. "
	]
};
let labelDisplay = false;
let iRay = true;
let raycaster;
let mouse = new THREE.Vector2();
const partEl = document.getElementById("part");
const describeEl = document.getElementById("describe");
const buttonLabels = document.getElementById("labels");
const buttonRays = document.getElementById("rays");

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);
    createCamera(45, -50, 10, 30, new THREE.Vector3(0, 20, 0));

    createLights();
    createRenderer();
    createControls(5, 20, -4.5);

    const loader = new GLTFLoader();
    loader
        .setPath('../model/')
        .load('microscope.glb', function (gltf) {
            model = gltf.scene;
            for (let i = 0; i < model.children.length; i++) {
                if (model.children[i].type != 'Object3D') {
                    meshObjects.push(model.children[i])
                }
            }
            // console.log( meshObjects )
            let objective = model.getObjectByName('objective');
            let eyepiece = model.getObjectByName('eyepiece');

            let spriteEye = addLabels('Eyepiece');
            let spriteObj = addLabels('Objective Lenses');

            eyepiece.add(spriteEye);
            labels.push(spriteEye);
            objective.add(spriteObj);
            labels.push(spriteObj);

            let stage = model.getObjectByName('stage');
            let coarse = model.getObjectByName('coarse');

            // let spriteStage = roundLabel('3');           
            // let spriteCoarse = roundLabel('4');
            let spriteStage = addLabels('Sample Stage');
            let spriteCoarse = addLabels('Coarse Adjustment');
            stage.add(spriteStage);
            labels.push(spriteStage);
            coarse.add(spriteCoarse);
            labels.push(spriteCoarse);

            let fine = model.getObjectByName('fine');
            let light = model.getObjectByName('light');

            let spriteFine = addLabels('Fine Adjustment');
            let spriteLight = addLabels('Light Source');

            fine.add(spriteFine);
            labels.push(spriteFine);
            light.add(spriteLight);
            labels.push(spriteLight);

            let diaphragm = model.getObjectByName('diaphragm');
            let spriteDiaphragm = addLabels('Condenser/Diaphragm');

            diaphragm.add(spriteDiaphragm);
            labels.push(spriteDiaphragm);
            scene.add(model);
            labelsAction();
            rayAction()
        });


    buttonControls();
    
    const scaleHorizontal = new THREE.GridHelper(70, 70);
    scene.add(scaleHorizontal);
    raycaster = new THREE.Raycaster();
    document.addEventListener('click', clickAction);
    window.addEventListener('resize', onWindowResize);

}

function labelsAction() {
    if (!labelDisplay) {
        for (let i = 0; i < labels.length; i++) {
            labels[i].visible = false;
            partEl.innerHTML = 'Compound Microscope';
            describeEl.innerHTML = 'An optical system with multiple lenses: <br><br>The objective lens (typically 4x, 10x, 40x or 100x) and<br><br> The eyepiece lens (typically 10x) to obtain a high magnification of 40x, 100x, 400x and 1000x. <br><br>Higher magnification is achieved by using two lenses rather than just a single magnifying lens';
        }
    } else {
        for (let i = 0; i < labels.length; i++) {
            labels[i].visible = true;
        }
    }
}

function clickAction(event) {
    // event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;


}

function createCamera(view, x, y, z, vector) {

    fov = view;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1500;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(x, y, z);
    camera.lookAt(vector)
    // camera.position.set(-10, 3, 40);
}

function createLights() {
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 2);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(ambientLight);

    mainLight.position.set(10, 10, 10);

    scene.add(ambientLight, mainLight);
}

function createRenderer() {
    const root = document.getElementById("app");
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.alpha = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    root.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    root.appendChild(labelRenderer.domElement);

}

function createControls(x, y, z) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.target.set(x, y, z);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    
}


function addLabels(name) {

    let text = document.createElement('div');
    text.className = 'label';
    text.textContent = name;

    let label = new CSS2DObject(text);
    return label
}

function animate() {

    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    render();
}

function render() {
    // camera.updateMatrixWorld();
    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(meshObjects);

    if (intersects.length > 0) {

        INTERSECTED = intersects[0].object;
        let a = INTERSECTED.parent.name;
        // console.log(parts[a], INTERSECTED.parent.name)
        if (a in parts && !iRay) {

            partEl.innerHTML = parts[a][0];
            describeEl.innerHTML = parts[a][1];
        } else if (iRay) {
            partEl.innerHTML = 'Ray Diagram';
            describeEl.innerHTML = '1 - Object (Specimen); <br> 2 - Objective Lens;<br> 3 -  Eyepiece Lens;<br>   4 - Intermediate Image;<br> 5 - Final Inverted Image';

        } else {
            // partEl.innerHTML = parts['Frame'][0];
            // describeEl.innerHTML = parts['Frame'][1];  
            partEl.innerHTML = 'Compound Microscope';
            describeEl.innerHTML = 'An optical system with multiple lenses: <br><br>The objective lens (typically 4x, 10x, 40x or 100x) and<br><br> The eyepiece lens (typically 10x) to obtain a high magnification of 40x, 100x, 400x and 1000x. <br><br>Higher magnification is achieved by using two lenses rather than just a single magnifying lens';
        }

    }
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function buttonControls() {
    buttonLabels.addEventListener('click', function () {
        labelDisplay = !labelDisplay;
        labelsAction();
    });
    buttonRays.addEventListener('click', function () {
        iRay = !iRay
        rayAction();
    });
}

function rayAction() {
    if (iRay) {
        // console.log('show Ray diagram')
        new TWEEN.Tween(model.position)
            .to({ x: -20, z: -20 }, 7500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start()

        new TWEEN.Tween(camera.position)
            .to({ x: -45, z: 60 }, 7500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start()
        createCamera(37, -45, 10, 60, new THREE.Vector3(-10, 18, 0));
        createControls(-10, 18, -4.5);
        for (let i = 0; i < rayObjects.length; i++) {
            rayObjects[i].visible = true;
        }
        partEl.innerHTML = 'Ray Diagram';
        describeEl.innerHTML = '1 - Object (Specimen); <br> 2 - Objective Lens;<br> 3 -  Eyepiece Lens;<br>   4 - Intermediate Image;<br> 5 - Final Inverted Image';
        buttonRays.innerHTML = 'HIDE RAY DIAGRAM';
        rayDiagram()
    } else {
        // console.log('hide Ray diagram')
        new TWEEN.Tween(model.position)
            .to({ x: 0, z: 0 }, 5500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start()
        new TWEEN.Tween(camera.position)
            .to({ x: -50, z: 30 }, 5500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start()
        createCamera(45, -50, 10, 30, new THREE.Vector3(0, 20, 0));
        createControls(5, 20, -4.5);
        for (let i = 0; i < rayObjects.length; i++) {
            rayObjects[i].visible = false;
        }
        partEl.innerHTML = 'Compound Microscope';
        describeEl.innerHTML = 'An optical system with multiple lenses: <br><br>The objective lens (typically 4x, 10x, 40x or 100x) and<br><br> The eyepiece lens (typically 10x) to obtain a high magnification of 40x, 100x, 400x and 1000x. <br><br>Higher magnification is achieved by using two lenses rather than just a single magnifying lens';
        buttonRays.innerHTML = 'SHOW RAY DIAGRAM';
    }

}

function rayDiagram() {
    let lensLoc = 0;
    let eye = 30
    let P1 = 18;
    let P2 = 24.2;
    let Ox = 1.5;
    let Oy = 15;
    let I1x = 2;
    let I1y = 23.1;
    let I2x = 7;
    let I2y = 10;

    let objective = addLens(3);
    objective.position.set(lensLoc, P1, 0);
    // let objLabel = addLabels('Objective Lens'); 
    let objLabel = addLabels('2');
    objLabel.position.set(0, P1 - 1, 0);
    labels.push(objLabel)
    scene.add(objective, objLabel);
    // scene.add(objective)
    // objective.add(objLabel)
    rayObjects.push(objective, objLabel);

    let eyepiece = objective.clone();
    eyepiece.position.set(lensLoc, P2, 0);
    // let eyeLabel = addLabels('Eyepiece Lens'); 
    let eyeLabel =addLabels('3');
    eyeLabel.position.set(0, P2+2, 0);
    scene.add(eyepiece, eyeLabel);
    labels.push(eyeLabel)
    rayObjects.push(eyepiece, eyeLabel);

    let opticalAxis = addRays(new THREE.Vector3(lensLoc, 0, 0), new THREE.Vector3(lensLoc, 50, 0), 'black')
    scene.add(opticalAxis);
    rayObjects.push(opticalAxis);

    let sample = addRays(new THREE.Vector3(lensLoc + Ox, Oy, 0), new THREE.Vector3(lensLoc, Oy, 0), 'blue')
    // let sampleLabel = addLabels('Object'); 
    let sampleLabel = addLabels('1');
    sampleLabel.position.set(0, Oy - 1.5, 0);
    scene.add(sample, sampleLabel);
    labels.push(sampleLabel)
    rayObjects.push(sample, sampleLabel);

    let sampleHead = shortarrowLine(lensLoc + Ox, Oy, 0, true, 'blue');
    //invert
    sampleHead.scale.set(-1, 1, 0);
    sampleHead.position.set(2 * Ox, 0, 0);
    scene.add(sampleHead);
    rayObjects.push(sampleHead);

    let incidentRay1 = addRays(new THREE.Vector3(lensLoc + Ox, Oy, 0), new THREE.Vector3(lensLoc + Ox, P1, 0), 'green')
    scene.add(incidentRay1);
    rayObjects.push(incidentRay1);

    let rayArrow1 = shortarrowLine(0, 0, 0, true, 'red');
    rayArrow1.rotation.set(0, 0, -1.57);
    rayArrow1.position.set(lensLoc + Ox, Oy + 2, 0);
    scene.add(rayArrow1);
    rayObjects.push(rayArrow1);

    let image = addRays(new THREE.Vector3(lensLoc - I1x, I1y, 0), new THREE.Vector3(lensLoc, I1y, 0), 'red')
    // let imageLabel = addLabels('Intermediate Image'); 
    let imageLabel =addLabels('4');
    imageLabel.position.set(0, I1y - 1, 0);
    scene.add(image, imageLabel);
    labels.push(imageLabel)
    rayObjects.push(image, imageLabel);

    let imageHead = shortarrowLine(lensLoc - I1x, I1y, 0, true, 'red');
    scene.add(imageHead);
    rayObjects.push(imageHead);

    let incidentRay2 = addRays(new THREE.Vector3(lensLoc + Ox, Oy, 0), new THREE.Vector3(lensLoc - I1x, I1y, 0), 'green')
    scene.add(incidentRay2);
    rayObjects.push(incidentRay2);

    let rayArrow2 = rayArrow1.clone();
    rayArrow2.rotation.set(0, 0, -1.2);
    rayArrow2.position.set(lensLoc + Ox - 0.85, Oy + 2, 0);
    scene.add(rayArrow2)
    rayObjects.push(rayArrow2);

    let incidentRay3 = addRays(new THREE.Vector3(lensLoc + Ox, P1, 0), new THREE.Vector3(lensLoc - I1x, I1y, 0), 'green')
    scene.add(incidentRay3);
    rayObjects.push(incidentRay3);

    let rayArrow3 = rayArrow1.clone();
    rayArrow3.rotation.set(0, 0, -0.9);
    rayArrow3.position.set(-0.64, I1y - 2, 0);
    scene.add(rayArrow3)
    rayObjects.push(rayArrow3);

    let rayArrow4 = rayArrow1.clone();
    rayArrow4.rotation.set(0, 0, -1.2);
    rayArrow4.position.set(-1.14, I1y - 2, 0);
    scene.add(rayArrow4);
    rayObjects.push(rayArrow4);

    let incidentRay4 = addRays(new THREE.Vector3(lensLoc - I1x, I1y, 0), new THREE.Vector3(lensLoc - I1x, P2, 0), 'green')
    scene.add(incidentRay4);
    rayObjects.push(incidentRay4);

    let rayArrow5 = rayArrow1.clone();
    rayArrow5.position.set(-lensLoc - I1x, I1y + .8, 0);
    scene.add(rayArrow5);
    rayObjects.push(rayArrow5);

    let incidentRay5 = addRays(new THREE.Vector3(lensLoc - I1x, I1y, 0), new THREE.Vector3(lensLoc + .5, eye - .3, 0), 'green')
    scene.add(incidentRay5);
    rayObjects.push(incidentRay5);

    let incidentRay6 = addRays(new THREE.Vector3(lensLoc - I1x, P2, 0), new THREE.Vector3(lensLoc, eye, 0), 'green')
    scene.add(incidentRay6);
    rayObjects.push(incidentRay6);

    let rayArrow6 = rayArrow1.clone();
    rayArrow6.rotation.set(0, 0, -2);
    rayArrow6.position.set(lensLoc - 0.81, P2 + 2, 0);
    scene.add(rayArrow6);
    rayObjects.push(rayArrow6);

    let rayArrow7 = rayArrow1.clone();
    rayArrow7.rotation.set(0, 0, -1.8);
    rayArrow7.position.set(lensLoc - 1.31, P2 + 2, 0);
    scene.add(rayArrow7);
    rayObjects.push(rayArrow7);

    let eyeIcon = eyeShow();
    eyeIcon.position.copy(new THREE.Vector3(lensLoc, eye, 0.3));
    scene.add(eyeIcon);
    rayObjects.push(eyeIcon);

    let image2 = addRays(new THREE.Vector3(lensLoc - I2x, I2y, 0), new THREE.Vector3(lensLoc, I2y, 0), 'brown')
    // let image2Label = addLabels('Final Image'); 
    let image2Label = addLabels('5');
    image2Label.position.set(0, I2y, 0);
    scene.add(image2, image2Label);
    labels.push(image2Label)
    rayObjects.push(image2, image2Label);

    let incidentRay7 = addRays(new THREE.Vector3(lensLoc - I2x, I2y, 0), new THREE.Vector3(lensLoc, eye, 0), 'grey')
    scene.add(incidentRay7);
    rayObjects.push(incidentRay7);

    let incidentRay8 = addRays(new THREE.Vector3(lensLoc - I2x, I2y, 0), new THREE.Vector3(lensLoc + .5, eye - .3, 0), 'grey')
    scene.add(incidentRay8);
    rayObjects.push(incidentRay8);

    let image2Head = shortarrowLine(lensLoc - I2x, I2y, 0, false, 'brown');
    scene.add(image2Head)
    rayObjects.push(image2Head);
    
}

function addLens(radius) {
    const lens = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 8),
        new THREE.MeshBasicMaterial({ color: 'orange', transparent: true, opacity: .8 })
    );
    // lens.rotation.set(1.57, 0,  0 )
    lens.scale.set(1, 0.15, 1);
    return lens
}

function eyeShow() {

    const map1 = new THREE.TextureLoader().load('./img/eyeIconUp.png');
    const material1 = new THREE.SpriteMaterial({ map: map1, color: 0xffffff });

    let eye = new THREE.Sprite(material1);
    eye.scale.set(2, 2, 2);
    return eye
}

function addRays(vector1, vector2, col) {
    let linepoints = [vector1, vector2];
    let lineMaterial = new THREE.LineBasicMaterial({ color: col });

    let lineGeometry = new THREE.BufferGeometry().setFromPoints(linepoints);
    let axis = new THREE.Line(lineGeometry, lineMaterial);

    return axis
}

function shortarrowLine(x, y, z, short, col) {
    if (short) {
        let point = new THREE.Vector3(x, y, z)
        let a = new THREE.Vector3(x + 0.5, y - 0.25, z + 0);
        let b = new THREE.Vector3(x + 0.5, y + 0.25, z + 0);


        let arrowpoints = [a, point, b];;
        let arrowMaterial = new THREE.LineBasicMaterial({ color: col });

        let arrowGeometry = new THREE.BufferGeometry().setFromPoints(arrowpoints);
        let arrow = new THREE.Line(arrowGeometry, arrowMaterial);
        return arrow;
    } else {
        let point = new THREE.Vector3(x, y, z)
        let a = new THREE.Vector3(x + 1, y - 0.5, z + 0);
        let b = new THREE.Vector3(x + 1, y + 0.5, z + 0);


        let arrowpoints = [a, point, b];;
        let arrowMaterial = new THREE.LineBasicMaterial({ color: col });

        let arrowGeometry = new THREE.BufferGeometry().setFromPoints(arrowpoints);
        let arrow = new THREE.Line(arrowGeometry, arrowMaterial);
        return arrow;
    }
}