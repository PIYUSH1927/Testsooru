import { MathUtils } from "three";
import * as t from "three";

interface Controls {
    moveForward: boolean;
    moveBackward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
};

export class PlayerControl {
    maxSpeed = 50;
    walkSpeed = 25;
    maxReverseSpeed = -50;
    frontAcceleration = 100;
    backAcceleration = 100;
    frontDecceleration = 100;
    angularSpeed = 2.5;
    speed = 0;
    bodyOrientation = 0;
    root: t.Object3D;
    controls: Controls;

    constructor(root: t.Object3D) {
        this.root = root;

        const controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false
        };

        function onKeyDown(event: KeyboardEvent) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': controls.moveForward = true; break;

                case 'ArrowDown':
                case 'KeyS': controls.moveBackward = true; break;

                case 'ArrowLeft':
                case 'KeyA': controls.moveLeft = true; break;

                case 'ArrowRight':
                case 'KeyD': controls.moveRight = true; break;
            }
        }

        function onKeyUp(event: KeyboardEvent) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': controls.moveForward = false; break;

                case 'ArrowDown':
                case 'KeyS': controls.moveBackward = false; break;

                case 'ArrowLeft':
                case 'KeyA': controls.moveLeft = false; break;

                case 'ArrowRight':
                case 'KeyD': controls.moveRight = false; break;
            }
        }
        this.controls = controls;
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

    }

    update(delta: number) {
        this.updateMovementModel(delta);
    }

    updateMovementModel(delta: number) {
        function exponentialEaseOut(k: number) { return k === 1 ? 1 : - Math.pow(2, - 10 * k) + 1; }

        const controls = this.controls;

        this.maxSpeed = this.walkSpeed;

        this.maxReverseSpeed = - this.maxSpeed;

        if (controls.moveForward) this.speed = MathUtils.clamp(this.speed + delta * this.frontAcceleration,
            this.maxReverseSpeed, this.maxSpeed);

        const dir = 1;

        if (controls.moveLeft) {
            this.bodyOrientation += delta * this.angularSpeed;
            this.speed = MathUtils.clamp(this.speed + dir * delta * this.frontAcceleration,
                this.maxReverseSpeed, this.maxSpeed);
        }

        if (controls.moveRight) {
            this.bodyOrientation -= delta * this.angularSpeed;
            this.speed = MathUtils.clamp(this.speed + dir * delta * this.frontAcceleration,
                this.maxReverseSpeed, this.maxSpeed);
        }

        if (!(controls.moveForward || controls.moveBackward)) {
            if (this.speed > 0) {
                const k = exponentialEaseOut(this.speed / this.maxSpeed);
                this.speed = MathUtils.clamp(this.speed - k * delta * this.frontDecceleration, 0, this.maxSpeed);
            } else {
                const k = exponentialEaseOut(this.speed / this.maxReverseSpeed);
                this.speed = MathUtils.clamp(this.speed + k * delta * this.backAcceleration, this.maxReverseSpeed, 0);
            }

        }

        const forwardDelta = this.speed * delta;

        this.root.position.x += Math.sin(this.bodyOrientation) * forwardDelta;
        this.root.position.z += Math.cos(this.bodyOrientation) * forwardDelta;

        this.root.rotation.y = this.bodyOrientation;
    }
}
