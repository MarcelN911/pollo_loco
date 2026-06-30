/**
 * A normal walking chicken enemy.
 * Walks to the left until it gets stomped on by the character,
 * then switches to its dead image and stops moving.
 */
class Chicken extends MovableObject {
    static DEFAULT_WALKING_IMAGES = [
        "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
    ];
    static DEFAULT_DEAD_IMAGE = "img/3_enemies_chicken/chicken_normal/2_dead/dead.png";

    y = 350;
    width = 70;
    height = 70;
    isDead = false;
    offset = { top: 4, left: 4, right: 4, bottom: 4 };

    /**
     * @param {number} x - Starting position inside the level.
     * @param {string[]} [walkingImages] - Custom walking animation, used by ChickenSmall.
     * @param {string} [deadImage] - Custom dead image, used by ChickenSmall.
     */
    constructor(x, walkingImages, deadImage) {
        super();
        this.x = x;
        this.walkingImages = walkingImages || Chicken.DEFAULT_WALKING_IMAGES;
        this.deadImage = deadImage || Chicken.DEFAULT_DEAD_IMAGE;
        this.speed = 0.15 + Math.random() * 0.25;
        this.loadImage(this.walkingImages[0]);
        this.loadImages(this.walkingImages);
        this.animate();
    }

    /**
     * Starts the movement and animation loops for this chicken.
     */
    animate() {
        setInterval(() => {
            this.moveIfAlive();
        }, 1000 / 60);

        setInterval(() => {
            this.playWalkingAnimationIfAlive();
        }, 200);
    }

    /**
     * Moves the chicken to the left, but only as long as it is alive.
     * The chicken image already faces left by default, so it must
     * not be flipped the way moveLeft() flips the character.
     */
    moveIfAlive() {
        if (!this.isDead) {
            this.moveLeft();
            this.otherDirection = false;
        }
    }

    /**
     * Plays the walking animation, but only as long as it is alive.
     */
    playWalkingAnimationIfAlive() {
        if (!this.isDead) {
            this.playAnimation(this.walkingImages);
        }
    }

    /**
     * Marks this chicken as dead and shows its dead image.
     * The movement and animation loops stop by themselves
     * because they check isDead before doing anything.
     */
    die() {
        this.isDead = true;
        this.loadImage(this.deadImage);
    }
}
