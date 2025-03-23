import player from "play-sound";
import path from "path";
import { userOptions } from "./options";

// Initialize audio player
const audioPlayer = player({});

export class AudioManager {
    private musicProcess: any = null;
    private soundEffects: Map<string, string> = new Map();
    private musicTracks: Map<string, string> = new Map();
    private loopMusic: boolean = false;

    constructor() {
        // Register sound effects
        this.soundEffects.set("paddle_hit", "src/content/hit.mp3");
        this.soundEffects.set("wall_hit", "src/content/bounce.mp3");
        this.soundEffects.set("score", "src/content/score.mp3");
        this.soundEffects.set("blop", "src/content/blop.mp3");

        // Register background music tracks
        this.musicTracks.set("normal", "src/content/neon-gaming.mp3");
        this.musicTracks.set("stylish", "src/content/stylish_game.mp3");
        this.musicTracks.set("crazy", "src/content/crazy_game.mp3");
    }

    /**
     * Play a sound effect once
     */
    playSoundEffect(effectName: string): void {
        if (!this.soundEffects.has(effectName)) {
            console.error(`Sound effect "${effectName}" not found`);
            return;
        }

        const soundPath = path.resolve(this.soundEffects.get(effectName)!);

        // Play sound without volume adjustment
        this.playAudio(soundPath, false, "effect");
    }

    /**
     * Start playing background music based on the current play style
     */
    startMusic(): void {
        if (!userOptions.music) return;

        this.stopMusic();

        const trackName = userOptions.playStyle;
        if (!this.musicTracks.has(trackName)) {
            console.error(`Music track for "${trackName}" style not found`);
            return;
        }

        const musicPath = path.resolve(this.musicTracks.get(trackName)!);

        // Play music with looping if possible
        this.playAudio(musicPath, true, "music");
    }

    /**
     * Play audio (either sound effect or background music)
     * @param audioPath - Path to the audio file
     * @param loop - Whether the audio should loop or not
     */
    private playAudio(audioPath: string, loop: boolean, destination: "music" | "effect"): void {
        const child = audioPlayer.play(audioPath, (err) => {
            if (err) console.error(`Error playing audio: ${err}`);
            this.loopMusic = false;
            return;
        });

        if (destination === "music") {
            if (this.musicProcess && typeof this.musicProcess.kill === "function") {
                this.musicProcess.kill();
            }
            this.musicProcess = child;

            if (loop) {
                this.loopMusic = true;
                child.on("exit", () => {
                    if (this.loopMusic) {
                        this.playAudio(audioPath, loop, "music"); // restart loop
                    }
                });
            }
        }
    }

    /**
     * Stop the currently playing background music
     */
    stopMusic(): void {
        this.loopMusic = false;
        if (this.musicProcess && typeof this.musicProcess.kill === "function") {
            this.musicProcess.kill();
        }
        this.musicProcess = null;
    }

    /**
     * Update audio settings when options change
     */
    updateAudioSettings(): void {
        if (userOptions.music) {
            this.startMusic(); // Restart music with new settings
        } else {
            this.stopMusic();
        }
    }
}

// Export a singleton instance
export const audioManager = new AudioManager();
