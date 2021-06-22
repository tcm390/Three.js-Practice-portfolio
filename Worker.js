
import './libs/cannon.min.js';
import * as THREE from './libs/three/three.module.js';
let mouse = new THREE.Vector2();
let bulletToUpdate = [];
let objects_positionToUpdate = [];
let objects_quaternionToUpdate = []
let world = new CANNON.World()
let defaultMaterial = new CANNON.Material('default')
world.gravity.set(0, -982, 0)


const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 1,
        restitution: .7
    }
)
world.defaultContactMaterial = defaultContactMaterial

const foxShape = new CANNON.Box(new CANNON.Vec3(0.9, 1.2, 2.4))
const foxBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(-10, 0, 0),
    shape: foxShape,
    material: defaultMaterial
})
world.addBody(foxBody)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

// shoot
// const duckBodyShape = new CANNON.Box(new CANNON.Vec3(40, 40, 20));
// const duckBody = new CANNON.Body({
//     mass: 0,
//     position: new CANNON.Vec3(10, 0, 10),
//     shape: duckBodyShape,
//     material: defaultMaterial
// });
// world.addBody(duckBody)

self.addEventListener('message', function (e) {
    //self.postMessage(e.data);
    //this.console.log(e.data)
    if (e.data === 'ready') {
        setTimeout(() => {
            world.gravity.set(0, -9.82, 0);
        }, 1000);
    }
    if (e.data.type === 'time') {
        world.step(1 / 60, e.data.deltaTime, 3)
    }

    else if (e.data === 'getfox') {
        //world.bodies[0].position.y += 1;
        const test = {
            type: e.data,
            pos: world.bodies[0].position
        }
        self.postMessage(test);

    }
    else if (e.data.type === 'shoot') {
        let bull_shape = new CANNON.Sphere(0.2)
        let bull_body = new CANNON.Body({
            mass: 20,
            shape: bull_shape
        })
        bull_body.position.copy(e.data.foxposition)
        let dum = e.data.dum;
        bull_body.velocity.set(
            dum.x * 100,
            ((Math.sin(mouse.y + 0.15) * Math.abs(dum.z)) + (Math.sin(mouse.y + 0.15) * Math.abs(dum.x))) * 50,
            dum.z * 100);

        bull_body.position.y += 5;

        world.addBody(bull_body)
        bulletToUpdate.push(bull_body)

    }
    else if (e.data.type === 'mouse') {
        mouse = e.data.mouse
        //this.console.log(mouse)
    }
    else if (e.data === 'getbullet') {
        //world.bodies[0].position.y += 1;
        let pos = [];
        for (let i = 0; i < bulletToUpdate.length; i++) {
            pos.push(bulletToUpdate[i].position.x)
            pos.push(bulletToUpdate[i].position.y)
            pos.push(bulletToUpdate[i].position.z)
        }
        const test = {
            type: e.data,
            bulletToUpdate: pos
        }
        self.postMessage(test);

    }
    else if (e.data.type === 'quaternion') {
        world.bodies[0].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), e.data.quaternion);
    }
    else if (e.data.type === 'move_forward') {
        world.bodies[0].position.z += e.data.z;
        world.bodies[0].position.x += e.data.x;
    }
    else if (e.data.type === 'move_backward') {
        world.bodies[0].position.z -= e.data.z;
        world.bodies[0].position.x -= e.data.x;
    }
    else if (e.data.type === 'move_right') {
        world.bodies[0].position.z -= e.data.rz;
        world.bodies[0].position.x -= e.data.rx;
    }
    else if (e.data.type === 'move_left') {
        world.bodies[0].position.z -= e.data.lz;
        world.bodies[0].position.x -= e.data.lx;
    }
    else if (e.data.type === 'clean_bullet') {
        bulletToUpdate.splice(e.data.index, 3)
        this.console.log(bulletToUpdate)
    }
    else if (e.data.type === 'shootable') {
        let shape = new CANNON.Box(new CANNON.Vec3(e.data.sizex / 2, e.data.sizey / 2, e.data.sizez / 2))
        let body = new CANNON.Body({
            mass: 50,
            shape: shape,
            material: defaultMaterial,
            angularDamping: .4
        })
        body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        world.addBody(body)
        objects_positionToUpdate.push(body.position)
        objects_quaternionToUpdate.push(body.quaternion)
    }
    else if (e.data.type === 'basketball') {
        let ball_shape = new CANNON.Sphere(1)
        let body = new CANNON.Body({
            mass: 50,
            shape: ball_shape,
            position: new CANNON.Vec3(e.data.positionx, e.data.positiony, e.data.positionz),
            material: defaultMaterial,
            angularDamping: .4
        })
        //body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        world.addBody(body)
        objects_positionToUpdate.push(body.position)
        objects_quaternionToUpdate.push(body.quaternion)
    }

    else if (e.data === 'getshootable') {
        const test = {
            type: e.data,
            position: objects_positionToUpdate,
            quaternion: objects_quaternionToUpdate
        }
        self.postMessage(test);

    }

}, false);

