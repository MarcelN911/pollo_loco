/**
 * Base class for everything that can move and be drawn on the canvas.
 * Character, Chicken, Endboss, Cloud and ThrowableObject will all
 * extend this class so they don't have to repeat the same logic.
 */
class MovableObject {
    x = 0;
    y = 0;
    width = 100;
    height = 100;
    img;
    speed = 0.15;
    otherDirection = false;
    currentImage = 0;
    imageCache = {};
    offset = { top: 0, left: 0, right: 0, bottom: 0 };

    /**
     * Loads a single image and stores it in this.img.
     * @param {string} path - Path to the image file.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Loads several images at once and stores them in the image cache,
     * so they can later be used for animations without reloading them.
     * @param {string[]} paths - Array of image paths.
     */
    loadImages(paths) {
        paths.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Moves this object to the right by its speed value.
     */
    moveRight() {
        this.x += this.speed;
        this.otherDirection = false;
    }

    /**
     * Moves this object to the left by its speed value.
     */
    moveLeft() {
        this.x -= this.speed;
        this.otherDirection = true;
    }

    /**
     * Switches the current image to the next frame of an animation.
     * Uses the modulo operator so the animation loops automatically.
     * @param {string[]} paths - Array of image paths for this animation.
     */
    playAnimation(paths) {
        let i = this.currentImage % paths.length;
        let path = paths[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Checks whether this object's hitbox overlaps with another object's
     * hitbox. The offset values shrink the box so it matches the visible
     * part of the sprite instead of the full, mostly transparent image.
     * @param {MovableObject} other - The object to check against.
     * @returns {boolean} True if the two hitboxes overlap.
     */
    isColliding(other) {
        let myLeft = this.x + this.offset.left;
        let myRight = this.x + this.width - this.offset.right;
        let myTop = this.y + this.offset.top;
        let myBottom = this.y + this.height - this.offset.bottom;

        let otherLeft = other.x + other.offset.left;
        let otherRight = other.x + other.width - other.offset.right;
        let otherTop = other.y + other.offset.top;
        let otherBottom = other.y + other.height - other.offset.bottom;

        return myRight > otherLeft && myBottom > otherTop && myLeft < otherRight && myTop < otherBottom;
    }
}
