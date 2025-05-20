import { Result, err, ok } from "neverthrow";
import {
    type AudioEngineV2,
    CreateAudioEngineAsync,
    CreateSoundAsync,
    CreateStreamingSoundAsync,
    type StaticSound,
} from "@babylonjs/core";

// #region: Sound configs
type SoundConfig = {
    name: string;
    src: string;
    options: Record<string, unknown>;
};

const bgmConfig: SoundConfig = {
    name: "bgMusic",
    src: `${CONST.DIR.AUDIO}/neon-gaming.mp3`,
    options: { loop: true, autoplay: false, volume: 0.5 },
};

const hitSoundConfig: SoundConfig = {
    name: "hitSound",
    src: `${CONST.DIR.AUDIO}/hit.mp3`,
    options: { maxInstances: 2, volume: 0.8, spatialEnabled: true },
};

const bounceSoundConfig: SoundConfig = {
    name: "bounceSound",
    src: `${CONST.DIR.AUDIO}/bounce.mp3`,
    options: { maxInstances: 2, volume: 0.8, spatialEnabled: true },
};

const blopSoundConfig: SoundConfig = {
    name: "blopSound",
    src: `${CONST.DIR.AUDIO}/blop.mp3`,
    options: { maxInstances: 2, pitch: 1.5, spatialEnabled: true },
};

const ballSoundConfig: SoundConfig = {
    name: "ballSound",
    src: `${CONST.DIR.AUDIO}/tatata.mp3`,
    options: { maxInstances: 2, playbackRate: 1.5, spatialEnabled: true },
};
// #endregion

const checkAudioAvailable = async (url: string): Promise<boolean> => {
    try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
    } catch {
        return false;
    }
};

/** Create a static sound on the engine */
const createSound = async (
    engine: AudioEngineV2,
    { name, src, options }: SoundConfig
): Promise<StaticSound> => {
    const sound = await CreateSoundAsync(name, src, options, engine);
    return sound;
};

export const createAudioEngine = async (): Promise<Result<AudioEngineV2, string>> => {
    // Check all sounds are available on the server
    const srcs = [
        bgmConfig.src,
        hitSoundConfig.src,
        bounceSoundConfig.src,
        blopSoundConfig.src,
        ballSoundConfig.src,
    ];
    for (const s of srcs) {
        const ifExists = await checkAudioAvailable(s);
        if (!ifExists) return err(`Fail to create audio engine: sound ${s} doesn't exist`);
    }

    const engine = await CreateAudioEngineAsync();
    await engine.unlockAsync();

    // Attach background music to audio engine
    const { name, src, options } = bgmConfig;
    engine.bgMusic = await CreateStreamingSoundAsync(name, src, options, engine);

    // Attach static sounds to audio engine
    engine.hitSound = await createSound(engine, hitSoundConfig);
    engine.bounceSound = await createSound(engine, bounceSoundConfig);
    engine.blopSound = await createSound(engine, blopSoundConfig);
    engine.ballSound = await createSound(engine, ballSoundConfig);

    return ok(engine);
};
