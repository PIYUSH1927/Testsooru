import * as t from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export class PlayerAnimation {
    idleAnimation: t.AnimationAction | undefined;
    walkAnimation: t.AnimationAction | undefined;
    currAnimation: t.AnimationAction | undefined;
    mixer: t.AnimationMixer;

    constructor(mixer: t.AnimationMixer) {
        this.mixer = mixer;
        // Use absolute paths from public directory
        this.loadAnimation("/character_idle.fbx", (action: t.AnimationAction) => {
            this.currAnimation = action;
            this.idleAnimation = action;
            this.currAnimation.play();
            console.log("Idle animation loaded successfully");
        });
        this.loadAnimation("/character_walk.fbx", (action: t.AnimationAction) => {
            this.walkAnimation = action;
            console.log("Walk animation loaded successfully");
        });
    }

    loadAnimation(path: string, onLoad: (action: t.AnimationAction) => void) {
        const loader = new FBXLoader();
        loader.load(path, (anim) => {
            const clip = anim.animations[0];
            onLoad(this.mixer.clipAction(clip));
        },
        (progress) => {
            console.log(`Loading animation ${path}: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error: any) => { 
            console.error(`Error loading animation ${path}:`, error); 
        });
    }

    setCurrentAnimation(animationAction: t.AnimationAction | undefined) {
        if (this.currAnimation !== animationAction && this.currAnimation && animationAction) {
            animationAction.reset();
            this.currAnimation.reset();
            this.currAnimation.play();
            this.currAnimation.crossFadeTo(animationAction, 0.5, true);
            animationAction.play();
            this.currAnimation = animationAction;
        }
    }

    update(delta: number, speed: number) {
        this.mixer.update(delta);
        if (speed > 0.1) this.setCurrentAnimation(this.walkAnimation);
        else this.setCurrentAnimation(this.idleAnimation);
    }
}