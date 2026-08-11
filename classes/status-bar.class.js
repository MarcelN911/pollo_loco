/**
 * A bar shown fixed on screen (health, coins or bottles) that displays
 * a percentage by switching between a fixed set of bar images.
 */
class StatusBar extends MovableObject {
    width = 150;
    height = 40;
    percentage = 100;
    imageFolderPath;

    /**
     * @param {string} imageFolderPath - Folder containing the bar images.
     * @param {number} x - Fixed horizontal position on the screen.
     * @param {number} y - Fixed vertical position on the screen.
     * @param {string} [filePrefix] - Optional prefix before the step number, e.g. "green".
     */
    constructor(imageFolderPath, x, y, filePrefix = "") {
        super();
        this.imageFolderPath = imageFolderPath;
        this.x = x;
        this.y = y;
        this.filePrefix = filePrefix;
        this.setPercentage(100);
    }

    /**
     * Updates the percentage and switches to the matching bar image.
     * @param {number} percentage - A value between 0 and 100.
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        let step = this.getNearestStep(percentage);
        this.loadImage(`${this.imageFolderPath}/${this.filePrefix}${step}.png`);
    }

    /**
     * Rounds a percentage down to the nearest image we actually have.
     * @param {number} percentage - A value between 0 and 100.
     * @returns {number} One of 0, 20, 40, 60, 80 or 100.
     */
    getNearestStep(percentage) {
        let steps = [0, 20, 40, 60, 80, 100];
        let clamped = Math.max(0, Math.min(100, percentage));
        let closest = 0;
        for (let i = 0; i < steps.length; i++) {
            if (steps[i] <= clamped) {
                closest = steps[i];
            }
        }
        return closest;
    }
}
