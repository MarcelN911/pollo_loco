/**
 * A bottle that has been thrown by the character.
 * Spins through the air following a small arc, then splashes
 * either on the ground or when it hits an enemy.
 */
class ThrowableObject extends MovableObject {
    width = 60;
    height = 60;
    speed = 7;
    speedY = 20;
    hasSplashed = false;
    offset = { top: 10, left: 10, right: 10, bottom: 10 };

    IMAGES_ROTATION = [
        "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    ];

    IMAGES_SPLASH = [
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
    ];

    /**
     * @param {number} x - Starting position, usually the character's position.
     * @param {number} y - Starting height, usually the character's hand height.
     * @param {boolean} otherDirection - True if it should fly to the left.
     */
    constructor(x, y, otherDirection) {
        super();
        this.loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);
        this.loadImages(this.IMAGES_SPLASH);
        this.x = x;
        this.y = y;
        this.throwDirection = otherDirection ? -1 : 1;
        this.animate();
    }

    /**
     * Starts the two loops needed for the throw: one that moves the
     * bottle along its flight path, one that picks the animation frame.
     */
    animate() {
        this.moveIntervalId = setInterval(() => {
            this.updatePosition();
        }, 1000 / 60);

        this.animationIntervalId = setInterval(() => {
            this.playCurrentAnimation();
        }, 100);
    }

    /**
     * Stops both loops. Called once the splash animation has finished,
     * or when World is torn down, e.g. on restart.
     */
    stop() {
        clearInterval(this.moveIntervalId);
        clearInterval(this.animationIntervalId);
    }

    /**
     * Moves the bottle sideways and applies gravity to it,
     * until it reaches the ground and splashes.
     */
    updatePosition() {
        if (this.hasSplashed) {
            return;
        }
        this.x += this.speed * this.throwDirection;
        this.y -= this.speedY;
        this.speedY -= 1.5;
        if (this.y > 380) {
            this.y = 380;
            this.splash();
        }
    }

    /**
     * Plays the rotation animation while flying, or the splash
     * animation once the bottle has hit something.
     */
    playCurrentAnimation() {
        if (this.hasSplashed) {
            this.playAnimation(this.IMAGES_SPLASH);
        } else {
            this.playAnimation(this.IMAGES_ROTATION);
        }
    }

    /**
     * Switches the bottle into its splash state.
     * Resets the frame counter so the splash animation starts from frame one.
     */
    splash() {
        this.hasSplashed = true;
        this.currentImage = 0;
    }
}
