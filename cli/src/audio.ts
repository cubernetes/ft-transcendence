import { ChildProcess, spawn } from "child_process";
import fs from "fs";
import { getStartedMenuMusic, setStartedMenuMusic } from "./index";
import { userOptions } from "./options";

export class AudioManager {
    private musicProcess: ChildProcess | null = null;
    private soundEffectProcess: ChildProcess | null = null;
    private soundEffects: Map<string, string> = new Map();
    private musicTracks: Map<string, string> = new Map();
    private loopMusic: boolean = false;

    constructor() {
        // Register sound effects
        this.soundEffects.set("paddle_hit", "src/content/hit.wav");
        this.soundEffects.set("wall_hit", "src/content/bounce.wav");
        this.soundEffects.set("score", "src/content/score.wav");
        this.soundEffects.set("blop", "src/content/blop.wav");

        // Register background music tracks
        this.musicTracks.set("menu", "src/content/menu.wav");
        this.musicTracks.set("normal", "src/content/neon-gaming.wav");
        this.musicTracks.set("stylish", "src/content/stylish_game.wav");
        this.musicTracks.set("crazy", "src/content/crazy_game.wav");
    }

    /**
     * Play a sound effect once
     */
    playSoundEffect(effectName: string): void {
        if (!userOptions.sfx) {
            return;
        }
        if (!this.soundEffects.has(effectName)) {
            console.error(`Sound effect "${effectName}" not found`);
            return;
        }

        this.playAudio(this.soundEffects.get(effectName)!, false, "effect");
    }

    /**
     * Start playing background music based on the current play style
     */
    startMusic(name: string = ""): void {
        if (!userOptions.music) {
            return;
        }
        this.stopMusic(); // Ensure no duplicate tracks are playing

        const trackName = name || userOptions.playStyle;
        if (!this.musicTracks.has(trackName)) {
            console.error(`Music track for "${trackName}" not found`);
            return;
        }

        this.loopMusic = true;
        this.playAudio(this.musicTracks.get(trackName)!, true, "music");
    }

    /**
     * Play audio (either sound effect or background music)
     * @param audioPath - Path to the audio file
     * @param loop - Whether the audio should loop or not
     */
    private playAudio(audioPath: string, loop: boolean, destination: "music" | "effect"): void {
        if (!fs.existsSync(audioPath)) {
            console.error(`Audio file not found: ${audioPath}`);
            return;
        }

        // Base arguments
        const args = ["-q", audioPath];
        if (destination === "music") {
            args.splice(1, 0, "--buffer-size=96000", "--period-size=48000");
        }

        // Kill previous instance cleanly (if any)
        if (destination === "music" && this.musicProcess) {
            this.musicProcess.kill("SIGTERM");
            this.musicProcess = null; // Clean up the process reference
        } else if (destination === "effect" && this.soundEffectProcess) {
            this.soundEffectProcess.kill("SIGTERM");
            this.soundEffectProcess = null;
        }

        const child = spawn("aplay", args, { stdio: "ignore" });

        if (destination === "music") {
            child.on("exit", (code, signal) => {
                // if (code !== null && code !== 0) {
                //     console.warn(`'aplay' exited with code ${code}`);
                // } else if (signal !== null) {
                //     console.warn(`'aplay' was terminated by signal ${signal}`);
                // }
                // Only restart the music if it was not manually stopped (exit code 0)
                if (loop && this.loopMusic && code === 0) {
                    this.playAudio(audioPath, loop, destination);
                }
            });
            this.musicProcess = child;
        } else {
            this.soundEffectProcess = child;
        }
    }

    /**
     * Stop the currently playing background music
     */
    stopMusic(): void {
        if (this.musicProcess) {
            this.loopMusic = false;
            this.musicProcess.kill("SIGTERM");
            this.musicProcess = null;
        }
    }

    /**
     * Update audio settings when options change
     */
    updateAudioSettings(): void {
        if (userOptions.music) {
            if (!getStartedMenuMusic()) {
                this.startMusic("menu");
                setStartedMenuMusic(true);
            }
        } else {
            this.stopMusic();
            setStartedMenuMusic(false);
        }
    }
}

// Export a singleton instance
export const audioManager = new AudioManager();
