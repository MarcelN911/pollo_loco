/**
 * A single background layer image, positioned at a fixed spot in the level.
 * Several of these are placed next to each other to build the full
 * scrolling background without gaps.
 */
class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;

    /**
     * @param {string} imagePath - Path to the layer image.
     * @param {number} x - Horizontal position inside the level.
     */
    constructor(imagePath, x) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}
