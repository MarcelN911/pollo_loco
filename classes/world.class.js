/**
 * Holds the whole playable world: character, background, clouds
 * and later enemies and items. Takes care of drawing everything
 * at the correct position and moving the camera along with the character.
 */
class World {
    character = new Character();
    endboss = new Endboss(2800);
    backgroundObjects = buildBackgroundObjects();
    clouds = buildClouds();
    enemies = buildEnemies();
    coins = buildCoins();
    bottles = buildBottles();
    throwableObjects = [];
    maxCoins = this.coins.length;
    maxBottles = 7;
    canvas;
    ctx;
    keyboard;
    soundManager;
    camera_x = 0;
    gameEnded = false;
    isDestroyed = false;
    isPaused = false;
    onGameEnd = null;

    /**
     * @param {HTMLCanvasElement} canvas - The canvas to draw on.
     * @param {Keyboard} keyboard - The keyboard state used by the character.
     * @param {SoundManager} soundManager - Plays every sound and the music.
     */
    constructor(canvas, keyboard, soundManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.keyboard = keyboard;
        this.soundManager = soundManager;
        this.collisionManager = new CollisionManager(this);
        this.createStatusBars();
        this.setWorld();
        this.bottleBar.setPercentage((this.character.bottles / this.maxBottles) * 100);
        this.draw();
        this.run();
    }

    /**
     * Creates the three fixed status bars shown in the top left corner
     * and the endboss bar centered at the top.
     */
    createStatusBars() {
        this.healthBar = new StatusBar("assets/img/7_statusbars/1_statusbar/2_statusbar_health/green", 20, 10);
        this.coinBar = new StatusBar("assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue", 20, 55);
        this.bottleBar = new StatusBar("assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange", 20, 100);
        let bossBarX = (this.canvas.width - 150) / 2;
        this.endbossBar = new StatusBar("assets/img/7_statusbars/2_statusbar_endboss/green", bossBarX, 10, "green");
    }

    /**
     * Gives the character and the endboss a reference back to this world.
     */
    setWorld() {
        this.character.world = this;
        this.endboss.world = this;
    }

    /**
     * Starts the logic loop that moves the camera, checks every kind
     * of collision and keeps the status bars in sync.
     */
    run() {
        this.gameIntervalId = setInterval(() => {
            this.updateCamera();
            this.collisionManager.checkAll();
            this.checkGameOutcome();
            this.healthBar.setPercentage(this.character.energy);
            this.endbossBar.setPercentage((this.endboss.energy / this.endboss.maxEnergy) * 100);
        }, 1000 / 60);
    }

    /**
     * Ends the game once the character or the endboss has died.
     * Does nothing if the game has already ended.
     */
    checkGameOutcome() {
        if (this.gameEnded) {
            return;
        }
        if (this.endboss.isDead()) {
            this.endGame(true);
        } else if (this.character.isDead()) {
            this.endGame(false);
        }
    }

    /**
     * Marks the game as finished and waits for the death animation to play
     * out before tearing the world down and notifying script.js through
     * the onGameEnd callback, which shows the matching end screen.
     * @param {boolean} won - True if the player defeated the endboss.
     */
    endGame(won) {
        this.gameEnded = true;
        if (won) {
            this.soundManager.playWin();
        } else {
            this.soundManager.playLose();
        }
        setTimeout(() => {
            this.destroy();
            if (this.onGameEnd) {
                this.onGameEnd(won);
            }
        }, 2000);
    }

    /**
     * Stops every loop owned directly or indirectly by this world, so
     * nothing keeps running in the background once it is torn down,
     * e.g. on restart or when returning to the home screen.
     */
    destroy() {
        this.isDestroyed = true;
        this.soundManager.pauseAllSounds();
        clearInterval(this.gameIntervalId);
        cancelAnimationFrame(this.animationFrameId);
        this.character.stop();
        this.endboss.stop();
        this.enemies.forEach((enemy) => enemy.stop());
        this.clouds.forEach((cloud) => cloud.stop());
        this.coins.forEach((coin) => coin.stop());
        this.throwableObjects.forEach((bottle) => bottle.stop());
    }

