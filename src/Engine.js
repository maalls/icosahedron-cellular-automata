
import * as THREE from "three";

import { CellularAutomata } from "./CellularAutomata";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export class Engine {
    constructor() {
        this.isPlaying = false;
        this.parentDomElement = document.body;
    }
    setImplementation(implementation) {
        this.implementation = implementation;
    }
    setParentDomElement(domElement) {
        this.parentDomElement = domElement;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    play() {
        this.isPlaying = true;
    }
    pause() {
        this.isPlaying = false;
    }
    start() {

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x404040);
        this.renderer.setSize(innerWidth, innerHeight);
        this.parentDomElement.appendChild(this.renderer.domElement);
        let impl = this.implementation;

        const n = impl.n;

        this.g = new THREE.IcosahedronGeometry(5, n);
        this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
        this.camera.position.set(0, 10, 10);

        let controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 6;

        this.scene = new THREE.Scene();
        this.m = new THREE.MeshBasicMaterial({ vertexColors: true });
        let o = new THREE.Mesh(this.g, this.m);
        this.scene.add(o);
        this.reset();
        this.renderer.setAnimationLoop(_ => {
            this.renderer.render(this.scene, this.camera);
        })
        

        this.undos = [];
        this.undoPosition = 0;
        this.undoSize = 30;
        this.undoMax = 0;



        var fpsInterval, startTime, now, then, elapsed;

        


        const animate = (t) => {
            //console.log("u");

            requestAnimationFrame(animate);

            now = Date.now();
            elapsed = now - then;

            // if enough time has elapsed, draw the next frame
            fpsInterval = 1000 / impl.fps;
            if (elapsed > fpsInterval) {

                // Get ready for next frame by setting then=now, but also adjust for your
                // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
                then = now - (elapsed % fpsInterval);

                // Put your drawing code here
                if (this.isPlaying) this.update();
            }

        }

        fpsInterval = 1000 / impl.fps;
        then = Date.now();
        startTime = then;
        animate();


        this.mousedownStart = null;

        window.addEventListener("mousedown", () => {
            const d = new Date();
            this.mousedownStart = d.getTime();
        }, false);
        window.addEventListener("click", e => this.onClick(e), false);

        window.addEventListener("resize", event => {

            this.renderer.setSize(innerWidth, innerHeight);
            this.camera.aspect = innerWidth / innerHeight;
            this.camera.updateProjectionMatrix();


        }, false);
    }

    reset() {

        this.ca = new CellularAutomata(this.implementation.n);
        this.clear();
        //console.log('colors', this.ca.colors);
        this.implementation.init(this.ca);
        this.applyColors();

    }

    clear() {

        for (let i = 1; i <= this.ca.faceCount; i++) {
            this.ca.setColorRGB(i, 0, 0, 0);
        }
        
    }

    update() {

        let impl = this.implementation;
        if (impl.before != undefined) {
            impl.before();
        }

        if (impl.loop != undefined) {
            impl.loop(this.ca);
        }
        else {
            for (let i = 1; i <= this.ca.faceCount; i++) {
                impl.update(this.ca, i);
            }
        }
        this.undos[this.undoPosition] = this.ca.colors;
        this.undoPosition = (this.undoPosition + 1) % this.undoSize;
        this.undoMax = Math.min(this.undoMax+1, this.undoSize);
        this.applyColors();

    }

    applyColors() {

        this.ca.applyColors();
        //console.log("applying colors", this.ca.colors, this.ca.colors.length/9);
        this.g.setAttribute("color", new THREE.Float32BufferAttribute(this.ca.colors, 3));
        this.m.needsUpdate = true;

    }

    undo() {
        
        if (this.undoMax == 0) return;
        this.undoPosition = (this.undoSize + this.undoPosition - 1) % this.undoSize;
        this.ca.setColors(this.undos[this.undoPosition]);
        this.applyColors();
        this.undoMax--;

    }

    onClick(event) {

        event.preventDefault();
        const d = new Date();
        //console.log(mousedownStart, d.getTime(), d.getTime() - mousedownStart);
        if (d.getTime() - this.mousedownStart > 300) return;
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / this.renderer.domElement.offsetWidth) * 2 - 1;
        mouse.y = -(event.clientY / this.renderer.domElement.offsetHeight) * 2 + 1;
        const caster = new THREE.Raycaster();
        caster.setFromCamera(mouse, this.camera);
        const intersects = caster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const face = intersection.face;
            const i = (face.a) / 3 + 1;
            if (this.implementation.onClick != undefined) {
                this.ca.setColors(this.ca.colors);
                this.implementation.onClick(this.ca, i);
                this.applyColors();
            }
            else {
                console.log(i, 'col', this.ca.getColor(i), this.ca.getNeigbors(i), this.ca.getNeigborCount(i));
            }
        }

    }
}

