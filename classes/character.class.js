/**
 * The playable character "Pepe".
 * Can walk left/right, jump and plays a different animation
 * depending on what he is currently doing.
 */
class Character extends MovableObject {
    width = 150;
    height = 290;
    y = 130;
    speed = 3;
    world;
    energy = 100;
    lastHit = 0;
    coins = 0;
    bottles = 2;
    lastThrow = 0;
    lastActivity = 0;
    deadAnimationFrame = 0;
    deadAnimationTickCounter = 0;
    offset = { top: 100, left: 20, right: 30, bottom: 10 };

    IMAGES_IDLE = [
        "img/2_character_pepe/1_idle/idle/I-1.png",
        "img/2_character_pepe/1_idle/idle/I-2.png",
        "img/2_character_pepe/1_idle/idle/I-3.png",
        "img/2_character_pepe/1_idle/idle/I-4.png",
        "img/2_character_pepe/1_idle/idle/I-5.png",
        "img/2_character_pepe/1_idle/idle/I-6.png",
        "img/2_character_pepe/1_idle/idle/I-7.png",
        "img/2_character_pepe/1_idle/idle/I-8.png",
        "img/2_character_pepe/1_idle/idle/I-9.png",
        "img/2_character_pepe/1_idle/idle/I-10.png",
    ];

    IMAGES_LONG_IDLE = [
        "img/2_character_pepe/1_idle/long_idle/I-11.png",
        "img/2_character_pepe/1_idle/long_idle/I-12.png",
        "img/2_character_pepe/1_idle/long_idle/I-13.png",
        "img/2_character_pepe/1_idle/long_idle/I-14.png",
        "img/2_character_pepe/1_idle/long_idle/I-15.png",
        "img/2_character_pepe/1_idle/long_idle/I-16.png",
        "img/2_character_pepe/1_idle/long_idle/I-17.png",
        "img/2_character_pepe/1_idle/long_idle/I-18.png",
        "img/2_character_pepe/1_idle/long_idle/I-19.png",
        "img/2_character_pepe/1_idle/long_idle/I-20.png",
    ];

    IMAGES_WALKING = [
        "img/2_character_pepe/2_walk/W-21.png",
        "img/2_character_pepe/2_walk/W-22.png",
        "img/2_character_pepe/2_walk/W-23.png",
        "img/2_character_pepe/2_walk/W-24.png",
        "img/2_character_pepe/2_walk/W-25.png",
        "img/2_character_pepe/2_walk/W-26.png",
    ];

    IMAGES_JUMPING = [
        "img/2_character_pepe/3_jump/J-31.png",
        "img/2_character_pepe/3_jump/J-32.png",
        "img/2_character_pepe/3_jump/J-33.png",
        "img/2_character_pepe/3_jump/J-34.png",
        "img/2_character_pepe/3_jump/J-35.png",
        "img/2_character_pepe/3_jump/J-36.png",
        "img/2_character_pepe/3_jump/J-37.png",
        "img/2_character_pepe/3_jump/J-38.png",
        "img/2_character_pepe/3_jump/J-39.png",
    ];

    IMAGES_HURT = [
        "img/2_character_pepe/4_hurt/H-41.png",
        "img/2_character_pepe/4_hurt/H-42.png",
        "img/2_character_pepe/4_hurt/H-43.png",
    ];

    IMAGES_DEAD = [
        "img/2_character_pepe/5_dead/D-51.png",
        "img/2_character_pepe/5_dead/D-52.png",
        "img/2_character_pepe/5_dead/D-53.png",
        "img/2_character_pepe/5_dead/D-54.png",
        "img/2_character_pepe/5_dead/D-55.png",
        "img/2_character_pepe/5_dead/D-56.png",
        "img/2_character_pepe/5_dead/D-57.png",
    ];

    /**
     * Creates the character, loads all needed images
     * and starts the movement and animation loops.
     */
    constructor() {
        super();
        this.loadImage(this.IMAGES_IDLE[0]);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.lastActivity = new Date().getTime();
        this.animate();
    }

    /**
     * Starts two separate intervals: one for movement and gravity,
     * one for choosing the current animation frame.
     */
    animate() {
        this.movementIntervalId = setInterval(() => {
            this.moveCharacter();
            this.applyGravity();
        }, 1000 / 60);

        this.animationIntervalId = setInterval(() => {
            this.playCharacterAnimation();
        }, 100);
    }

    /**
     * Stops both loops. Called by World when it is torn down,
     * e.g. on restart, so the character does not keep running in the background.
     */
    stop() {
        clearInterval(this.movementIntervalId);
        clearInterval(this.animationIntervalId);
    }

