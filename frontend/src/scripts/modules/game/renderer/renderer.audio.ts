import {
    type AudioEngineV2,
    CreateAudioEngineAsync,
    CreateSoundAsync,
    CreateStreamingSoundAsync,
    type StaticSound,
} from "@babylonjs/core";

// #region: Sound configs
const bgMusicConfig: SoundConfig = {
    name: "bgMusic",
    src: `${window.cfg.dir.audio}/neon-gaming.mp3`,
    options: { loop: true, autoplay: true, volume: 0.5 },
};

const hitSoundConfig: SoundConfig = {
    name: "hitSound",
    src: `${window.cfg.dir.audio}/hit.mp3`,
    options: { maxInstances: 2, volume: 0.8, spatialEnabled: true },
};

const bounceSoundConfig: SoundConfig = {
    name: "bounceSound",
    src: `${window.cfg.dir.audio}/bounce.mp3`,
    options: { maxInstances: 2, volume: 0.8, spatialEnabled: true },
};

const blopSoundConfig: SoundConfig = {
    name: "blopSound",
    src: `${window.cfg.dir.audio}/blop.mp3`,
    options: { maxInstances: 2, pitch: 1.5, spatialEnabled: true },
};

const ballSoundConfig: SoundConfig = {
    name: "ballSound",
    src: `${window.cfg.dir.audio}/tatata.mp3`,
    options: { maxInstances: 2, playbackRate: 1.5, spatialEnabled: true },
};

// #endregion

/** Create a static sound on the engine */
const createSound = async (
    engine: AudioEngineV2,
    { name, src, options }: SoundConfig
): Promise<StaticSound> => {
    const sound = await CreateSoundAsync(name, src, options, engine);
    return sound;
};

export const createAudioEngine = async () => {
    const engine = await CreateAudioEngineAsync();
    await engine.unlockAsync();

    // Attach background music to audio engine
    const { name, src, options } = bgMusicConfig;
    engine.bgMusic = await CreateStreamingSoundAsync(name, src, options, engine);

    // Attach static sounds to audio engine
    engine.hitSound = await createSound(engine, hitSoundConfig);
    engine.bounceSound = await createSound(engine, bounceSoundConfig);
    engine.blopSound = await createSound(engine, blopSoundConfig);
    engine.ballSound = await createSound(engine, ballSoundConfig);

    return engine;
};
