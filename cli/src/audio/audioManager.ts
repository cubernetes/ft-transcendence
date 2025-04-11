import fs from "fs";
// import path from "path";
import player from "play-sound";
import { userOptions } from "../utils/config";

// import { userOptions } from "./options";

// Initialize audio player
const audioPlayer = player({});

type AudioDestination = "music" | "effect";

export class AudioManager {
    private musicProcess: any = null;
    private effectProcesses: Map<string, any> = new Map();
    private soundEffects: Map<string, string> = new Map();
    private musicTracks: Map<string, string> = new Map();
    private loopMusic: boolean = false;
    private currentStyle: string = "normal";

    constructor() {
        // Register sound effects
        this.soundEffects.set("paddle_hit", "src/content/hit.mp3");
        this.soundEffects.set("wall_hit", "src/content/bounce.mp3");
        this.soundEffects.set("score", "src/content/score.mp3");
        this.soundEffects.set("blop", "src/content/blop.mp3");

        // Register background music tracks
        this.musicTracks.set("menu", "src/content/menu.mp3");
        this.musicTracks.set("normal", "src/content/neon-gaming.mp3");
        this.musicTracks.set("stylish", "src/content/stylish_game.mp3");
        this.musicTracks.set("crazy", "src/content/crazy_game.mp3");

        this.checkAudioBackend();
    }

    /**
     * Try playing to ensure a backend is available
     */
    private checkAudioBackend(): void {
        audioPlayer.play("", (err) => {
            if (err) {
                console.warn(
                    "⚠️  Audio backend unavailable (afplay/mplayer/mpg123 required).",
                    err.message
                );
            }
        });
    }

    /**
     * Play a sound effect once
     */
    playSoundEffect(effectName: string): void {
        const soundPath = this.soundEffects.get(effectName);
        if (!soundPath || !fs.existsSync(soundPath)) {
            console.error(`Sound effect "${effectName}" not found`);
            return;
        }

        const existing = this.effectProcesses.get(effectName);
        if (existing && typeof existing.kill === "function") {
            existing.kill(); // Stop any existing sound effect
        }

        const process = audioPlayer.play(soundPath, (err) => {
            if (err) console.error(`Effect error (${effectName}):`, err);
            this.effectProcesses.delete(effectName);
        });

        this.effectProcesses.set(effectName, process);
    }

    /**
     * Start playing background music based on the current play style
     */
    startMusic(style: string = ""): void {
        this.stopMusic();
        const track = style || this.currentStyle;

        const musicPath = this.musicTracks.get(track);
        if (!musicPath || !fs.existsSync(musicPath)) {
            console.error(`Music track for style "${track}" not found or missing file`);
            return;
        }

        this.currentStyle = track;
        this.playAudio(musicPath, true, "music");
    }

    /**
     * Stop background music
     */
    stopMusic(): void {
        this.loopMusic = false;
        if (this.musicProcess && typeof this.musicProcess.kill === "function") {
            this.musicProcess.kill();
        }
        this.musicProcess = null;
    }

    /**
     * Update audio settings externally
     */
    updateAudioSettings(): void {
        if (userOptions.music) {
            this.startMusic(MENU_MUSIC);
        } else {
            this.stopMusic();
        }
    }

    /**
     * Play audio (either sound effect or background music)
     * @param audioPath - Path to the audio file
     * @param loop - Whether the audio should loop or not
     */
    private playAudio(audioPath: string, loop: boolean, destination: AudioDestination): void {
        const child = audioPlayer.play(audioPath, (err) => {
            if (err) console.error(`Error playing audio (${audioPath}):`, err);
            this.loopMusic = false;
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
}

// Singleton export
const audioManager = new AudioManager();
// Object.freeze(audioManager);
export default audioManager;
