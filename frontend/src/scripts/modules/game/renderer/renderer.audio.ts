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
    options: { volume: 1 },
};

const bounceSoundConfig: SoundConfig = {
    name: "bounceSound",
    src: `${window.cfg.dir.audio}/bounce.mp3`,
    options: { volume: 1 },
};

const blopSoundConfig: SoundConfig = {
    name: "blopSound",
    src: `${window.cfg.dir.audio}/blop.mp3`,
    options: { pitch: 1.5 },
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
    // Configuration
    const volume = 1.0;

    const engine = await CreateAudioEngineAsync();
    await engine.unlockAsync();
    await engine.createMainBusAsync("mainBus", { volume });

    const { name, src, options } = bgMusicConfig;
    engine.bgMusic = await CreateStreamingSoundAsync(name, src, options, engine);

    engine.hitSound = await createSound(engine, hitSoundConfig);
    engine.bounceSound = await createSound(engine, bounceSoundConfig);
    engine.blopSound = await createSound(engine, blopSoundConfig);

    return engine;
};
