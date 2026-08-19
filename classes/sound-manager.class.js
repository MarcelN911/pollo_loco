/**
 * Manages every sound effect and the background music.
 * Keeps track of whether sound is muted and remembers that choice
 * in localStorage, so it stays the same the next time the page loads.
 */
class SoundManager {
    isMuted = false;
    backgroundMusic;
    jumpSound;
    hurtSound;
    sleepingSound;
    coinSound;
    throwSound;
    bossHurtSound;
    winSound;
    loseSound;

    /**
     * Creates every sound used in the game and restores the mute
     * state that was saved during the last visit.
     */
    constructor() {
        this.isMuted = localStorage.getItem("muted") === "true";
        this.createSounds();
    }

    /**
     * Creates every Audio object used in the game.
     */
    createSounds() {
        this.backgroundMusic = this.createAudio("assets/audio/background_music.wav", true, 0.3);
        this.jumpSound = this.createAudio("assets/audio/jump.wav", false, 0.6);
        this.hurtSound = this.createAudio("assets/audio/hurt_character.wav", false, 0.6);
        this.sleepingSound = this.createAudio("assets/audio/sleeping.wav", true, 0.4);
        this.coinSound = this.createAudio("assets/audio/coin_pickup.wav", false, 0.6);
        this.throwSound = this.createAudio("assets/audio/bottle.wav", false, 0.6);
        this.bossHurtSound = this.createAudio("assets/audio/hurt_boss.wav", false, 0.6);
        this.winSound = this.createAudio("assets/audio/win.wav", false, 0.7);
        this.loseSound = this.createAudio("assets/audio/lose.wav", false, 0.7);
    }

    /**
     * Creates one Audio object with the given loop and volume settings.
     * @param {string} path - Path to the audio file.
     * @param {boolean} loop - Whether the sound should loop.
     * @param {number} volume - Volume from 0 to 1.
     * @returns {HTMLAudioElement} The ready-to-use audio element.
     */
    createAudio(path, loop, volume) {
        let audio = new Audio(path);
        audio.loop = loop;
        audio.volume = volume;
        return audio;
    }

    /**
     * Plays a sound from the start, unless the game is muted.
     * @param {HTMLAudioElement} audio - The sound to play.
     */
    playSound(audio) {
        if (this.isMuted) {
            return;
        }
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    /**
     * Plays the jump sound.
     */
    playJump() {
        this.playSound(this.jumpSound);
    }

    /**
     * Plays the sound for the character getting hurt.
     */
    playHurt() {
        this.playSound(this.hurtSound);
    }

    /**
     * Plays the coin pickup sound.
     */
    playCoin() {
        this.playSound(this.coinSound);
    }

    /**
     * Plays the bottle throw sound.
     */
    playThrow() {
        this.playSound(this.throwSound);
    }

    /**
     * Plays the sound for the endboss getting hurt.
     */
    playBossHurt() {
        this.playSound(this.bossHurtSound);
    }

    /**
     * Plays the win jingle.
     */
    playWin() {
        this.playSound(this.winSound);
    }

    /**
     * Plays the lose jingle.
     */
    playLose() {
        this.playSound(this.loseSound);
    }

    /**
     * Starts the snoring loop, unless the game is muted.
     */
    startSnoring() {
        if (this.isMuted) {
            return;
        }
        this.sleepingSound.play().catch(() => {});
    }

    /**
     * Stops the snoring loop and rewinds it to the start.
     */
    stopSnoring() {
        this.sleepingSound.pause();
        this.sleepingSound.currentTime = 0;
    }

    /**
     * Starts the background music loop, unless the game is muted.
     * Called once the player clicks the start button, since that
     * click is what allows the browser to play audio at all.
     */
    startBackgroundMusic() {
        if (this.isMuted) {
            return;
        }
        this.backgroundMusic.play().catch(() => {});
    }

    /**
     * Pauses every looping sound that might currently be playing.
     */
    pauseAllSounds() {
        this.backgroundMusic.pause();
        this.sleepingSound.pause();
    }

    /**
     * Mutes every sound and remembers that choice in localStorage.
     */
    muteAll() {
        this.isMuted = true;
        localStorage.setItem("muted", "true");
        this.pauseAllSounds();
    }

    /**
     * Unmutes every sound, remembers that choice in localStorage,
     * and resumes the background music.
     */
    unmuteAll() {
        this.isMuted = false;
        localStorage.setItem("muted", "false");
        this.backgroundMusic.play().catch(() => {});
    }

    /**
     * Switches between muted and unmuted.
     * @returns {boolean} True if the game is muted after this call.
     */
    toggleMute() {
        if (this.isMuted) {
            this.unmuteAll();
        } else {
            this.muteAll();
        }
        return this.isMuted;
    }
}