    /**
     * Reads the keyboard state and moves the character left or right.
     * Jumping is triggered here as well, as long as he is on the ground.
     * Does nothing at all once the character has died.
     */
    moveCharacter() {
        if (this.isDead()) {
            return;
        }
        this.updateActivityTimestamp();
        if (this.world.keyboard.right) {
            this.moveRight();
        }
        if (this.world.keyboard.left && this.x > 0) {
            this.moveLeft();
        }
        let wantsToJump = this.world.keyboard.space || this.world.keyboard.up;
        if (wantsToJump && !this.isAboveGround()) {
            this.jump();
        }
        this.tryThrowBottle();
    }

    /**
     * Remembers the current time as the last moment the player
     * actually pressed a key. Used to detect long idle periods.
     */
    updateActivityTimestamp() {
        let keyboard = this.world.keyboard;
        let isActive = keyboard.left || keyboard.right || keyboard.up || keyboard.space || keyboard.throw;
        if (isActive) {
            this.lastActivity = new Date().getTime();
        }
    }

    /**
     * Throws a bottle if the throw key is pressed, the character still
     * has bottles left, and the short cooldown since the last throw is over.
     */
    tryThrowBottle() {
        let now = new Date().getTime();
        let cooldownPassed = now - this.lastThrow > 400;
        let canThrow = this.world.keyboard.throw && this.bottles > 0 && cooldownPassed;
        if (canThrow) {
            this.world.throwBottle();
            this.lastThrow = now;
        }
    }

    /**
     * Gives the character an upward speed so he starts jumping.
     * Gravity will pull him back down again over time.
     */
    jump() {
        this.speedY = 15;
    }

    /**
     * Pulls the character down towards the ground every frame.
     * Stays exactly at ground level with speedY at 0 while standing,
     * instead of constantly nudging him below ground and snapping back.
     */
    applyGravity() {
        let isInTheAir = this.isAboveGround() || this.speedY > 0;
        if (isInTheAir) {
            this.y -= this.speedY;
            this.speedY -= 1;
        } else {
            this.y = 130;
            this.speedY = 0;
        }
    }

    /**
     * Tells us whether the character is currently in the air.
     * @returns {boolean} True if he is above ground level.
     */
    isAboveGround() {
        return this.y < 130;
    }

    /**
     * Picks the correct animation depending on the current state of the
     * character: dead, hurt, jumping, walking, sleeping or standing idle.
     */
    playCharacterAnimation() {
        if (this.isDead()) {
            this.playDeadAnimation();
        } else if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        } else if (this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
        } else if (this.world.keyboard.right || this.world.keyboard.left) {
            this.playAnimation(this.IMAGES_WALKING);
        } else if (this.isLongIdle()) {
            this.playAnimation(this.IMAGES_LONG_IDLE);
        } else {
            this.playAnimation(this.IMAGES_IDLE);
        }
    }

    /**
     * Tells us whether the player has not pressed any key for a while,
     * meaning the character should fall asleep.
     * @returns {boolean} True if nothing happened for 15 seconds.
     */
    isLongIdle() {
        let secondsSinceActivity = (new Date().getTime() - this.lastActivity) / 1000;
        return secondsSinceActivity > 15;
    }

    /**
     * Tells us whether the character has run out of energy.
     * @returns {boolean} True if the character is dead.
     */
    isDead() {
        return this.energy <= 0;
    }

    /**
     * Tells us whether the character was hit very recently,
     * so the short hurt animation should still be showing.
     * @returns {boolean} True if he was hit within the last 0.6 seconds.
     */
    isHurt() {
        let secondsSinceLastHit = (new Date().getTime() - this.lastHit) / 1000;
        return secondsSinceLastHit < 0.6;
    }

    /**
     * Plays the dead animation once, slower than the other animations,
     * and freezes on the last frame, where he has faded out completely.
     */
    playDeadAnimation() {
        let lastFrame = this.IMAGES_DEAD.length - 1;
        let frame = Math.min(this.deadAnimationFrame, lastFrame);
        this.img = this.imageCache[this.IMAGES_DEAD[frame]];
        this.advanceDeadAnimationFrame(lastFrame);
    }

    /**
     * Moves the dead animation forward by one frame, but only every
     * third call, so the fade-out plays slowly and stays visible.
     * @param {number} lastFrame - Index of the final dead animation frame.
     */
    advanceDeadAnimationFrame(lastFrame) {
        this.deadAnimationTickCounter++;
        let shouldAdvance = this.deadAnimationTickCounter % 3 === 0;
        if (shouldAdvance && this.deadAnimationFrame < lastFrame) {
            this.deadAnimationFrame++;
        }
    }

    /**
     * Reduces the character's energy after being hit by an enemy.
     * A short cooldown prevents losing energy multiple times for what
     * is really just one single touch. The damage matches exactly one
     * step of the status bar, so every hit is immediately visible.
     */
    hit() {
        let now = new Date().getTime();
        let cooldownPassed = now - this.lastHit > 1000;
        if (cooldownPassed) {
            this.energy = Math.max(this.energy - 20, 0);
            this.lastHit = now;
        }
    }
}
