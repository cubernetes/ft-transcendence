import fs from "fs";
// import path from "path";
import player from "play-sound";
import { MENU_MUSIC, PADDLE_SOUND, SCORE_SOUND, WALL_SOUND, userOptions } from "../utils/config";

// Initialize audio player
const audioPlayer = player({});

type AudioDestination = "music" | "effect";

export class AudioManager {
    private musicProcess: any = null;
    private effectProcesses: Map<string, any> = new Map();
    private soundEffects: Map<string, string> = new Map();
    private musicTracks: Map<string, string> = new Map();
    private loopMusic: boolean = false;

    private currentlyPlaying: string | null = null;

    constructor() {
        // Register sound effects
        this.soundEffects.set(PADDLE_SOUND, "src/content/hit.mp3");
        this.soundEffects.set(WALL_SOUND, "src/content/bounce.mp3");
        this.soundEffects.set(SCORE_SOUND, "src/content/score.mp3");
        this.soundEffects.set("blop", "src/content/blop.mp3");

        // Register background music tracks
        this.musicTracks.set(MENU_MUSIC, "src/content/menu.mp3");
        this.musicTracks.set("normal", "src/content/neon-gaming.mp3");
        this.musicTracks.set("stylish", "src/content/stylish_game.mp3");
        this.musicTracks.set("crazy", "src/content/crazy_game.mp3");

        // this.checkAudioBackend();
        process.on("exit", () => this.stopMusic());
        process.on("SIGINT", () => process.exit());
    }

    // /**
    //  * Try playing to ensure a backend is available
    //  */
    // private checkAudioBackend(): void {
    //     const dummyFile = this.soundEffects.values().next().value;
    //     if (!dummyFile || !fs.existsSync(dummyFile)) return;
    //     audioPlayer.play(dummyFile, (err) => {
    //         if (err) {
    //             console.warn(
    //                 "⚠️  Audio backend unavailable (afplay/mplayer/mpg123 required).",
    //                 err.message
    //             );
    //         }
    //     });
    // }

    /**
     * Play a sound effect once
     * @param effectName - Name of the sound effect to play
     */
    playSoundEffect(effectName: string): void {
        if (!userOptions.sfx) return;

        const soundPath = this.soundEffects.get(effectName);
        if (!soundPath || !fs.existsSync(soundPath)) {
            console.error(`Sound effect "${effectName}" not found`);
            return;
        }

        const existing = this.effectProcesses.get(effectName);
        if (existing && typeof existing.kill === "function") {
            existing.kill();
            existing.on?.("exit", () => {
                this.launchEffect(effectName, soundPath);
            });
        } else {
            this.launchEffect(effectName, soundPath);
        }
    }

    private launchEffect(effectName: string, soundPath: string): void {
        const process = audioPlayer.play(soundPath, (err) => {
            if (err) console.error(`Effect error (${effectName}):`, err);
            this.effectProcesses.delete(effectName);
        });
        this.effectProcesses.set(effectName, process);
    }

    /**
     * Start playing background music based on the current play style
     */
    async startMusic(style?: string): Promise<void> {
        if (!userOptions.music) {
            this.stopMusic();
            return;
        }

        const track = style ?? userOptions.playStyle;
        if (this.currentlyPlaying === track) return;

        await this.stopMusic();

        const musicPath = this.musicTracks.get(track);
        if (!musicPath || !fs.existsSync(musicPath)) {
            console.error(`Music track for style "${track}" not found or missing file`);
            return;
        }

        this.currentlyPlaying = track;
        this.playAudio(musicPath, "music");
    }

    /**
     * Stop background music
     */
    async stopMusic(): Promise<void> {
        this.loopMusic = false;

        if (this.musicProcess && typeof this.musicProcess.kill === "function") {
            const proc = this.musicProcess;
            return new Promise<void>((resolve) => {
                proc.once("exit", () => {
                    this.musicProcess = null;
                    this.currentlyPlaying = null;
                    resolve();
                });
                proc.kill();
            });
        } else {
            this.musicProcess = null;
            this.currentlyPlaying = null;
            return Promise.resolve();
        }
    }

    /**
     * Play audio (either sound effect or background music)
     * @param audioPath - Path to the audio file
     * @param loop - Whether the audio should loop or not
     */
    private playAudio(audioPath: string, destination: AudioDestination): void {
        const child = audioPlayer.play(audioPath, (err) => {
            if (err) {
                console.error(`Error playing audio (${audioPath}):`, err);
                this.loopMusic = false;
            }
        });

        if (destination === "music") {
            this.musicProcess = child;
            this.loopMusic = true;

            child.on("exit", (code) => {
                if (this.loopMusic && code === 0) {
                    setTimeout(() => {
                        if (this.loopMusic) {
                            this.playAudio(audioPath, "music");
                        }
                    }, 100);
                }
            });
        }
    }
}

// Singleton export
const audioManager = new AudioManager();
export default audioManager;
