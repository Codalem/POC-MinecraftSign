import * as THREE from 'three';

export class Sign {
    constructor() {
        this.mesh = new THREE.Group();
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.currentWoodTextureFile = 'wood_oak.webp';
        this.currentText = ['Hello !', 'How are you ?!', 'This is...', 'OUR BASE :D'];
        this.font = null;
        this.defaultScale = 2;
        this.size = 'medium';
        this.showPole = true;
        this.scaleFactor = 4; // Scale factor for the text

        this.loadFont("/fonts/minecraft_font.woff").then(() => {
            this.createSign();
        });
    }

    loadFont(url) {
        return new Promise((resolve, reject) => {
            const font = new FontFace("Minecraft", `url(${url})`, {
            });
            font.load().then(
                () => {
                    document.fonts.add(font);
                    this.font = font;
                    resolve();
                },
                (err) => {
                    console.error(err);
                    reject(err);
                }
            );
        });
    }

    createSign() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('/textures/' + this.currentWoodTextureFile, (woodTexture) => {
            this.woodTexture = woodTexture;

            // Set canvas size to be larger than the wood texture size for higher resolution
            this.canvas.width = woodTexture.image.width * this.scaleFactor;
            this.canvas.height = woodTexture.image.height * this.scaleFactor;
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw the wood texture onto the canvas
            this.context.drawImage(woodTexture.image, 0, 0, this.canvas.width, this.canvas.height);

            // Draw the text onto the canvas
            const fontSize = Math.min(this.canvas.width, this.canvas.height) * 0.025 * this.scaleFactor; // Adjust font size relative to canvas size
            this.context.font = `${fontSize + 10}px Minecraft`;
            this.context.textAlign = 'center';
            this.context.fillStyle = '#000000';

            const lineHeight = fontSize * 2;
            const startY = this.canvas.height / 2 - lineHeight - 30;

            this.currentText.forEach((text, index) => {
                this.context.fillText(text, this.canvas.width / 2, startY + index * lineHeight);
            });

            // Create a texture from the canvas
            const texture = new THREE.CanvasTexture(this.canvas);
            texture.minFilter = THREE.LinearFilter; // Ensure linear filtering for sharpness
            texture.magFilter = THREE.LinearFilter;
            const material = new THREE.MeshBasicMaterial({ map: texture });

            const signGeometry = new THREE.BoxGeometry(2, 0.2, 1);
            this.signMesh = new THREE.Mesh(signGeometry, [
                new THREE.MeshBasicMaterial({ map: woodTexture }), // Top face
                new THREE.MeshBasicMaterial({ map: woodTexture }), // Back face
                new THREE.MeshBasicMaterial({ map: woodTexture }), // Top face
                material, // Front face
                new THREE.MeshBasicMaterial({ map: woodTexture }), // Bottom face
                new THREE.MeshBasicMaterial({ map: woodTexture }), // Left face
                new THREE.MeshBasicMaterial({ map: woodTexture })  // Right face
            ]);

            // Rotate the sign to face the user
            this.signMesh.rotation.x = -Math.PI / 2;
            this.signMesh.rotation.z = 0.6;

            if (this.showPole) {
                const signPoleGeometry = new THREE.BoxGeometry(0.2, 0.2, 1);
                this.signPoleMesh = new THREE.Mesh(signPoleGeometry, [
                    new THREE.MeshBasicMaterial({ map: woodTexture }), // Top face
                    new THREE.MeshBasicMaterial({ map: woodTexture }), // Back face
                    new THREE.MeshBasicMaterial({ map: woodTexture }), // Top face
                    new THREE.MeshBasicMaterial({ map: woodTexture }), // Front face
                    new THREE.MeshBasicMaterial({ map: woodTexture }), // Bottom face
                    new THREE.MeshBasicMaterial({ map: woodTexture }), // Left face
                    new THREE.MeshBasicMaterial({ map: woodTexture })  // Right face
                ]);
                this.signPoleMesh.rotation.x = -Math.PI / 2;
                this.signPoleMesh.position.y -= 1;
                this.signPoleMesh.rotation.z = 0.6;
                this.mesh.add(this.signPoleMesh);
            }

            let scale;
            let polePositionY;
            switch (this.size) {
                case 'small':
                    scale = this.defaultScale * 0.75;
                    polePositionY = this.defaultScale * -0.75;
                    break;
                case 'medium':
                    scale = this.defaultScale * 1;
                    polePositionY = this.defaultScale * -1;
                    break;
                case 'large':
                    scale = this.defaultScale * 1.25;
                    polePositionY = this.defaultScale * -1.25;
                    break;
                default:
                    scale = this.defaultScale * 1;
                    polePositionY = this.defaultScale * -1;
            }
            this.signMesh.scale.set(scale, scale, scale);
            if (this.signPoleMesh) {
                this.signPoleMesh.scale.set(scale, scale, scale);
                this.signPoleMesh.position.y = polePositionY;
            }

            this.mesh.add(this.signMesh);
        });
    }

    updateText(texts) {
        this.currentText = texts;
        this.mesh.remove(this.signMesh);
        if (this.signPoleMesh) {
            this.mesh.remove(this.signPoleMesh);
        }
        this.createSign();
    }

    updateWoodTexture(texture) {
        this.currentWoodTextureFile = `wood_${texture}.webp`;
        this.mesh.remove(this.signMesh);
        if (this.signPoleMesh) {
            this.mesh.remove(this.signPoleMesh);
        }
        this.createSign();
    }

    updateSize(size) {
        this.size = size;
        this.mesh.remove(this.signMesh);
        if (this.signPoleMesh) {
            this.mesh.remove(this.signPoleMesh);
        }
        this.createSign();
    }

    togglePole() {
        this.showPole = !this.showPole;
        this.mesh.remove(this.signMesh);
        if (this.signPoleMesh) {
            this.mesh.remove(this.signPoleMesh);
        }
        this.createSign();
    }
}
