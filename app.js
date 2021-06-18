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
        const modal = document.querySelector('.modal');
        const overlay = document.querySelector('.overlay');
        const btnCloseModal = document.querySelector('.close-modal');
        btnCloseModal.addEventListener('click', () => {
            modal.classList.add('hidden');
            overlay.classList.add('hidden');
            this.load_ready_sw = 1;
            this.window_listener();
            this.world.gravity.set(0, -9.82, 0);
        });
        //######### LoadingManager ###########
        this.loadingManager = new THREE.LoadingManager()
        this.loadingManager.onLoad = () => {
            modal.classList.remove('hidden');
            overlay.classList.remove('hidden');
            this.loadingBar.visible = false;
        }
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadingBar.progress = (itemsLoaded / itemsTotal);
        }



        const container = document.createElement('div');
        document.body.appendChild(container);


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
        this.right_sw = 0;
        this.left_sw = 0;
        this.move_sw = 0;
        this.back_sw = 0;
        this.shoot_sw = 0;

        this.objectsToUpdate = [];
        this.bulletToUpdate = [];

        this.loadingBar = new LoadingBar();

        this.mouse = new THREE.Vector2()


        //####### camera ########
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
        this.camera.position.set(0, 10, 0);
        this.camera.rotation.y += Math.PI;


        //######## scene #########
        this.scene = new THREE.Scene();
        this.scene.background = this.environmentMap;
        //this.scene.background = new THREE.Color(0xaaaaaa);


        //########## LIGHT ###########
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, .5);
        this.scene.add(hemisphereLight);


        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set(0, 0.1, -1)
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
        this.scene.add(light);
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





        this.create_physics_world();
        this.loadFox();
        this.loadEnvironment();
        this.renderer.setAnimationLoop(this.render.bind(this));


    }
    window_listener() {
        //########### Listener #########
        window.addEventListener('resize', this.resize.bind(this));

        window.addEventListener('mousemove', e => {
            this.mouse.x = event.clientX / window.innerWidth * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

        });

        window.addEventListener("click", () => {
            this.shoot_sw = 1;
        })

        window.addEventListener('keydown', (e) => {
            if (e.keyCode === 87 || e.key === 'ArrowUp')
                this.move_sw = 1;
            if (e.keyCode === 83 || e.key === 'ArrowDown')
                this.back_sw = 1;
            if (e.keyCode === 68 || e.key === 'ArrowRight')
                this.right_sw = 1;
            if (e.keyCode === 65 || e.key === 'ArrowLeft')
                this.left_sw = 1;
            if (e.key === ' ' || e.keyCode === 32)
                this.shoot_sw = 1;
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
        this.world = new CANNON.World()
        this.world.gravity.set(0, -900, 0)

        const defaultMaterial = new CANNON.Material('default')
        this.defaultMaterial = new CANNON.Material('default')
        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            {
                friction: .1,
                restitution: .7
            }
        )
        this.world.defaultContactMaterial = defaultContactMaterial


        const duckBodyShape = new CANNON.Box(new CANNON.Vec3(4, 4, 2));
        const duckBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(10, 0, 10),
            shape: duckBodyShape,
            material: defaultMaterial
        });
        this.world.addBody(duckBody)


        const foxShape = new CANNON.Box(new CANNON.Vec3(0.7, 1, 2.2))
        const foxBody = new CANNON.Body({
            mass: 150,
            position: new CANNON.Vec3(0, 0, 0),
            shape: foxShape,
            material: defaultMaterial
        })
        this.world.addBody(foxBody)

        const floorShape = new CANNON.Plane()
        const floorBody = new CANNON.Body()
        floorBody.mass = 0
        floorBody.addShape(floorShape)
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
        this.world.addBody(floorBody)

        // for (let i = 0; i < 100; i++) {
        //     const geometry = new THREE.BoxBufferGeometry(3, 3, 3);
        //     const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        //     const cubeMesh = new THREE.Mesh(geometry, material);
        //     cubeMesh.position.set(Math.random() * 200 - 100, 0, Math.random() * 200 - 100);
        //     cubeMesh.castShadow = true;
        //     this.scene.add(cubeMesh);


        //     const shape = new CANNON.Box(new CANNON.Vec3(3 / 2, 3 / 2, 3 / 2))
        //     const body = new CANNON.Body({
        //         mass: 10,
        //         shape: shape,
        //         material: defaultMaterial
        //     })
        //     body.position.copy(cubeMesh.position)
        //     this.world.addBody(body)

        //     this.objectsToUpdate.push({
        //         mesh: cubeMesh,
        //         body: body
        //     });
        // }
    }

    // loadEnvironment() {
    //     let self = this;
    //     const textureLoader = new THREE.TextureLoader()
    //     const bakedTexture = textureLoader.load('./assets/glTF2/baked.jpg')
    //     const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
    //     const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    //     const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
    //     bakedTexture.flipY = false
    //     bakedTexture.encoding = THREE.sRGBEncoding
    //     const dracoLoader = new DRACOLoader()
    //     //dracoLoader.setDecoderPath('draco/')

    //     // GLTF loader
    //     const gltfLoader = new GLTFLoader()
    //     gltfLoader.setDRACOLoader(dracoLoader)



    //     gltfLoader.load(
    //         './assets/glTF2/portal.glb',
    //         (gltf) => {
    //             const bakedMesh = gltf.scene.children.find((child) => child.name === 'baked')
    //             const portalLightMesh = gltf.scene.children.find((child) => child.name === 'Circle')
    //             const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'Cube011')
    //             const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'Cube014')
    //             bakedMesh.material = bakedMaterial
    //             portalLightMesh.material = portalLightMaterial
    //             poleLightAMesh.material = poleLightMaterial
    //             poleLightBMesh.material = poleLightMaterial
    //             gltf.scene.scale.set(5, 5, 5)
    //             gltf.scene.position.set(10, 0, 10)
    //             self.scene.add(gltf.scene)
    //         },
    //         (xhr) => {

    //             self.loadingBar.progress = (xhr.loaded / xhr.total);

    //         },
    //         // called when loading has errors
    //         (error) => {

    //             console.log('An error happened');
    //             console.log(error);

    //         }
    //     );
    // }
    loadEnvironment() {
        let self = this;
        const gltfLoader = new GLTFLoader(this.loadingManager)
        gltfLoader.load(
            './assets/glTF100/untitled.glb',
            (gltf) => {
                self.env = gltf.scene;
                //console.log(self.env)
                gltf.scene.scale.set(10, 10, 10)
                gltf.scene.position.set(10, 0, 10)
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        //child.receiveShadow = true;
                    }
                    if (child.isMesh && child.name === 'Cube001') {
                        //console.log(child.position)
                    }
                    if (child.isMesh && child.name === 'Plane001') {
                        const textureLoader = new THREE.TextureLoader()
                        const flagTexture = textureLoader.load('./assets/textures/nyu_logo/nyu.png')
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
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && child.name !== 'Plane') {
                        // child.material.envMap = self.environmentMap
                        // child.material.envMapIntensity = 1.5
                        // child.material.metalness = 0.8
                        // child.material.roughness = 0.3
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


        const fbxfLoader = new FBXLoader(this.loadingManager);
        let self = this;
        fbxfLoader.load(
            './assets/glTF100/spaceman.fbx',
            (object) => {
                self.fox = object;
                self.fox.scale.set(0.03, 0.03, 0.03)
                console.log(object)
                self.scene.add(object)
                //console.log(gltf.scene)
                //gltf.scene.scale.set(2, 2, 2)
                object.traverse(function (child) {
                    if (child.isMesh && child.name == 'spaceman') {
                        child.material.color = new THREE.Color(0x505050);
                        child.material.shininess = 0
                        //console.log(child);
                    }
                    else if (child.isMesh && child.name === 'polySurface21000') {
                        self.skateboard = child;

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
    }
    shoot() {
        if (this.load_ready_sw) {


            this.shoot_audio.play();


            const sphereGeometry = new THREE.SphereGeometry(0.2)
            const sphereMaterial = new THREE.MeshStandardMaterial()
            sphereMaterial.color = new THREE.Color(Math.random() * 3, Math.random() * 3, Math.random() * 3);

            const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
            //mesh.castShadow = true
            mesh.position.copy(this.fox.position)

            const shape = new CANNON.Sphere(0.2)
            const body = new CANNON.Body({
                mass: 1,
                shape: shape
            })

            body.position.copy(this.fox.position)
            let dum = new THREE.Vector3();
            this.fox.getWorldDirection(dum)
            //if (this.mouse.y >= -0.13)
            body.velocity.set(
                dum.x * 100,
                (1 + this.mouse.y * 1.2) * 13,
                dum.z * 100);
            // else {
            //     body.velocity.set(
            //         this.fox.getWorldDirection(dum).x * 100,
            //         this.fox.getWorldDirection(dum).y * 100,
            //         this.fox.getWorldDirection(dum).z * 100);
            // }
            body.position.y += 2;


            this.world.addBody(body)
            this.bulletToUpdate.push({
                mesh: mesh,
                body: body
            })
            this.scene.add(mesh)

            this.shoot_sw = 0;
        }
    }
    render() {


        this.stats.begin()

        const elapsedTime = this.clock.getElapsedTime()
        const deltaTime = elapsedTime - this.previousTime
        this.previousTime = elapsedTime
        this.world.step(1 / 60, deltaTime, 3)
        let block = 0;
        if (this.flagmaterial) {
            this.flagmaterial.uniforms.uTime.value = elapsedTime;
        }
        if (this.load_ready_sw) {

            this.fox.position.copy(this.world.bodies[1].position);

            for (let i = 0; i < this.objectsToUpdate.length; i++) {
                this.objectsToUpdate[i].mesh.position.copy(this.objectsToUpdate[i].body.position)
                this.objectsToUpdate[i].mesh.quaternion.copy(this.objectsToUpdate[i].body.quaternion)
            }
            for (let i = 0; i < this.bulletToUpdate.length; i++) {
                this.bulletToUpdate[i].mesh.position.copy(this.bulletToUpdate[i].body.position)
                this.bulletToUpdate[i].mesh.quaternion.copy(this.bulletToUpdate[i].body.quaternion)
                if (this.bulletToUpdate[i].body.position.y <= 1) {
                    this.scene.remove(this.bulletToUpdate[i].mesh)
                    this.world.removeBody(this.bulletToUpdate[i].body)
                    this.bulletToUpdate.splice(i, 1)

                }
            }

            if (this.mouse.x > 0.3 && this.mouse.y < 0.3) {
                this.fox.rotation.y -= 0.02 * Math.abs(this.mouse.x);
                this.camera.rotation.y -= 0.02 * Math.abs(this.mouse.x);
            }
            else if (this.mouse.x < -0.3 && this.mouse.y < 0.3) {
                this.fox.rotation.y += 0.02 * Math.abs(this.mouse.x);
                this.camera.rotation.y += 0.02 * Math.abs(this.mouse.x);
            }

            let fox_direction = new THREE.Vector3();
            this.fox.getWorldDirection(fox_direction);
            fox_direction = fox_direction.normalize();
            this.camera.position.x = (this.fox.position.x - fox_direction.x * 20);
            this.camera.position.z = (this.fox.position.z - fox_direction.z * 20);
            this.world.bodies[1].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.fox.rotation.y)


        }
        if (this.move_sw) {


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

                this.world.bodies[1].position.z += Math.cos(this.fox.rotation.y) * 0.5;
                this.world.bodies[1].position.x += Math.sin(this.fox.rotation.y) * 0.5;
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
            // const intersects = raycaster.intersectObjects(this.env.children[0].children);

            // for (const intersect of intersects) {
            //     if (intersect.distance < 1.6) {
            //         block = 1;
            //         break;
            //     }

            // }
            if (block === 0) {


                this.world.bodies[1].position.z -= Math.cos(this.fox.rotation.y) * 0.5;
                this.world.bodies[1].position.x -= Math.sin(this.fox.rotation.y) * 0.5;
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

        if (this.right_sw) {

            this.world.bodies[1].position.z -= Math.cos(this.fox.rotation.y + Math.PI / 2) * 0.5;
            this.world.bodies[1].position.x -= Math.sin(this.fox.rotation.y + Math.PI / 2) * 0.5;
            if (this.mixer[2] && !this.move_sw) {
                this.mixer[2].update(deltaTime)
            }
        }

        else if (this.left_sw) {
            this.world.bodies[1].position.z -= Math.cos(this.fox.rotation.y - Math.PI / 2) * 0.5;
            this.world.bodies[1].position.x -= Math.sin(this.fox.rotation.y - Math.PI / 2) * 0.5;
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