/**
 * A cloud that slowly drifts to the left, independent of the camera.
 * This creates a small parallax effect in the sky.
 */
class Cloud extends MovableObject {
    y = 0;
    width = 720;
    height = 480;

    /**
     * @param {number} x - Starting position inside the level.
     */
    constructor(x) {
        super();
        this.loadImage("assets/img/5_background/layers/4_clouds/1.png");
        this.x = x;
        this.animate();
    }

    /**
     * Starts the loop that slowly moves the cloud to the left.
     */
    animate() {
        this.moveIntervalId = setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
    }

    /**
     * Stops the movement loop. Called by World when it is torn down.
     */
    stop() {
        clearInterval(this.moveIntervalId);
    }
}
