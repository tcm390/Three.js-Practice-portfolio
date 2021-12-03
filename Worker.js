

let mouse = new THREE.Vector2();
let bulletToUpdate = [];
let objects_positionToUpdate = [];
let objects_quaternionToUpdate = []
let world = new CANNON.World()
let defaultMaterial = new CANNON.Material('default')
world.gravity.set(0, -982, 0)


const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    {
        friction: .1,
        restitution: 1,
    }
)
world.defaultContactMaterial = defaultContactMaterial

const ball_floor = new CANNON.ContactMaterial(
    defaultMaterial,

    { friction: .1, restitution: 0.7 }
);

// const ball_wall = new CANNON.ContactMaterial(
//     Ball.contactMaterial,
//     Table.wallContactMaterial,
//     { friction: 0.5, restitution: 0.9 }
// );
const foxShape = new CANNON.Box(new CANNON.Vec3(1.5, 2, 2.4))
const foxBody = new CANNON.Body({
    mass: 10000,
    position: new CANNON.Vec3(0, 0, 0),
    shape: foxShape,
    material: defaultMaterial
})
world.addBody(foxBody)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.material = ball_floor;
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
        }, 3000);
    }
    if (e.data.type === 'time') {
        world.step(1 / 60, e.data.deltaTime, 10)
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
        let bull_shape = new CANNON.Sphere(0.4)
        let bull_body = new CANNON.Body({
            mass: 800,
            shape: bull_shape
        })
        bull_body.position.copy(e.data.foxposition)
        let dum = e.data.dum;

        bull_body.velocity.set(
            dum.x * 110,
            ((Math.sin(e.data.shoot_point + 0.18) * Math.abs(dum.z)) + (Math.sin(e.data.shoot_point + 0.18) * Math.abs(dum.x))) * 55,
            //((Math.sin((e.data.shoot_point - 7)) * Math.abs(dum.z)) + (Math.sin((e.data.shoot_point - 7)) * Math.abs(dum.x))) * 100,
            //e.data.shoot_point.y - 5,
            dum.z * 110);


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
        world.removeBody(bulletToUpdate[e.data.index])
        bulletToUpdate.splice(e.data.index, 1)
        //this.console.log(bulletToUpdate)
    }
    else if (e.data.type === 'shootable') {
        let shape = new CANNON.Box(new CANNON.Vec3(e.data.sizex / 2, e.data.sizey / 2, e.data.sizez / 2))
        let body = new CANNON.Body({
            mass: 800,
            shape: shape,
            material: defaultMaterial,
            angularDamping: .4
        })
        body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        world.addBody(body)
        objects_positionToUpdate.push(body.position)
        objects_quaternionToUpdate.push(body.quaternion)
    }
    else if (e.data.type === 'static_object') {
        let shape = new CANNON.Box(new CANNON.Vec3(e.data.sizex / 2, e.data.sizey / 2, e.data.sizez / 2))
        let body = new CANNON.Body({
            mass: 0,
            shape: shape,
            material: defaultMaterial
        })

        body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        if (e.data.quaternionx)
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), e.data.quaternionx);
        if (e.data.quaterniony)
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), e.data.quaterniony);
        if (e.data.quaternionz)
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), e.data.quaternionz);
        world.addBody(body)

    }
    else if (e.data.type === 'static_object_cylinder') {
        let shape = new CANNON.Cylinder(e.data.size_b, e.data.size_t, e.data.height, e.data.segment)
        let body = new CANNON.Body({
            mass: 0,
            shape: shape,
            material: defaultMaterial
        })

        body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        if (e.data.quaternionx)
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), e.data.quaternionx);
        if (e.data.quaterniony)
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), e.data.quaterniony);
        if (e.data.quaternionz)
            body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), e.data.quaternionz);
        world.addBody(body)

    }
    else if (e.data.type === 'static_object_sphere') {
        let shape = new CANNON.Sphere(e.data.radius)
        let body = new CANNON.Body({
            mass: 0,
            shape: shape,
            material: defaultMaterial
        })

        body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        world.addBody(body)

    }
    else if (e.data.type === 'road') {
        let shape = new CANNON.Box(new CANNON.Vec3(e.data.sizex / 2, e.data.sizey / 2, e.data.sizez / 2))
        let body = new CANNON.Body({
            mass: 500,
            shape: shape,
            material: defaultMaterial,
            angularDamping: .4
        })
        body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        world.addBody(body)
        objects_positionToUpdate.push(body.position)
        objects_quaternionToUpdate.push(body.quaternion)
    }

    else if (e.data.type === 'poolball') {
        let ball_shape = new CANNON.Sphere(e.data.radius)
        let body = new CANNON.Body({
            mass: 1000,
            shape: ball_shape,
            position: new CANNON.Vec3(e.data.positionx, e.data.positiony, e.data.positionz),
            material: defaultMaterial,
            angularDamping: .2
        })
        //body.position.set(e.data.positionx, e.data.positiony, e.data.positionz);
        body.collisionResponse = 0.1;
        body.addEventListener("collide", (co) => {
            //console.log(co.contact, body.position.y)
            //co.contact.rj.y = 0;
            co.contact.ri.y = 5;
            //body.position.y = 1.8
        });
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

