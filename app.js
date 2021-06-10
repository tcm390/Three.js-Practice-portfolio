import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { FBXLoader } from './libs/three/jsm/FBXLoader.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { LoadingBar } from './libs/LoadingBar.js';
import './libs/cannon.min.js';
import Stats from './libs/stats.js/src/Stats.js'
//import { PointerLockControls } from './libs/three/jsm/PointerLockControls.js'

//import CANNON from './libs/cannon.min.js'
//import * as CANNON from './libs/cannon-es'
class App {

    constructor() {

        const container = document.createElement('div');
        document.body.appendChild(container);

        // const canvas = document.querySelector('div')
        // console.log(canvas)

        // canvas.requestPointerLock = canvas.requestPointerLock ||
        //     canvas.mozRequestPointerLock;

        // document.exitPointerLock = document.exitPointerLock ||
        //     document.mozExitPointerLock;

        // canvas.onclick = function () {
        //     canvas.requestPointerLock();
        // };
        // document.addEventListener('pointerlockchange', lockChangeAlert, false);
        // document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
        // function lockChangeAlert() {
        //     if (document.pointerLockElement === canvas ||
        //         document.mozPointerLockElement === canvas) {
        //         console.log('The pointer lock status is now locked');
        //         // window.addEventListener('keydown', move_function);
        //         // window.addEventListener('keyup', remove_function);

        //     } else {
        //         console.log('The pointer lock status is now unlocked');
        //         // window.removeEventListener("keydown", move_function);
        //         // window.removeEventListener('keyup', remove_function)
        //         // moveForward = false;
        //         // moveBackward = false;
        //         // moveLeft = false;
        //         // moveRight = false;

        //     }
        // }



        this.stats = new Stats()
        this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)
        const self = this


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



        this.clock = new THREE.Clock();
        this.previousTime = 0;
        this.mixer = [];
        this.degree_y = 0;
        this.right_sw = 0;
        this.left_sw = 0;
        this.move_sw = 0;
        this.back_sw = 0;
        this.shoot_sw = 0;