    /**
     * Pauses every moving part of the game: the main game loop, the draw
     * loop, every object's own movement/animation loops, and the sounds
     * that go with them. Called when the player opens the pause screen.
     */
    pauseGame() {
        this.isPaused = true;
        clearInterval(this.gameIntervalId);
        cancelAnimationFrame(this.animationFrameId);
        this.character.stop();
        this.endboss.stop();
        this.enemies.forEach((enemy) => enemy.stop());
        this.clouds.forEach((cloud) => cloud.stop());
        this.coins.forEach((coin) => coin.stop());
        this.throwableObjects.forEach((bottle) => bottle.stop());
        this.soundManager.pauseAllSounds();
    }

    /**
     * Resumes the game after it was paused: restarts every loop and
     * the sounds that go with them.
     */
    resumeGame() {
        this.isPaused = false;
        this.resumeAllObjects();
        this.run();
        this.draw();
        this.resumeSounds();
    }

    /**
     * Restarts the movement and animation loops of every object in the level.
     */
    resumeAllObjects() {
        this.character.animate();
        this.endboss.animate();
        this.endboss.resumeAttackCycle();
        this.enemies.forEach((enemy) => enemy.animate());
        this.clouds.forEach((cloud) => cloud.animate());
        this.coins.forEach((coin) => coin.animate());
        this.throwableObjects.forEach((bottle) => bottle.animate());
    }

    /**
     * Resumes the background music, and the snoring sound too if the
     * character was already asleep when the game got paused.
     */
    resumeSounds() {
        this.soundManager.startBackgroundMusic();
        if (this.character.isSleeping) {
            this.soundManager.startSnoring();
        }
    }

    /**
     * Follows the character with the camera, but never shows the
     * area before the start of the level (would just be black).
     */
    updateCamera() {
        let wantedCameraX = -this.character.x + 100;
        this.camera_x = Math.min(0, wantedCameraX);
    }

    /**
     * Spawns a thrown bottle in front of the character and removes
     * one bottle from the character's collected amount.
     * Called by the character when the throw key is pressed.
     */
    throwBottle() {
        this.character.bottles -= 1;
        this.bottleBar.setPercentage((this.character.bottles / this.maxBottles) * 100);
        let startX = this.character.x + 100;
        let startY = this.character.y + 100;
        let bottle = new ThrowableObject(startX, startY, this.character.otherDirection);
        this.throwableObjects.push(bottle);
        this.soundManager.playThrow();
    }

    /**
     * Clears the canvas and draws every layer in the correct order:
     * background, items and enemies in the world, the character on top,
     * and finally the status bars that always stay fixed on screen.
     */
    draw() {
        if (this.isDestroyed) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWorldObjects();
        this.drawStatusBars();
        this.scheduleNextFrame();
    }

    /**
     * Draws every object that lives inside the level and therefore moves
     * with the camera: background, items, enemies, the boss and the character.
     */
    drawWorldObjects() {
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.coins);
        this.addObjectsToMap(this.bottles);
        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.endboss);
        this.addToMap(this.character);
        this.ctx.translate(-this.camera_x, 0);
    }

    /**
     * Schedules the next animation frame, keeping the draw loop going.
     */
    scheduleNextFrame() {
        let self = this;
        this.animationFrameId = requestAnimationFrame(function () {
            self.draw();
        });
    }

    /**
     * Draws the three status bars and the endboss bar.
     * They are drawn outside of the camera translation,
     * so they always stay fixed on the screen.
     */
    drawStatusBars() {
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        if (this.endboss.isActivated) {
            this.addToMap(this.endbossBar);
        }
    }

    /**
     * Draws every object of a given array onto the canvas.
     * @param {MovableObject[]} objects - The objects to draw.
     */
    addObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addToMap(object);
        });
    }

    /**
     * Draws a single object, flipping it horizontally if it is
     * currently facing the other direction.
     * @param {MovableObject} movableObject - The object to draw.
     */
    addToMap(movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(movableObject);
        }
        this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y, movableObject.width, movableObject.height);
        if (movableObject.otherDirection) {
            this.flipImageBack(movableObject);
        }
    }

    /**
     * Mirrors the canvas before drawing a flipped object.
     * @param {MovableObject} movableObject - The object that is flipped.
     */
    flipImage(movableObject) {
        this.ctx.save();
        this.ctx.translate(movableObject.width, 0);
        this.ctx.scale(-1, 1);
        movableObject.x = movableObject.x * -1;
    }

    /**
     * Undoes the mirroring after a flipped object has been drawn.
     * @param {MovableObject} movableObject - The object that was flipped.
     */
    flipImageBack(movableObject) {
        movableObject.x = movableObject.x * -1;
        this.ctx.restore();
    }
}
