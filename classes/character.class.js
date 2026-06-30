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

    /**
     * Creates the character, loads all needed images
     * and starts the movement and animation loops.
     */
    constructor() {
        super();
        this.loadImage(this.IMAGES_IDLE[0]);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.animate();
    }

    /**
     * Starts two separate intervals: one for movement and gravity,
     * one for choosing the current animation frame.
     */
    animate() {
        setInterval(() => {
            this.moveCharacter();
            this.applyGravity();
        }, 1000 / 60);

        setInterval(() => {
            this.playCharacterAnimation();
        }, 100);
    }

    /**
     * Reads the keyboard state and moves the character left or right.
     * Jumping is triggered here as well, as long as he is on the ground.
     */
    moveCharacter() {
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
     * Stops him exactly at ground level once he lands again.
     */
    applyGravity() {
        if (this.speedY === undefined) {
            this.speedY = 0;
        }
        this.y -= this.speedY;
        this.speedY -= 1;

        if (this.y > 130) {
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
     * Picks the correct animation depending on the current state
     * of the character: jumping, walking or standing idle.
     */
    playCharacterAnimation() {
        if (this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
        } else if (this.world.keyboard.right || this.world.keyboard.left) {
            this.playAnimation(this.IMAGES_WALKING);
        } else {
            this.playAnimation(this.IMAGES_IDLE);
        }
    }

    /**
     * Reduces the character's energy after being hit by an enemy.
     * A short cooldown prevents losing energy multiple times
     * for what is really just one single touch.
     */
    hit() {
        let now = new Date().getTime();
        let cooldownPassed = now - this.lastHit > 1000;
        if (cooldownPassed) {
            this.energy = Math.max(this.energy - 5, 0);
            this.lastHit = now;
        }
    }
}