        this.objectsToUpdate = [];
        this.bulletToUpdate = [];




        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 150);
        this.camera.position.set(0, 8, -14);
        this.camera.rotation.x += Math.PI * 2




        this.scene = new THREE.Scene();
        //this.scene.background = new THREE.Color(0xaaaaaa);

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        light.position.set(100, 100, 100);
        light.shadow.camera.top = 50
        light.shadow.camera.right = 100
        light.shadow.camera.bottom = - 50
        light.shadow.camera.left = - 100
        //light.shadow.camera.near = 1
        light.shadow.camera.far = 300
        light.shadow.mapSize.width = 1024 * 4
        light.shadow.mapSize.height = 1024 * 4
        light.castShadow = true
        this.scene.add(light);
        //const directionalLightCameraHelper = new THREE.CameraHelper(light.shadow.camera)
        //this.scene.add(directionalLightCameraHelper)

        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000),
            new THREE.MeshPhongMaterial({ color: 0xFF9999, depthWrite: false })
        );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        mesh.position.y += 2;
        this.scene.add(mesh);

        var grid = new THREE.GridHelper(2000, 400, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);

        const fog = new THREE.Fog('#262837', 1, 50)
        //this.scene.fog = fog

        for (let i = 0; i < 100; i++) {
            const geometry = new THREE.BoxBufferGeometry(3, 3, 3);
            const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
            const cubeMesh = new THREE.Mesh(geometry, material);
            cubeMesh.position.set(Math.random() * 200 - 100, 0, Math.random() * 200 - 100);
            cubeMesh.castShadow = true;
            this.scene.add(cubeMesh);


            const shape = new CANNON.Box(new CANNON.Vec3(3 / 2, 3 / 2, 3 / 2))
            const body = new CANNON.Body({
                mass: 10,
                shape: shape,
                material: defaultMaterial
            })
            body.position.copy(cubeMesh.position)
            this.world.addBody(body)

            this.objectsToUpdate.push({
                mesh: cubeMesh,
                body: body
            });
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setClearColor('#262837')
        container.appendChild(this.renderer.domElement);
        //this.setEnvironment();

        this.loadingBar = new LoadingBar();

        // this.controls2 = new PointerLockControls(this.camera, canvas);
        // this.controls2.maxPolarAngle = 1.9
        // this.controls2.minPolarAngle = 1.7

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 3.5, 0);
        this.controls.enableRotate = false;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        // this.controls.update();

        window.addEventListener('resize', this.resize.bind(this));


        this.mouse = new THREE.Vector2()
        window.addEventListener('mousemove', e => {
            this.mouse.x = event.clientX / window.innerWidth * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
            //console.log(this.mouse.x, this.mouse.y);
            if (this.fox) {
                if (Math.abs(this.mouse.x) < 0.5) {
                    this.camera.rotation.y = this.mouse.x;
                    if (Math.abs(this.mouse.x) < 0.2)
                        this.fox.rotation.y = this.true_fox_ry - this.mouse.x * 2.8;
                }
            }

            if (this.mouse.y > 0 && this.mouse.y < 0.5) {
                this.camera.rotation.x = 0 - (this.mouse.y - 0.4) / 2;
                this.camera.rotation.x += Math.PI;
            }


        });
        window.addEventListener("click", () => {
            this.shoot();
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
        this.loadFox();
        this.loadEnvironment();

        //###### prevent ########
        window.setTimeout(function () {
            self.world.gravity.set(0, -9.82, 0)
        }, 1000);

        //test
        const tgeometry = new THREE.BoxBufferGeometry(0.01, .01, .02);
        const tmaterial = new THREE.MeshStandardMaterial();
        const tcubeMesh = new THREE.Mesh(tgeometry, tmaterial);
        tcubeMesh.position.set(0, 0, 0);
        this.test = tcubeMesh;
        this.scene.add(tcubeMesh);
        tcubeMesh.add(this.camera);

    }
    loadEnvironment() {
        const gltfLoader = new GLTFLoader();
        let self = this;

        gltfLoader.load(
            './assets/glTF4/Duck.gltf',
            (gltf) => {
                self.env = gltf.scene;
                //self.objectsToUpdate.push(self.env);
                gltf.scene.scale.set(5, 5, 5)
                gltf.scene.position.set(10, 0, 10);
                self.scene.add(gltf.scene)

                self.loadingBar.visible = false;
                self.renderer.setAnimationLoop(self.render.bind(self));
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

    loadFox() {

        const gltfLoader = new GLTFLoader();

        let self = this;
        gltfLoader.load(
            './assets/glTF/Fox.gltf',
            (gltf) => {
                self.fox = gltf.scene;
                this.true_fox_ry = self.fox.rotation.y;
                //console.log(gltf);
                gltf.scene.scale.set(0.025, 0.025, 0.025)
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {

                        child.castShadow = true;


                    }
                });
                self.scene.add(gltf.scene)
                self.mixer.push(new THREE.AnimationMixer(gltf.scene))
                self.mixer.push(new THREE.AnimationMixer(gltf.scene))
                const action = self.mixer[0].clipAction(gltf.animations[2])
                action.play()
                const action2 = self.mixer[1].clipAction(gltf.animations[0])
                action2.play()
                self.loadingBar.visible = false;

                self.renderer.setAnimationLoop(self.render.bind(self));
            },
            function (xhr) {

                self.loadingBar.progress = (xhr.loaded / xhr.total);

            }
        )
    }

    resize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    shoot() {
        if (this.world) {
            const sphereGeometry = new THREE.SphereGeometry(0.2)
            const sphereMaterial = new THREE.MeshStandardMaterial()
            const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
            mesh.castShadow = true
            mesh.position.copy(this.fox.position)
            mesh.position.y += 1;
            this.scene.add(mesh)

            const shape = new CANNON.Sphere(0.2)
            const body = new CANNON.Body({
                mass: 1,
                shape: shape
            })

            body.position.copy(this.fox.position)
            let dum = new THREE.Vector3();
            let dum2 = new THREE.Vector3();
            if (this.mouse.y >= 0.3)
                body.velocity.set(
                    this.fox.getWorldDirection(dum).x * 100,
                    (1 / 0.048) * 2,
                    this.fox.getWorldDirection(dum).z * 100);
            if (this.mouse.y > 0.1 && this.mouse.y < 0.3)
                body.velocity.set(
                    this.fox.getWorldDirection(dum).x * 100,
                    (1 / (this.camera.getWorldDirection(dum2).y)) * 2,
                    this.fox.getWorldDirection(dum).z * 100);
            else if (this.mouse.y < 0.1)
                body.velocity.set(
                    this.fox.getWorldDirection(dum).x * 100,
                    this.fox.getWorldDirection(dum).y * 100,
                    this.fox.getWorldDirection(dum).z * 100);


            body.position.y += 1;
            //console.log(this.camera.getWorldDirection(dum2).y);

            this.world.addBody(body)
            this.bulletToUpdate.push({
                mesh: mesh,
                body: body
            })
        }
    }
    render() {


        this.stats.begin()

        const elapsedTime = this.clock.getElapsedTime()
        const deltaTime = elapsedTime - this.previousTime
        this.previousTime = elapsedTime
        this.world.step(1 / 60, deltaTime, 3)
        let block = 0;
        if (this.fox && this.world.bodies.length >= 2) {
            this.fox.position.copy(this.world.bodies[1].position);
            this.test.position.copy(this.world.bodies[1].position);
            // this.test.quaternion.copy(this.world.bodies[1].quaternion)
            //this.fox.quaternion.copy(this.world.bodies[1].quaternion)
            //this.env.position.copy(this.world.bodies[0].position);
            //this.env.quaternion.copy(this.world.bodies[0].quaternion);
            // this.test.position.copy(this.world.bodies[0].position);
            // this.test.quaternion.copy(this.world.bodies[0].quaternion)
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
                }

            }
            if (this.shoot_sw === 1) {
                this.shoot();
            }




        }
        if (this.move_sw) {


            // const raycaster = new THREE.Raycaster();
            // let pos = new THREE.Vector3();
            // let rayDirection = new THREE.Vector3();
            // this.fox.getWorldPosition(pos);
            // this.fox.getWorldDirection(rayDirection);
            // raycaster.set(pos, rayDirection.normalize());
            // const intersects = raycaster.intersectObjects(this.env.children[0].children);
            // for (const intersect of intersects) {
            //     if (intersect.distance < 1.6) {
            //         block = 1;
            //         break;
            //     }

            // }
            if (block === 0) {
                //this.fox.position.z += Math.cos(this.fox.rotation.y) * 0.1;
                this.world.bodies[1].position.z += Math.cos(this.fox.rotation.y) * 0.2;
                //this.camera.position.z += Math.cos(this.fox.rotation.y) * 0.2;
                //this.fox.position.x += Math.sin(this.fox.rotation.y) * 0.1;
                this.world.bodies[1].position.x += Math.sin(this.fox.rotation.y) * 0.2;
                //this.camera.position.x += Math.sin(this.fox.rotation.y) * 0.2;
                //this.controls.target.set(this.fox.position.x, 3.5, this.fox.position.z);
                //this.controls.target.set(this.world.bodies[1].position.x, 3.5, this.world.bodies[1].position.z);
                //this.controls.update();
            }

            if (this.mixer[0]) {
                this.mixer[0].update(deltaTime)
            }
        }
        else if (this.back_sw) {
            const raycaster = new THREE.Raycaster();
            let pos = new THREE.Vector3();
            let rayDirection = new THREE.Vector3();
            this.fox.getWorldPosition(pos);
            this.fox.getWorldDirection(rayDirection);
            rayDirection.x = 0 - rayDirection.x;
            rayDirection.y = 0 - rayDirection.y;
            rayDirection.z = 0 - rayDirection.z;
            raycaster.set(pos, rayDirection.normalize());
            const intersects = raycaster.intersectObjects(this.env.children[0].children);

            for (const intersect of intersects) {
                if (intersect.distance < 1.6) {
                    block = 1;
                    break;
                }

            }
            if (block === 0) {
                //this.fox.position.z += Math.cos(this.fox.rotation.y) * 0.1;
                this.world.bodies[1].position.z -= Math.cos(this.fox.rotation.y) * 0.2;
                //this.camera.position.z -= Math.cos(this.fox.rotation.y) * 0.2;
                //this.fox.position.x += Math.sin(this.fox.rotation.y) * 0.1;
                this.world.bodies[1].position.x -= Math.sin(this.fox.rotation.y) * 0.2;
                //this.camera.position.x -= Math.sin(this.fox.rotation.y) * 0.2;
                //this.controls.target.set(this.fox.position.x, 3.5, this.fox.position.z);
                //this.controls.target.set(this.world.bodies[1].position.x, 3.5, this.world.bodies[1].position.z);
                //this.controls.update();
            }

            if (this.mixer[0]) {
                this.mixer[0].update(deltaTime)
            }
        }
        else {
            if (this.mixer[1]) {
                this.mixer[1].update(deltaTime)
            }
        }

        if (this.right_sw) {
            this.true_fox_ry -= 0.03
            this.fox.rotation.y = this.true_fox_ry;
            //this.fox.rotation.y -= 0.03;
            this.test.rotation.y -= 0.03;
            if (this.world.bodies.length > 1)
                this.world.bodies[1].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.fox.rotation.y)
            if (Math.abs(this.mouse.x) < 0.4) {
                this.camera.rotation.y = this.mouse.x;
                this.fox.rotation.y = this.true_fox_ry - this.mouse.x * 2.8;
            }
        }

        if (this.left_sw) {
            this.true_fox_ry += 0.03
            this.fox.rotation.y = this.true_fox_ry;
            //this.fox.rotation.y += 0.03;
            this.test.rotation.y += 0.03;
            if (this.world.bodies.length > 1)
                this.world.bodies[1].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.fox.rotation.y)
            if (Math.abs(this.mouse.x) < 0.4) {
                this.camera.rotation.y = this.mouse.x;
                this.fox.rotation.y = this.true_fox_ry - this.mouse.x * 2.8;
            }
        }


        this.renderer.render(this.scene, this.camera);

        this.stats.end()
    }
}

export { App };