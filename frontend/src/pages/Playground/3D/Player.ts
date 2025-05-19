import * as t from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { PlayerAnimation } from "./PlayerAnimation";
import { PlayerControl } from "./PlayerControl";

export class Player {
    playerAnimation: PlayerAnimation | undefined;
    playerControl: PlayerControl | undefined;
    model: t.Object3D | undefined;

    constructor(scene: t.Scene) {
        const loader = new FBXLoader();
        loader.load("character.fbx",
            (model: t.Object3D) => {
                this.onLoad(model);
                model.visible = false;
                scene.add(model);
                this.model = model;
            }, () => { }, (error: any) => console.log(error));
    }

    onLoad(model: t.Object3D): void {
        this.playerControl = new PlayerControl(model);
        model.scale.set(0.02, 0.02, 0.02);
        model.traverse(c => c.castShadow = true);
        const mixer = new t.AnimationMixer(model);
        this.playerAnimation = new PlayerAnimation(mixer);
        model.position.set(-10, 2.08, -10);
    }

    update(delta: number) {
        if (!this.model || !this.model.visible) return;
        this.playerControl?.update(delta);
        if (this.playerControl) this.playerAnimation?.update(delta, this.playerControl.speed);
    }
}
