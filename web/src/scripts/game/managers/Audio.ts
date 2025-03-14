import { SoundType } from "../game.types";

export class AudioManager {
    private sounds: {
        background?: HTMLAudioElement;
        hit?: HTMLAudioElement;
        bounce?: HTMLAudioElement;
    } = {};

    constructor() {
        this.sounds.background = new Audio("assets/neon-gaming.mp3");
        this.sounds.background.loop = true;

        this.sounds.bounce = new Audio("assets/bounce.mp3");
        this.sounds.hit = new Audio("assets/hit.mp3");
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
