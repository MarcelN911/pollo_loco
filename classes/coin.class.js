/**
 * A coin that can be collected by the character.
 * Plays a small two-frame animation so it looks like it is shining.
 */
class Coin extends MovableObject {
    width = 80;
    height = 80;
    offset = { top: 10, left: 10, right: 10, bottom: 10 };

    IMAGES_COIN = ["assets/img/8_coin/coin_1.png", "assets/img/8_coin/coin_2.png"];

    /**
     * @param {number} x - Horizontal position inside the level.
     * @param {number} y - Vertical position inside the level.
     */
    constructor(x, y) {
        super();
        this.loadImage(this.IMAGES_COIN[0]);
        this.loadImages(this.IMAGES_COIN);
        this.x = x;
        this.y = y;
        this.animate();
    }

    /**
     * Starts the shining animation loop.
     */
    animate() {
        this.animationIntervalId = setInterval(() => {
            this.playAnimation(this.IMAGES_COIN);
        }, 300);
    }

    /**
     * Stops the shining animation. Called once this coin is collected,
     * or when World is torn down, e.g. on restart.
     */
    stop() {
        clearInterval(this.animationIntervalId);
    }
}
