import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from './libs/three/jsm/DRACOLoader.js'
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { FBXLoader } from './libs/three/jsm/FBXLoader.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { LoadingBar } from './libs/LoadingBar.js';
import './libs/cannon.min.js';
import Stats from './libs/stats.js/src/Stats.js'
// import flagVertexShader from './shader/flagvertex.glsl'
// import flagFragmentShader from './shader/flagfragment.glsl'




//import { PointerLockControls } from './libs/three/jsm/PointerLockControls.js'

//import CANNON from './libs/cannon.min.js'
//import * as CANNON from './libs/cannon-es'
class App {

    constructor() {
        //###### close instruction #########
        this.education = document.querySelector('.education');
        this.hadoop = document.querySelector('.hadoop');
        this.rubber_toy = document.querySelector('.rubber_toy');
        this.modal = document.querySelector('.modal');
        this.overlay = document.querySelector('.overlay');
        const btnCloseModal = document.querySelector('.start_icon');
        const btnCloseModal2 = document.querySelector('.close-modal2');
        const btnCloseModal3 = document.querySelector('.close-modal3');
        const btnCloseModal4 = document.querySelector('.close-modal4');
        btnCloseModal.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.overlay.classList.add('hidden');
            this.load_ready_sw = 1;
            this.window_listener();
            //this.world.gravity.set(0, -9.82, 0);
            this.worker.postMessage('ready')
            //console.log(this.renderer.info.render.calls);
            document.body.style.cursor = "none";
        });
        btnCloseModal2.addEventListener('click', () => {
            this.education.classList.add('hidden');
            this.overlay.classList.add('hidden');
            document.body.style.cursor = "none";
        });
        btnCloseModal3.addEventListener('click', () => {
            this.hadoop.classList.add('hidden');
            this.overlay.classList.add('hidden');
            document.body.style.cursor = "none";
        });
        btnCloseModal4.addEventListener('click', () => {
            this.rubber_toy.classList.add('hidden');
            this.overlay.classList.add('hidden');
            document.body.style.cursor = "none";
        });
        //######### LoadingManager ###########
        this.loadingManager = new THREE.LoadingManager()
        this.loadingManager.onLoad = () => {

            this.modal.classList.remove('hidden');
            this.overlay.classList.remove('hidden');
            this.loadingBar.visible = false;
            //console.log(this.renderer.info.render.calls);
        }
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadingBar.progress = (itemsLoaded / itemsTotal);
        }



        const container = document.createElement('div');
        document.body.appendChild(container);





        window.addEventListener('resize', this.resize.bind(this));

        const cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)
        this.environmentMap = cubeTextureLoader.load([
            './assets/textures/environmentMaps/12/px.jpg',
            './assets/textures/environmentMaps/12/nx.jpg',
            './assets/textures/environmentMaps/12/py.jpg',
            './assets/textures/environmentMaps/12/ny.jpg',
            './assets/textures/environmentMaps/12/pz.jpg',
            './assets/textures/environmentMaps/12/nz.jpg'
        ])


        this.stats = new Stats()
        this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        //########## variable #######

        this.shoot_audio = document.getElementById("shootMusic");

        this.load_ready_sw = 0;

        this.start_shoot_time = -10;

        this.clock = new THREE.Clock();
        this.previousTime = 0;
        this.mixer = [];
        this.mixer2 = [];

        this.right_sw = 0;
        this.left_sw = 0;
        this.move_sw = 0;
        this.back_sw = 0;
        this.shoot_sw = 0;



        this.objectsToUpdate = [];
        this.bulletToUpdate = [];
        this.directionToUpdate = [];


        this.loadingBar = new LoadingBar();

        this.mouse = new THREE.Vector2();

        this.shoot_point = 5;

        this.mouse_deltax = 0;
        this.mouse_previousx = 0;

        this.textureLoader = new THREE.TextureLoader()



        //####### camera ########
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
        this.camera.position.set(0, 10, 0);
        this.camera.rotation.y += Math.PI;




        //######## scene #########
        this.scene = new THREE.Scene();
        this.scene.background = this.environmentMap;
        //this.scene.background = new THREE.Color(0xaaaaff);




        //########## LIGHT ###########
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
        this.scene.add(hemisphereLight);



        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set(0, 0.1, 1)
        //light.position.set(-200, 200, -200);
        // light.shadow.camera.top = 100
        // light.shadow.camera.right = 100
        // light.shadow.camera.bottom = -100
        // light.shadow.camera.left = - 100
        // light.shadow.camera.near = 1
        // light.shadow.camera.far = 900
        // light.shadow.mapSize.width = 1024 * 4
        // light.shadow.mapSize.height = 1024 * 4
        // light.castShadow = true
        //this.scene.add(light);
        // const directionalLightCameraHelper = new THREE.CameraHelper(light.shadow.camera)
        // this.scene.add(directionalLightCameraHelper)



        //####### renderer ###########
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        //this.renderer.physicallyCorrectLights = true;
        // this.renderer.shadowMap.enabled = true
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        //this.renderer.setClearColor('#262837')
        container.appendChild(this.renderer.domElement);




        this.loadPointer();
        this.loadPointer2();
        this.create_physics_world();
        this.loadFox();
        this.loadEnvironment();
        this.loadEnvironment2();
        this.renderer.setAnimationLoop(this.render.bind(this));





        this.worker = new Worker('Worker.js', { type: 'module' })



        //########locker#########
        // this.canvas = document.querySelector('div')
        // this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
        //     this.canvas.mozRequestPointerLock;

        // document.exitPointerLock = document.exitPointerLock ||
        //     document.mozExitPointerLock;


        // const self = this;
        // document.addEventListener('pointerlockchange', lockChangeAlert, false);
        // document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
        // function lockChangeAlert() {
        //     if (document.pointerLockElement === this.canvas ||
        //         document.mozPointerLockElement === this.canvas) {
        //         //console.log('The pointer lock status is now locked');
        //         document.addEventListener("mousemove", canvasLoop, false);
        //         self.lock = true;


        //     } else {
        //         //console.log('The pointer lock status is now unlocked');
        //         document.removeEventListener("mousemove", canvasLoop, false);
        //         self.lock = false;

        //     }
        // }
        // function canvasLoop(e) {
        //     const movementX = e.movementX ||
        //         e.mozMovementX ||
        //         e.webkitMovementX ||
        //         0;

        //     const movementY = e.movementY ||
        //         e.mozMovementY ||
        //         e.webkitMovementY ||
        //         0;

        //     self.mouse.x = movementX;
        //     self.mouse.y = movementY;
        //     //console.log(self.mouse, movementX)

        //     // var animation = requestAnimationFrame(canvasLoop);

        //     // tracker.innerHTML = "X position: " + x + ', Y position: ' + y;
        //     const worker_mouse = {
        //         type: 'mouse',
        //         mouse: self.mouse
        //     }
        //     self.worker.postMessage(worker_mouse);

        // }









    }
    window_listener() {
        //########### Listener #########


        window.addEventListener('mousemove', e => {

            this.mouse.x = event.clientX / window.innerWidth * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1


            //this.fox.rotation.x = 0 - this.mouse.y
            const worker_mouse = {
                type: 'mouse',
                mouse: this.mouse
            }
            this.worker.postMessage(worker_mouse);
            this.mouse_deltax = this.mouse.x - this.mouse_previousx;
            this.mouse_previousx = this.mouse.x;
        });

        window.addEventListener("click", () => {

            //this.canvas.requestPointerLock();
            this.shoot_sw = 1;



        })

        window.addEventListener('keydown', (e) => {
            if (e.keyCode === 87 || e.key === 'ArrowUp') {
                this.move_sw = 1;
                //this.canvas.requestPointerLock();
            }

            if (e.keyCode === 83 || e.key === 'ArrowDown') {
                this.back_sw = 1;
                //this.canvas.requestPointerLock();
            }

            if (e.keyCode === 68 || e.key === 'ArrowRight') {
                this.right_sw = 1;
                //this.canvas.requestPointerLock();
            }

            if (e.keyCode === 65 || e.key === 'ArrowLeft') {
                this.left_sw = 1;
                //this.canvas.requestPointerLock();
            }

            if (e.key === ' ' || e.keyCode === 32) {
                this.shoot_sw = 1;
                //document.exitPointerLock();

            }
            if (e.keyCode === 13) {
                console.log('hehe')
                for (let i = 0; i < this.directionToUpdate.length; i++) {
                    if (this.directionToUpdate[i].ray_sw === true) {

                        if (this.directionToUpdate[i].mesh.name === 'directable001') {
                            this.education.classList.remove('hidden');
                            this.overlay.classList.remove('hidden');
                            document.body.style.cursor = "default";
                        }
                        else if (this.directionToUpdate[i].mesh.name === 'directable002')
                            window.open("mailto:tcm390@nyu.edu")
                        else if (this.directionToUpdate[i].mesh.name === 'directable003')
                            window.open("https://www.linkedin.com/in/ting-chien-meng-b221521a6/")
                        else if (this.directionToUpdate[i].mesh.name === 'directable004')
                            window.open("https://github.com/tcm390")
                        else if (this.directionToUpdate[i].mesh.name === 'directable005') {
                            this.hadoop.classList.remove('hidden');
                            this.overlay.classList.remove('hidden');
                            const a = 0;
                            document.body.style.cursor = "default";
                        }
                        else if (this.directionToUpdate[i].mesh.name === 'directable006') {
                            this.hadoop.classList.remove('hidden');
                            this.overlay.classList.remove('hidden');
                            document.body.style.cursor = "default";
                        }
                        else if (this.directionToUpdate[i].mesh.name === 'directable007') {
                            this.rubber_toy.classList.remove('hidden');
                            this.overlay.classList.remove('hidden');
                            document.body.style.cursor = "default";
                        }

                    }
                }
            }


        });

        window.addEventListener('keyup', (e) => {
            if (e.keyCode === 87 || e.key === 'ArrowUp')
                this.move_sw = 0;
            if (e.keyCode === 83 || e.key === 'ArrowDown')
                this.back_sw = 0;
            if (e.keyCode === 68 || e.key === 'ArrowRight')
                this.right_sw = 0;
            if (e.keyCode === 65 || e.key === 'ArrowLeft')
                this.left_sw = 0;
            if (e.key === ' ' || e.keyCode === 32)
                this.shoot_sw = 0;

        });

    }
    create_physics_world() {
        // this.world = new CANNON.World()
        // this.world.gravity.set(0, -900, 0)

        // this.defaultMaterial = new CANNON.Material('default')
        // const defaultContactMaterial = new CANNON.ContactMaterial(
        //     this.defaultMaterial,
        //     this.defaultMaterial,
        //     {
        //         friction: .1,
        //         restitution: .7
        //     }
        // )
        // this.world.defaultContactMaterial = defaultContactMaterial


        // // const duckBodyShape = new CANNON.Box(new CANNON.Vec3(4, 4, 2));
        // // const duckBody = new CANNON.Body({
        // //     mass: 0,
        // //     position: new CANNON.Vec3(10, 0, 10),
        // //     shape: duckBodyShape,
        // //     material: this.defaultMaterial
        // // });
        // // this.world.addBody(duckBody)


        // const foxShape = new CANNON.Box(new CANNON.Vec3(0.9, 1.2, 2.4))
        // const foxBody = new CANNON.Body({
        //     mass: 10,
        //     position: new CANNON.Vec3(-10, 0, 0),
        //     shape: foxShape,
        //     material: this.defaultMaterial
        // })
        // this.world.addBody(foxBody)

        // const floorShape = new CANNON.Plane()
        // const floorBody = new CANNON.Body()
        // floorBody.mass = 0
        // floorBody.addShape(floorShape)
        // floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
        // this.world.addBody(floorBody)

        //######## shadow ############
        const simpleShadow = this.textureLoader.load('./assets/glTF100/simpleShadow3.jpeg')
        this.sphereShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 5),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                alphaMap: simpleShadow
            })
        )
        this.sphereShadow.rotation.x = - Math.PI * 0.5

        this.scene.add(this.sphereShadow);

        //######## set entrance for project ###############
        const geometry = new THREE.BoxBufferGeometry(13, 13, 13);
        const material = new THREE.MeshStandardMaterial({ color: 0xFF0000, transparent: true, opacity: 0 });
        this.rubberEntrance = new THREE.Mesh(geometry, material);
        this.rubberEntrance.position.set(133, 1, 11);
        this.scene.add(this.rubberEntrance);

        this.hadoopEntrance = new THREE.Mesh(geometry, material);
        this.hadoopEntrance.position.set(133, 1, 83);
        this.scene.add(this.hadoopEntrance);

        //############# front sight #############
        const geometry1 = new THREE.BoxBufferGeometry(.05, .3, .05);
        const geometry2 = new THREE.BoxBufferGeometry(.3, .05, .05);
        const material1 = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const cube1 = new THREE.Mesh(geometry1, material1);
        const cube2 = new THREE.Mesh(geometry1, material1);
        const cube3 = new THREE.Mesh(geometry2, material1);
        const cube4 = new THREE.Mesh(geometry2, material1);
        cube1.position.set(0, -.5, 0);
        cube2.position.set(0, .5, 0);
        cube3.position.set(.5, 0, 0);
        cube4.position.set(-.5, 0, 0);
        this.target = new THREE.Group();
        this.target.add(cube1);
        this.target.add(cube2);
        this.target.add(cube3);
        this.target.add(cube4);
        this.scene.add(this.target);

        //###### 
        // const firefliesGeometry = new THREE.BufferGeometry()
        // const firefliesCount = 50
        // const positionArray = new Float32Array(firefliesCount * 3)
        // const scaleArray = new Float32Array(firefliesCount)

        // for (let i = 0; i < firefliesCount; i++) {
        //     positionArray[i * 3 + 0] = (Math.random() - 0.5) * 7
        //     positionArray[i * 3 + 1] = Math.random() * 5.5
        //     positionArray[i * 3 + 2] = (Math.random() - 0.5) * 7
        //     scaleArray[i] = Math.random()
        // }

        // firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
        // firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
        // this.firefliesMaterial = new THREE.RawShaderMaterial({
        //     vertexShader: `
        //         uniform mat4 projectionMatrix;
        //         uniform mat4 viewMatrix;
        //         uniform mat4 modelMatrix;
        //         uniform float uTime;
        //         uniform float uPixelRatio;


        //         attribute float aScale;
        //         attribute vec2 uv;
        //         varying vec2 vUv;

        //         attribute vec3 position;

        //         void main(){
        //             vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        //             modelPosition.y += sin(uTime*2. + modelPosition.x * 100.0) * aScale * 0.2;
        //             vec4 viewPosition = viewMatrix * modelPosition;
        //             vec4 projectionPosition = projectionMatrix * viewPosition;

        //             gl_Position = projectionPosition;
        //             gl_PointSize = 400. * aScale * uPixelRatio;
        //             gl_PointSize *= (1.0 / - viewPosition.z);
        //         }
        //     `,
        //     fragmentShader: `
        //         precision mediump float;
        //         uniform sampler2D uTexture;

        //         varying vec2 vUv;               

        //         void main(){
        //             float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        //             float strength = 0.05 / distanceToCenter - 0.1;

        //             gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
        //         }
        //     `,
        //     uniforms: {
        //         uTime: { value: 0 },
        //         uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        //     },
        //     transparent: true,
        //     blending: THREE.AdditiveBlending,
        //     depthWrite: false

        // })
        // this.fireflies = new THREE.Points(firefliesGeometry, this.firefliesMaterial)
        // this.scene.add(this.fireflies)


        // this.pointer2 = new THREE.Group();
        // const simpleShadow2 = this.textureLoader.load('./assets/glTF100/simpleShadow4.jpeg')
        // this.recall1 = new THREE.Mesh(
        //     new THREE.PlaneGeometry(8, 8),
        //     new THREE.MeshBasicMaterial({
        //         color: 0x55ff55,
        //         transparent: true,
        //         opacity: 0.9,
        //         alphaMap: simpleShadow2
        //     })
        // )
        // this.recall1.rotation.x = - Math.PI * 0.5


        // this.pointer2.add(this.recall1);
        // const geometry3 = new THREE.CylinderGeometry(3, 3, 10, 32, 1);
        // const material3 = new THREE.MeshBasicMaterial({ color: 0x55ff55, transparent: true, opacity: .1 });
        // //const textureLoader = new THREE.TextureLoader()
        // //const matcapTexture = textureLoader.load('./assets/textures/matcaps/13.png')

        // //const material3 = new THREE.MeshMatcapMaterial({ transparent: true, opacity: 0.5 })
        // //material3.matcap = matcapTexture
        // this.recall2 = new THREE.Mesh(geometry3, material3);
        // //recall2.rotation.x = Math.PI / 2
        // //0.01:0.2
        // //1:5
        // this.recall2.scale.set(1.2, .05, 1.2)
        // this.recall2.position.y = 0.2
        // this.pointer2.add(this.recall2);
        // this.pointer2.scale.set(0.8, 0.8, 0.8)
        // this.scene.add(this.pointer2)


        // for (let i = 0; i < 100; i++) {
        //     const geometry = new THREE.BoxBufferGeometry(3, 3, 3);
        //     const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        //     const cubeMesh = new THREE.Mesh(geometry, material);
        //     cubeMesh.position.set(Math.random() * 200 - 100, 1, Math.random() * 200 - 100);
        //     // cubeMesh.castShadow = true;
        //     this.scene.add(cubeMesh);


        //     const shape = new CANNON.Box(new CANNON.Vec3(3 / 2, 3 / 2, 3 / 2))
        //     const body = new CANNON.Body({
        //         mass: 1,
        //         shape: shape,
        //         material: this.defaultMaterial
        //     })
        //     body.position.copy(cubeMesh.position)
        //     this.world.addBody(body)

        //     this.objectsToUpdate.push({
        //         mesh: cubeMesh,
        //         body: body
        //     });
        // }
    }

    loadEnvironment2() {
        let self = this;
        const textureLoader = new THREE.TextureLoader()
        const bakedTexture = textureLoader.load('./assets/glTF200/test.jpg')
        const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
        // const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        // const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
        bakedTexture.flipY = false
        bakedTexture.encoding = THREE.sRGBEncoding
        const dracoLoader = new DRACOLoader()
        //dracoLoader.setDecoderPath('draco/')

        // GLTF loader
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)



        gltfLoader.load(
            './assets/glTF200/untitled.glb',
            (gltf) => {

                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = bakedMaterial
                    }
                })
                //const bakedMesh = gltf.scene.children.find((child) => child.name === 'Plane015')
                // const portalLightMesh = gltf.scene.children.find((child) => child.name === 'Circle')
                // const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'Cube011')
                // const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'Cube014')

                // portalLightMesh.material = portalLightMaterial
                // poleLightAMesh.material = poleLightMaterial
                // poleLightBMesh.material = poleLightMaterial
                gltf.scene.scale.set(10, 10, 10)
                gltf.scene.position.set(10, 0, 10)
                self.scene.add(gltf.scene)
            },
            (xhr) => {

                self.loadingBar.progress = (xhr.loaded / xhr.total);

            },
            // called when loading has errors
            (error) => {

                console.log('An error happened');
                console.log(error);

            }
        );
    }
    loadPointer() {
        let self = this;
        const gltfLoader = new GLTFLoader(this.loadingManager)
        gltfLoader.load(
            './assets/glTF100/pointer.glb',
            (gltf) => {
                self.pointer = gltf.scene;
                self.pointer.scale.set(2, 2, 2)
                self.scene.add(gltf.scene)
            },
            (x) => {
            },
            // called when loading has errors
            (error) => {

                console.log('An error happened');
                console.log(error);

            }
        )

    }
    loadPointer2() {
        let self = this;
        const gltfLoader = new GLTFLoader(this.loadingManager)
        gltfLoader.load(
            './assets/glTF300/enter.glb',
            (gltf) => {
                self.pointer2 = gltf.scene;
                console.log(gltf)
                self.pointer2.scale.set(1.8, 1.8, 1.8)

                self.scene.add(gltf.scene)
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        //child.material.color = new THREE.Color(0xff3322);
                        // child.material.transparent = true;
                        // child.material.opacity = 0.65


                    }
                })

            },
            (x) => {
            },
            // called when loading has errors
            (error) => {

                console.log('An error happened');
                console.log(error);

            }
        )

    }

    loadEnvironment() {
        let self = this;
        const gltfLoader = new GLTFLoader(this.loadingManager)
        const textureLoader = new THREE.TextureLoader()
        const matcapTexture = textureLoader.load('./assets/textures/matcaps/16.png')
        const matcapTexture2 = textureLoader.load('./assets/textures/matcaps/11.png')
        const matcapTexture3 = textureLoader.load('./assets/textures/matcaps/15.png')
        const matcapTexture4 = textureLoader.load('./assets/textures/matcaps/17.png')

        const material = new THREE.MeshMatcapMaterial()
        material.matcap = matcapTexture
        const material2 = new THREE.MeshMatcapMaterial()
        material2.matcap = matcapTexture2
        const material3 = new THREE.MeshMatcapMaterial()
        material3.matcap = matcapTexture3
        const material4 = new THREE.MeshMatcapMaterial()
        material4.matcap = matcapTexture4

        gltfLoader.load(
            './assets/glTF100/untitled.glb',
            (gltf) => {
                self.env = gltf.scene;
                //console.log(gltf)
                gltf.scene.scale.set(10, 10, 10)
                gltf.scene.position.set(10, 0, 10)
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        //child.receiveShadow = true;
                    }
                    if (child.name.substring(0, 10) === 'directable') {
                        self.directionToUpdate.push({
                            mesh: child,
                            ray_sw: false
                        });
                    }




                    if (child.name.substring(0, 5) === 'trash'
                        || child.name === 'barrier'
                        || child.name.substring(0, 4) === 'desk'
                        || child.name.substring(0, 5) === 'skill'
                        || child.name.substring(0, 6) === 'dumble'

                        // || child.name.substring(0, 3) === 'ps4'
                        //|| child.name.substring(0, 4) === 'Xbox'
                        // || child.name.substring(0, 3) === 'toy'
                        // || child.name.substring(0, 4) === 'book'

                    ) {

                        //this.objectsToUpdate.
                        self.trashcan = child;

                        //wconst size = new THREE.Vector3()
                        const box = new THREE.Box3().setFromObject(child);
                        //console.log(box.min, box.max, box.getSize(size));

                        // const geometry = new THREE.BoxGeometry(box.getSize().x * 10, box.getSize().y * 10, box.getSize().z * 10);
                        // const material1 = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
                        // const cubeMesh = new THREE.Mesh(geometry, material1);
                        // cubeMesh.position.set(child.position.x * 10 + 10, child.position.y * 10, child.position.z * 10 + 10);
                        // self.scene.add(cubeMesh);
                        const data = {
                            type: 'shootable',
                            sizex: box.getSize().x * 10,
                            sizey: box.getSize().y * 10,
                            sizez: box.getSize().z * 10,
                            positionx: child.position.x * 10 + 10,
                            positiony: child.position.y * 10,
                            positionz: child.position.z * 10 + 10
                        }
                        self.worker.postMessage(data)
                        // const shape = new CANNON.Box(new CANNON.Vec3(size.x * 5, size.y * 2.5, size.z * 5))
                        // const body = new CANNON.Body({
                        //     mass: 5,
                        //     shape: shape,
                        //     material: self.defaultMaterial
                        // })
                        // body.position.set(child.position.x * 10 + 10, child.position.y * 10, child.position.z * 10 + 10);
                        // self.world.addBody(body)

                        self.objectsToUpdate.push(child);
                    }
                    else if (child.name.substring(0, 8) === 'poolwall') {
                        const box = new THREE.Box3().setFromObject(child);
                        //console.log(box.min, box.max, box.getSize(size));

                        // const geometry = new THREE.BoxGeometry(box.getSize().x * 10, box.getSize().y * 10, box.getSize().z * 10);
                        // const material1 = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
                        // const cubeMesh = new THREE.Mesh(geometry, material1);
                        // cubeMesh.position.set(child.position.x * 10 + 10, child.position.y * 10, child.position.z * 10 + 10);
                        // self.scene.add(cubeMesh);
                        const data = {
                            type: 'static_object',
                            sizex: box.getSize().x * 10,
                            sizey: box.getSize().y * 200,
                            sizez: box.getSize().z * 10,
                            positionx: child.position.x * 10 + 10,
                            positiony: child.position.y * 10,
                            positionz: child.position.z * 10 + 10
                        }
                        self.worker.postMessage(data)
                        self.objectsToUpdate.push(child);
                    }

                    else if (child.name.substring(0, 4) === 'Road') {
                        //const size = new THREE.Vector3()
                        const box = new THREE.Box3().setFromObject(child);

                        //console.log(box.min, box.max, box.getSize(size));

                        // const geometry = new THREE.BoxGeometry(box.getSize().x * 5, box.getSize().y * 10, box.getSize().z * 5);
                        // const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
                        // const cubeMesh = new THREE.Mesh(geometry, material);
                        // cubeMesh.position.set(child.position.x * 10 + 10, child.position.y * 20, child.position.z * 10 + 10);
                        // self.scene.add(cubeMesh);
                        const data = {
                            type: 'road',
                            sizex: box.getSize().x * 8,
                            sizey: box.getSize().y * 10,
                            sizez: box.getSize().z * 8,
                            positionx: child.position.x * 10 + 10,
                            positiony: child.position.y * 10,
                            positionz: child.position.z * 10 + 10
                        }
                        self.worker.postMessage(data)
                        self.objectsToUpdate.push(child);
                    }

                    else if (child.name.substring(0, 8) === 'poolball') {
                        const box = new THREE.Box3().setFromObject(child)
                        //console.log(box.getSize().x * 10)
                        // const geometry = new THREE.SphereGeometry(box.getSize() * 10, 32);
                        // const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
                        // const sphereMesh = new THREE.Mesh(geometry, material);
                        // sphereMesh.position.set(child.position.x * 10 + 10, child.position.y * 10 + 1, child.position.z * 10 + 10);
                        // self.scene.add(sphereMesh);
                        const data = {
                            type: 'poolball',
                            radius: (box.getSize().x * 5),
                            positionx: child.position.x * 10 + 10,
                            positiony: child.position.y * 10 + 1,
                            positionz: child.position.z * 10 + 10
                        }
                        self.worker.postMessage(data)
                        self.objectsToUpdate.push(child);
                    }

                    if (child.isMesh && child.name === 'Plane001') {
                        //const textureLoader = new THREE.TextureLoader()
                        const flagTexture = self.textureLoader.load('./assets/textures/nyu_logo/nyu.png')
                        self.flagmaterial = new THREE.RawShaderMaterial({
                            vertexShader: `
                                uniform mat4 projectionMatrix;
                                uniform mat4 viewMatrix;
                                uniform mat4 modelMatrix;
                                uniform float uTime;


                                attribute vec2 uv;
                                varying vec2 vUv;

                                attribute vec3 position;
                                float rand(vec2 co){
                                    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
                                }
                                void main()
                                {
                                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                                    modelPosition.z -= cos(modelPosition.y + uTime*2.)/modelPosition.y*10.;
                                    //modelPosition.x += cos(modelPosition.z + uTime*2.) * .5;
                                    vec4 viewPosition = viewMatrix * modelPosition;
                                    vec4 projectedPosition = projectionMatrix * viewPosition;

                                    gl_Position = projectedPosition;
                                    vUv = uv;
                                }
                            `,
                            fragmentShader: `
                                precision mediump float;
                                uniform sampler2D uTexture;

                                varying vec2 vUv;               

                                void main()
                                {
                                    vec4 textureColor = texture2D(uTexture, vUv);
                                    gl_FragColor = textureColor;
                                }
                            `,
                            uniforms: {
                                uTime: { value: 0 },
                                uTexture: { value: flagTexture }
                            }

                        })
                        //console.log(self.flagmaterial.uniforms)
                        self.flagmaterial.side = THREE.DoubleSide;
                        const count = child.geometry.attributes.position.count
                        //console.log(child.geometry.attributes.position.count)
                        const randoms = new Float32Array(count)
                        for (let i = 0; i < count; i++) {
                            randoms[i] = Math.random()
                        }
                        child.geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

                        child.material = self.flagmaterial
                    }
                    else if (child.name === 'chargingbull') {
                        child.material = material;
                    }
                    else if (child.name === 'Walls') {
                        // console.log(child)
                        //child.material = material3;
                        // child.material.color = new THREE.Color(0x505070);
                    }
                    else if (child.name === 'sofa') {
                        //console.log(child)
                        child.material = material3;
                        // child.children[2].material = material2;
                        //child.material.color = new THREE.Color(0x000000);
                    }
                    else if (
                        child.name === 'Cube012'
                        || child.name.substring(0, 3) === 'mat'
                    ) {
                        //console.log(child)
                        child.material = material4;
                        // child.children[2].material = material2;
                        //child.material.color = new THREE.Color(0x000000);
                    }




                });
                self.scene.add(gltf.scene)
            },
            (xhr) => {

                //self.loadingBar.progress = (xhr.loaded / xhr.total);

            },
            // called when loading has errors
            (error) => {

                console.log('An error happened');
                console.log(error);

            }
        );
    }

    loadFox() {

        const textureLoader = new THREE.TextureLoader()
        const matcapTexture = textureLoader.load('./assets/textures/matcaps/9.png')
        const material = new THREE.MeshMatcapMaterial()
        material.matcap = matcapTexture

        const fbxfLoader = new FBXLoader(this.loadingManager);
        let self = this;
        fbxfLoader.load(
            './assets/glTF100/spaceman.fbx',
            (object) => {
                self.fox = object;
                self.fox.scale.set(0.025, 0.025, 0.025)
                //console.log(object)
                self.scene.add(object)
                //console.log(gltf.scene)
                //gltf.scene.scale.set(2, 2, 2)
                object.traverse(function (child) {


                    if (child.name == 'spaceman') {

                        child.material.color = new THREE.Color(0x60a085);

                        //child.material.shininess = 50
                        //console.log(child);
                    }
                    else if (child.isMesh && child.name === 'polySurface21000') {
                        self.skateboard = child;
                        child.material = material;
                    }
                });
                self.mixer.push(new THREE.AnimationMixer(object))
                self.mixer.push(new THREE.AnimationMixer(object))
                self.mixer.push(new THREE.AnimationMixer(object))
                self.mixer.push(new THREE.AnimationMixer(object))
                // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
                // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
                // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
                const shoot = self.mixer[0].clipAction(object.animations[0])
                shoot.play()
                const idel = self.mixer[1].clipAction(object.animations[2])
                idel.play()
                const balance = self.mixer[2].clipAction(object.animations[3])
                balance.play()
                const move = self.mixer[3].clipAction(object.animations[4])
                move.play()
                // const action3 = self.mixer[3].clipAction(gltf.animations[3])
                // action3.play()
                // const action4 = self.mixer[4].clipAction(gltf.animations[4])
                // action4.play()

            },
            (xhr) => {

                //self.loadingBar.progress = (xhr.loaded / xhr.total);

            },
            // called when loading has errors
            (error) => {

                console.log('An error happened');
                console.log(error);

            }
        )
    }

    // loadFox() {


    //     const gltfLoader = new GLTFLoader();

    //     let self = this;
    //     gltfLoader.load(
    //         './assets/glTF5/craft_miner2.glb',
    //         (gltf) => {
    //             const textureLoader = new THREE.TextureLoader()
    //             const matcapTexture = textureLoader.load('./assets/textures/matcaps/3.png')
    //             const material = new THREE.MeshMatcapMaterial()
    //             material.matcap = matcapTexture
    //             self.fox = gltf.scene;
    //             //console.log(gltf.scene)
    //             gltf.scene.scale.set(2, 2, 2)
    //             gltf.scene.traverse(function (child) {
    //                 if (child.isMesh) {
    //                     //child.castShadow = true;
    //                     child.material = material
    //                 }
    //                 if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
    //                     // child.material.envMap = environmentMap
    //                     // child.material.envMapIntensity = 2
    //                     // child.material.metalness = 0.9
    //                     // child.material.roughness = 0.2
    //                 }
    //                 child.position.x = 0
    //                 child.position.y = .3
    //                 child.position.z = 0



    //             });

    //             self.scene.add(gltf.scene)
    //             // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
    //             // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
    //             // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
    //             // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
    //             // self.mixer.push(new THREE.AnimationMixer(gltf.scene))
    //             // const action0 = self.mixer[0].clipAction(gltf.animations[3])
    //             // action0.play()
    //             // const action1 = self.mixer[1].clipAction(gltf.animations[1])
    //             // action1.play()
    //             // const action2 = self.mixer[2].clipAction(gltf.animations[2])
    //             // action2.play()
    //             // const action3 = self.mixer[3].clipAction(gltf.animations[3])
    //             // action3.play()
    //             // const action4 = self.mixer[4].clipAction(gltf.animations[4])
    //             // action4.play()



    //             //self.renderer.setAnimationLoop(self.render.bind(self));
    //             setTimeout(() => { self.world.gravity.set(0, -9.82, 0) }, 1000);

    //         },
    //         function (xhr) {

    //             self.loadingBar.progress = (xhr.loaded / xhr.total);

    //         }
    //     )
    // }

    resize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        // firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)

    }
    shoot() {
        if (this.load_ready_sw) {

            //console.log(this.shoot_point)
            this.shoot_audio.play();


            const sphereGeometry = new THREE.SphereGeometry(.2)
            const sphereMaterial = new THREE.MeshStandardMaterial()
            sphereMaterial.color = new THREE.Color(Math.random() * 3, Math.random() * 3, Math.random() * 3);

            const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
            //mesh.castShadow = true
            mesh.position.copy(this.fox.position)
            //mesh.position.set(-10, 3, 0)
            this.scene.add(mesh)
            // const shape = new CANNON.Sphere(0.2)
            // const body = new CANNON.Body({
            //     mass: 2,
            //     shape: shape
            // })

            let dum = new THREE.Vector3();
            this.fox.getWorldDirection(dum)
            dum = dum.normalize();

            const bull = {
                type: 'shoot',
                foxposition: this.fox.position,
                dum: dum,
                shoot_point: this.target.position

            }

            this.worker.postMessage(bull);
            // body.position.copy(this.fox.position)
            // let dum = new THREE.Vector3();
            // //let dum = new THREE.Vector3();
            // this.fox.getWorldDirection(dum)
            // //if (this.mouse.y >= -0.28)
            // body.velocity.set(
            //     dum.x * 100,
            //     ((Math.sin(this.mouse.y + 0.15) * Math.abs(dum.z)) + (Math.sin(this.mouse.y + 0.15) * Math.abs(dum.x))) * 50,
            //     dum.z * 100);
            // // else {
            // //     body.velocity.set(
            // //         this.fox.getWorldDirection(dum).x * 100,
            // //         this.fox.getWorldDirection(dum).y * 100,
            // //         this.fox.getWorldDirection(dum).z * 100);
            // // }
            // body.position.y += 5;
            // //console.log(this.mouse.y)

            // this.world.addBody(body)
            // this.bulletToUpdate.push({
            //     mesh: mesh,
            //     body: body
            // })

            this.bulletToUpdate.push(mesh)
            this.shoot_sw = 0;
            //console.log(this.bulletToUpdate)
        }
    }
    render() {


        this.stats.begin()

        const elapsedTime = this.clock.getElapsedTime()
        const deltaTime = elapsedTime - this.previousTime
        this.previousTime = elapsedTime
        //this.world.step(1 / 60, deltaTime, 3)
        let block = 0;

        // if (document.pointerLockElement === null || document.mozPointerLockElement === null) {
        //     this.lock = false;
        // }

        if (this.flagmaterial) {
            this.flagmaterial.uniforms.uTime.value = elapsedTime;
        }
        if (this.firefliesMaterial) {
            this.firefliesMaterial.uniforms.uTime.value = elapsedTime
        }
        if (this.load_ready_sw) {





            this.sphereShadow.position.x = this.fox.position.x
            this.sphereShadow.position.z = this.fox.position.z
            this.sphereShadow.position.y = 0.2;
            this.sphereShadow.material.opacity = (1 - this.fox.position.y / 3) * 0.4
            this.sphereShadow.scale.set((this.fox.position.y + 1) * 1, (this.fox.position.y + 1) * 1, (this.fox.position.y + 1) * 1)
            this.sphereShadow.rotation.z = this.fox.rotation.y;
            // this.sphereShadow.position.x = this.trashcan.position.x * 10 + 10
            // this.sphereShadow.position.z = this.trashcan.position.z * 10 + 10
            // this.sphereShadow.position.y = -.5;
            // this.sphereShadow.material.opacity = (1 - this.trashcan.position.y * 10 / 3) * 0.4
            // this.sphereShadow.scale.set((this.trashcan.position.y * 10 + 1) * 1, (this.trashcan.position.y * 10 + 1) * 1, (this.trashcan.position.y * 10 + 1) * 1)
            // this.sphereShadow.rotation.z = this.trashcan.rotation.y;
            const dt = {
                type: 'time',
                deltaTime: deltaTime
            }
            this.worker.postMessage(dt);

            let quaternion = {
                type: 'quaternion',
                quaternion: this.fox.rotation.y
            }
            this.worker.postMessage(quaternion)

            this.worker.postMessage('getfox')
            this.worker.postMessage('getbullet')
            this.worker.postMessage('getshootable')
            let bulletToUpdate2;

            this.worker.onmessage = (e) => {
                if (e.data.type === 'getfox') {
                    this.fox.position.copy(e.data.pos)
                    this.fox.position.y -= 1;
                }
                if (e.data.type === 'getbullet') {
                    bulletToUpdate2 = e.data.bulletToUpdate;
                    for (let i = 0; i < this.bulletToUpdate.length; i++) {
                        this.bulletToUpdate[i].position.x = (bulletToUpdate2[i * 3 + 0])
                        this.bulletToUpdate[i].position.y = (bulletToUpdate2[i * 3 + 1])
                        this.bulletToUpdate[i].position.z = (bulletToUpdate2[i * 3 + 2])
                        if (this.bulletToUpdate[i].position.y <= .2) {
                            this.scene.remove(this.bulletToUpdate[i])
                            this.bulletToUpdate.splice(i, 1)
                            const data = {
                                type: 'clean_bullet',
                                index: i
                            }
                            this.worker.postMessage(data)
                            //console.log(this.bulletToUpdate)
                        }
                    }

                }
                if (e.data.type === 'getshootable') {
                    let position = e.data.position;
                    let quaternion2 = e.data.quaternion;
                    //console.log(objectsToUpdate2)
                    for (let i = 0; i < this.objectsToUpdate.length; i++) {
                        this.objectsToUpdate[i].position.x = (position[i].x - 10) / 10
                        this.objectsToUpdate[i].position.y = (position[i].y) / 10
                        this.objectsToUpdate[i].position.z = (position[i].z - 10) / 10
                        this.objectsToUpdate[i].quaternion.copy(quaternion2[i])
                        if (this.objectsToUpdate[i].name.substring(0, 4) === 'Road') {
                            this.objectsToUpdate[i].position.y -= .2
                        }
                        if (this.objectsToUpdate[i].name.substring(0, 6) === 'dumble') {
                            // this.objectsToUpdate[i].rotation.z += Math.PI / 2
                            // this.objectsToUpdate[i].rotation.x += Math.PI / 2
                            //this.objectsToUpdate[i].rotation.y += Math.PI / 2
                            //this.objectsToUpdate[i].position.y -= .03
                        }


                    }

                }

            }

            // for (let i = 0; i < this.objectsToUpdate.length; i++) {
            //     // this.objectsToUpdate[i].mesh.position.copy(this.objectsToUpdate[i].body.position)
            //     // this.objectsToUpdate[i].mesh.quaternion.copy(this.objectsToUpdate[i].body.quaternion)
            //     this.objectsToUpdate[i].mesh.position.copy(this.objectsToUpdate[i].body.position)
            //     this.objectsToUpdate[i].mesh.quaternion.copy(this.objectsToUpdate[i].body.quaternion)
            //     this.objectsToUpdate[i].mesh.position.x = (this.objectsToUpdate[i].mesh.position.x - 10) / 10
            //     this.objectsToUpdate[i].mesh.position.z = (this.objectsToUpdate[i].mesh.position.z - 10) / 10
            //     this.objectsToUpdate[i].mesh.position.y = this.objectsToUpdate[i].mesh.position.y / 10

            // }



            // for (let i = 0; i < this.bulletToUpdate.length; i++) {
            //     this.bulletToUpdate[i].mesh.position.copy(this.bulletToUpdate[i].body.position)
            //     this.bulletToUpdate[i].mesh.quaternion.copy(this.bulletToUpdate[i].body.quaternion)
            //     if (this.bulletToUpdate[i].body.position.y <= 1) {
            //         this.scene.remove(this.bulletToUpdate[i].mesh)
            //         this.world.removeBody(this.bulletToUpdate[i].body)
            //         this.bulletToUpdate.splice(i, 1)

            //     }
            // }
            let min = 9999;
            let min_index = -10;
            let testObject = []
            for (let i = 0; i < this.directionToUpdate.length; i++) {
                let pointer_position = new THREE.Vector3();
                this.directionToUpdate[i].ray_sw = false;
                pointer_position.copy(this.directionToUpdate[i].mesh.position);
                pointer_position.x = pointer_position.x * 10 + 10;
                pointer_position.y = pointer_position.y * 10 + 7;
                pointer_position.z = pointer_position.z * 10 + 10;
                if (this.fox.position.distanceTo(pointer_position) < min) {
                    min = this.fox.position.distanceTo(pointer_position);
                    this.pointer.position.copy(pointer_position);
                    this.pointer2.position.copy(pointer_position);
                    this.pointer2.position.y += 4;


                    min_index = i;
                }

            }



            // testObject.push(this.directionToUpdate[min_index].mesh)

            // 
            // raycaster.setFromCamera(this.mouse, this.camera)
            // let intersects = raycaster.intersectObjects(testObject)
            // if (intersects.length) {
            //     //document.body.style.cursor = "pointer";
            //     this.directionToUpdate[min_index].ray_sw = true;

            // }

            // else {
            //     this.directionToUpdate[min_index].ray_sw = false;
            //     //document.body.style.cursor = "default";
            // }

            const raycaster = new THREE.Raycaster()
            let pos = new THREE.Vector3();
            let rayDirection = new THREE.Vector3();
            this.fox.getWorldPosition(pos);
            this.fox.getWorldDirection(rayDirection);
            raycaster.set(pos, rayDirection.normalize());
            let intersect = raycaster.intersectObject(this.rubberEntrance)
            if (intersect.length > 0) {
                if (intersect[0].distance < 1.6) {
                    window.location.assign('https://tcm390.github.io/rubbertoy_courage_the_cowardly_dog/')

                }
            }
            intersect = raycaster.intersectObject(this.hadoopEntrance)
            if (intersect.length > 0) {
                if (intersect[0].distance < 1.6) {
                    window.location.assign('https://www.google.com/')

                }
            }

            if (this.fox.position.distanceTo(this.pointer.position) < 30.6) {

                this.pointer2.visible = true;
                this.pointer.visible = false;
                this.directionToUpdate[min_index].ray_sw = true;
            }
            else {
                //this.pointer.position.y = this.pointer2.position.y;
                this.pointer.visible = true;
                this.pointer2.visible = false;
                this.directionToUpdate[min_index].ray_sw = false;
            }





            // for (const intersect of intersects) {
            //     if (intersect.distance < 1.6) {
            //         console.log('enter')
            //     }

            // }


            // const screenPosition = this.pointer.position.clone()
            // screenPosition.y = 0;
            // screenPosition.project(this.camera)
            // raycaster.setFromCamera(screenPosition, this.camera)
            // const intersects = raycaster.intersectObjects(this.scene.children, true)
            // if (intersects.length === 0) {
            //     modal.classList.add('hidden');
            // }
            // else {
            //     const intersectionDistance = intersects[0].distance
            //     const pointDistance = this.pointer.position.distanceTo(this.camera.position)

            //     if (intersectionDistance < pointDistance) {
            //         modal.classList.remove('hidden');
            //     }
            //     else {
            //         modal.classList.add('hidden');
            //     }

            // }
            // const translateX = screenPosition.x * window.innerWidth * 0.3
            // const translateY = -screenPosition.y * window.innerHeight * 0.3
            // modal.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`



            if (this.mouse.x > 0.9) { //&& this.mouse.y < 0.3) {
                this.fox.rotation.y -= 0.02 * Math.abs(this.mouse.x);
                this.camera.rotation.y -= 0.02 * Math.abs(this.mouse.x);
                this.target.rotation.y -= 0.02 * Math.abs(this.mouse.x);
            }
            else if (this.mouse.x < -0.9) { //&& this.mouse.y < 0.3) {
                this.fox.rotation.y += 0.02 * Math.abs(this.mouse.x);
                this.camera.rotation.y += 0.02 * Math.abs(this.mouse.x);
                this.target.rotation.y += 0.02 * Math.abs(this.mouse.x);
            }
            else {
                this.fox.rotation.y -= 1 * this.mouse_deltax;
                this.camera.rotation.y -= 1 * this.mouse_deltax;
                this.target.rotation.y -= 1 * this.mouse_deltax;
                this.mouse_deltax = 0;
            }

            // if (this.lock === true) {
            //     this.fox.rotation.y += 0.004 * (0 - this.mouse.x);
            //     this.camera.rotation.y += 0.004 * (0 - this.mouse.x);
            //     if (this.shoot_point + 0.02 * (0 - this.mouse.y) >= 5 && this.shoot_point + 0.05 * (0 - this.mouse.y) <= 15)
            //         this.shoot_point += 0.02 * (0 - this.mouse.y) + this.fox.position.y;
            //     this.target.position.y = this.shoot_point


            // }


            let fox_direction = new THREE.Vector3();
            this.fox.getWorldDirection(fox_direction);
            fox_direction = fox_direction.normalize();
            this.camera.position.x = (this.fox.position.x - fox_direction.x * 20);
            this.camera.position.z = (this.fox.position.z - fox_direction.z * 20);
            this.target.position.x = (this.fox.position.x + fox_direction.x * 2);
            this.target.position.z = (this.fox.position.z + fox_direction.z * 2);



            //if (this.fox.position.y + (this.mouse.y + .95) * 10 > 5)
            this.target.position.y = this.fox.position.y + (this.mouse.y + .95) * 10;
            // else
            //     this.target.position.y = 5;

            //this.world.bodies[0].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.fox.rotation.y)

            this.pointer.position.y += Math.sin(elapsedTime * 4)
            this.pointer.rotation.y = elapsedTime * 2
            this.pointer2.position.y += Math.sin(elapsedTime * 4)
            this.pointer2.rotation.y = elapsedTime * 2
        }
        if (this.move_sw) {

            //console.log(this.mouse.y, this.target.position.y)
            // const raycaster = new THREE.Raycaster();
            // let pos = new THREE.Vector3();
            // let rayDirection = new THREE.Vector3();
            // this.fox.getWorldPosition(pos);
            // this.fox.getWorldDirection(rayDirection);
            // raycaster.set(pos, rayDirection.normalize());
            // const intersects = raycaster.intersectObjects(this.env.children, true);

            // for (const intersect of intersects) {
            //     if (intersect.distance < 1.6) {
            //         block = 1;
            //         break;
            //     }

            // }

            if (block === 0) {
                let data = {
                    type: 'move_forward',
                    z: Math.cos(this.fox.rotation.y) * 0.5,
                    x: Math.sin(this.fox.rotation.y) * 0.5
                }
                this.worker.postMessage(data);
                // this.world.bodies[0].position.z += Math.cos(this.fox.rotation.y) * 0.5;
                // this.world.bodies[0].position.x += Math.sin(this.fox.rotation.y) * 0.5;
            }

            if (this.mixer[3]) {
                this.mixer[3].update(deltaTime)
            }
        }
        else if (this.back_sw) {
            // const raycaster = new THREE.Raycaster();
            // let pos = new THREE.Vector3();
            // let rayDirection = new THREE.Vector3();
            // this.fox.getWorldPosition(pos);
            // this.fox.getWorldDirection(rayDirection);
            // rayDirection.x = 0 - rayDirection.x;
            // rayDirection.y = 0 - rayDirection.y;
            // rayDirection.z = 0 - rayDirection.z;
            // raycaster.set(pos, rayDirection.normalize());
            // const intersects = raycaster.intersectObjects(this.env.children, true);

            // for (const intersect of intersects) {
            //     if (intersect.distance < 1.6) {
            //         block = 1;
            //         break;
            //     }

            // }
            if (block === 0) {

                let data = {
                    type: 'move_backward',
                    z: Math.cos(this.fox.rotation.y) * 0.5,
                    x: Math.sin(this.fox.rotation.y) * 0.5
                }
                this.worker.postMessage(data);
                // this.world.bodies[0].position.z -= Math.cos(this.fox.rotation.y) * 0.5;
                // this.world.bodies[0].position.x -= Math.sin(this.fox.rotation.y) * 0.5;
            }

            if (this.mixer[2]) {
                this.mixer[2].update(deltaTime)
            }
        }
        else {
            if (this.mixer[1]) {
                this.mixer[1].update(deltaTime)

            }
        }

        if (this.right_sw && block == 0) {
            let data = {
                type: 'move_right',
                rz: Math.cos(this.fox.rotation.y + Math.PI / 2) * 0.5,
                rx: Math.sin(this.fox.rotation.y + Math.PI / 2) * 0.5
            }
            this.worker.postMessage(data);

            // this.world.bodies[0].position.z -= Math.cos(this.fox.rotation.y + Math.PI / 2) * 0.5;
            // this.world.bodies[0].position.x -= Math.sin(this.fox.rotation.y + Math.PI / 2) * 0.5;
            if (this.mixer[2] && !this.move_sw) {
                this.mixer[2].update(deltaTime)
            }
        }

        else if (this.left_sw && block == 0) {
            let data = {
                type: 'move_left',
                lz: Math.cos(this.fox.rotation.y - Math.PI / 2) * 0.5,
                lx: Math.sin(this.fox.rotation.y - Math.PI / 2) * 0.5
            }
            this.worker.postMessage(data);
            // this.world.bodies[0].position.z -= Math.cos(this.fox.rotation.y - Math.PI / 2) * 0.5;
            // this.world.bodies[0].position.x -= Math.sin(this.fox.rotation.y - Math.PI / 2) * 0.5;
            if (this.mixer[2] && !this.move_sw) {
                this.mixer[2].update(deltaTime)
            }

        }
        if (this.shoot_sw) {

            this.shoot_audio.pause();
            this.shoot_audio.currentTime = 0;


            this.start_shoot_time = elapsedTime;
            this.shoot();
        }
        if (elapsedTime - this.start_shoot_time < 1) {
            if (this.mixer[0]) {
                this.mixer[0].update(deltaTime);
            }
        }



        this.renderer.render(this.scene, this.camera);

        this.stats.end()
    }
}

export { App };