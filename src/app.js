import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sign } from './sign.js';
import './style.css'; // Import the CSS file

export class App {
    constructor() {
        this.dom = document.createElement('div');
        this.dom.id = 'app';

        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createSign();
        this.createBackground();
        this.createControls3D();
        this.createControls();

        this.animate();
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'controls';

        const controlsDivLeft = document.createElement('div');
        controlsDivLeft.id = 'controlsDivLeft';
        const controlsDivCenter = document.createElement('div');
        controlsDivCenter.id = 'controlsDivCenter';
        const controlsDivRight = document.createElement('div');
        controlsDivRight.id = 'controlsDivRight';
        controlsDiv.appendChild(controlsDivLeft);
        controlsDiv.appendChild(controlsDivCenter);
        controlsDiv.appendChild(controlsDivRight);

        const controlsDivTexture = document.createElement('div');
        controlsDivTexture.id = 'controlsDivTexture';
        controlsDivLeft.appendChild(controlsDivTexture);
        const woodTextures = [
            { name: 'oak', image: 'buttons/sign_oak.webp' },
            { name: 'dark', image: 'buttons/sign_dark.webp' },
            { name: 'acacia', image: 'buttons/sign_acacia.png' }
        ];
        woodTextures.forEach((texture) => {
            const button = document.createElement('button');
            button.classList.add('texture-button');
            button.style.backgroundImage = `url(${texture.image})`;
            button.addEventListener('click', () => {
                this.sign.updateWoodTexture(texture.name);
                this.playSound('sounds/wood.ogg');
                this.selectButton(controlsDivTexture, button);
            });

            if (texture.name == 'oak') {
                button.classList.add('selected');
            }

            controlsDivTexture.appendChild(button);
        });

        const controlsDivBackground = document.createElement('div');
        controlsDivBackground.id = 'controlsDivBackground';
        controlsDivLeft.appendChild(controlsDivBackground);
        const backgrounds = ['white', 'in game', 'gradient'];
        backgrounds.forEach((bg) => {
            const button = document.createElement('button');
            button.textContent = `${bg} background`;
            button.classList.add('background-button');
            button.addEventListener('click', () => {
                this.updateBackground(bg);
                this.selectButton(controlsDivBackground, button);
            });

            if (bg == 'white') {
                button.classList.add('selected');
            }

            controlsDivBackground.appendChild(button);
        });

        const controlsDivTxt = document.createElement('div');
        controlsDivTxt.id = 'controlsDivTxt';
        controlsDivCenter.appendChild(controlsDivTxt);
        const textInputs = [];
        for (let i = 0; i < 4; i++) {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.placeholder = `Enter text for line ${i + 1}`;
            textInput.classList.add('text-input');
            textInput.maxLength = 14; // Set max length to 14 characters
            textInput.addEventListener('input', (event) => {
                const texts = textInputs.map(input => input.value);
                this.sign.updateText(texts);
                this.playSound('sounds/text.mp3');
            });
            controlsDivTxt.appendChild(textInput);
            textInputs.push(textInput);
        }

        const controlsDivPole = document.createElement('div');
        controlsDivPole.id = 'controlsDivPole';
        controlsDivRight.appendChild(controlsDivPole);
        const poleButton = document.createElement('button');
        poleButton.textContent = 'Toggle Pole';
        poleButton.classList.add('pole-button');
        poleButton.addEventListener('click', () => {
            this.sign.togglePole();
            this.playSound('sounds/wood.ogg');
            this.selectButton(controlsDivPole, poleButton);
        });
        controlsDivPole.appendChild(poleButton);

        const controlsDivSize = document.createElement('div');
        controlsDivSize.id = 'controlsDivSize';
        controlsDivRight.appendChild(controlsDivSize);
        const sizes = [
            { name: 'small', image: 'buttons/sign_standard.png', label: '24x12 cm', width: '80px' },
            { name: 'medium', image: 'buttons/sign_standard.png', label: '36x18 cm', width: '100px' },
            { name: 'large', image: 'buttons/sign_standard.png', label: '56x28 cm', width: '120px' }
        ];
        sizes.forEach((size) => {
            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('button-container');
            controlsDivSize.appendChild(buttonDiv);
            const button = document.createElement('button');
            button.classList.add('size-button');
            button.style.backgroundImage = `url(${size.image})`;
            button.style.width = size.width;
            button.addEventListener('click', () => {
                this.sign.updateSize(size.name);
                this.playSound('sounds/wood.ogg');
                this.selectButton(controlsDivSize, button);
            });

            if (size.name == 'medium') {
                button.classList.add('selected');
            }

            buttonDiv.appendChild(button);

            const sizeName = document.createElement('div');
            sizeName.classList.add('size-name');
            sizeName.textContent = size.name;
            buttonDiv.appendChild(sizeName);
            const label = document.createElement('div');
            label.classList.add('size-label');
            label.textContent = size.label;
            buttonDiv.appendChild(label);
        });

        this.dom.appendChild(controlsDiv);
    }

    selectButton(root, button) {
        const buttons = root.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    }

    playSound(src) {
        const audio = new Audio(src);
        audio.play();
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Ensure correct color rendering
        this.dom.appendChild(this.renderer.domElement);
    }


    createSign() {
        this.sign = new Sign();
        this.scene.add(this.sign.mesh);
    }

    createBackground() {
        this.updateBackground('white');
    }

    updateBackground(bg) {
        if (this.background) {
            this.scene.remove(this.background);
        }

        switch (bg) {
            case 'white':
                this.scene.background = new THREE.Color(0xffffff);
                break;
            case 'in game':
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load('/backgrounds/minecraft_blurred.png', (texture) => {
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.repeat.set(1, 1);
                    this.scene.background = texture;
                });
                break;
            case 'gradient':
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const context = canvas.getContext('2d');

                const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
                gradient.addColorStop(0.08, 'rgba(238, 211, 174, 1)');
                gradient.addColorStop(1, 'rgba(148, 233, 200, 1)');

                context.fillStyle = gradient;
                context.fillRect(0, 0, 512, 512);

                this.scene.background = new THREE.CanvasTexture(canvas);
                break;
        }
    }

    createControls3D() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.maxPolarAngle = Math.PI / 1.5;
        this.controls.minAzimuthAngle = -Math.PI / 4;
        this.controls.maxAzimuthAngle = Math.PI / 2;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        const w = window.innerWidth / 100 * 100
        const h = window.innerHeight / 100 * 75
        this.renderer.setSize(w, h);
        this.renderer.render(this.scene, this.camera);
    }
}
