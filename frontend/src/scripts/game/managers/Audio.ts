import { SoundType } from "../game.types";
import { ASSETS_DIR } from "../../config";

export class AudioManager {
    private sounds: {
        background?: HTMLAudioElement;
        hit?: HTMLAudioElement;
        bounce?: HTMLAudioElement;
    } = {};

    constructor() {
        this.sounds.background = new Audio(`${ASSETS_DIR}/neon-gaming.mp3`);
        this.sounds.background.loop = true;
        this.sounds.background.onloadeddata = () => {
            this.sounds.background!.volume = 0.1;
        };

        this.sounds.bounce = new Audio(`${ASSETS_DIR}/bounce.mp3`);
        this.sounds.bounce.onloadeddata = () => {
            this.sounds.bounce!.volume = 0.1;
        };

        this.sounds.hit = new Audio(`${ASSETS_DIR}/hit.mp3`);
        this.sounds.hit.onloadeddata = () => {
            this.sounds.hit!.volume = 0.1;
        };
    }

    playSound(type: SoundType): void {
        const sound = this.sounds[type];
        if (sound) {
            if (type !== "background") sound.currentTime = 0;
            sound.play();
        }
    }

    stopSound(type: SoundType): void {
        const sound = this.sounds[type];
        if (sound && !sound.paused) {
            sound.pause();
            if (type !== "background") {
                sound.currentTime = 0;
            }
        }
    }

    stopAllSounds(): void {
        for (const key of Object.keys(this.sounds) as SoundType[]) {
            this.stopSound(key);
        }
    }

    toggleSound(type: SoundType): void {
        const sound = this.sounds[type];
        if (sound) {
            if (sound.paused) this.playSound(type);
            else this.stopSound(type);
        }
    }
}
