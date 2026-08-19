const SEGMENT_WIDTH = 719;
const SEGMENT_COUNT = 8;

/**
 * Creates the four background layers for one segment of the level.
 * The layers are ordered from furthest away (air) to closest (first layer).
 * @param {number} index - Position index of this segment.
 * @returns {BackgroundObject[]} The layer objects for this segment.
 */
function createBackgroundSegment(index) {
    let x = index * SEGMENT_WIDTH;
    let imageNumber = (index % 2) + 1;
    return [
        new BackgroundObject("assets/img/5_background/layers/air.png", x),
        new BackgroundObject(`assets/img/5_background/layers/3_third_layer/${imageNumber}.png`, x),
        new BackgroundObject(`assets/img/5_background/layers/2_second_layer/${imageNumber}.png`, x),
        new BackgroundObject(`assets/img/5_background/layers/1_first_layer/${imageNumber}.png`, x),
    ];
}

/**
 * Builds the full background by repeating segments next to each other,
 * so there are no visible gaps while scrolling through the level.
 * @returns {BackgroundObject[]} All background objects of the level.
 */
function buildBackgroundObjects() {
    let backgroundObjects = [];
    for (let i = 0; i < SEGMENT_COUNT; i++) {
        let segment = createBackgroundSegment(i);
        for (let j = 0; j < segment.length; j++) {
            backgroundObjects.push(segment[j]);
        }
    }
    return backgroundObjects;
}

/**
 * Creates a few clouds spread across the level width.
 * @returns {Cloud[]} The cloud objects of the level.
 */
function buildClouds() {
    return [new Cloud(0), new Cloud(700), new Cloud(1400), new Cloud(2100)];
}

/**
 * Creates the enemies of the level. They start a bit further to the
 * right, so the character is not overrun the moment the game starts.
 * @returns {Chicken[]} The enemy objects of the level.
 */
function buildEnemies() {
    return [
        new Chicken(500),
        new ChickenSmall(750),
        new Chicken(1100),
        new Chicken(1450),
        new ChickenSmall(1800),
        new Chicken(2200),
        new ChickenSmall(2600),
        new Chicken(3000),
    ];
}

/**
 * Creates the collectible coins spread across the level.
 * @returns {Coin[]} The coin objects of the level.
 */
function buildCoins() {
    return [
        new Coin(300, 300),
        new Coin(650, 250),
        new Coin(1000, 300),
        new Coin(1700, 280),
        new Coin(2400, 300),
    ];
}

/**
 * Creates the five collectible bottles spread across the level.
 * The last two are placed just before the boss so the player
 * always has a small reserve for the final fight.
 * @returns {Bottle[]} The bottle objects of the level.
 */
function buildBottles() {
    return [
        new Bottle(500, 360),
        new Bottle(1200, 360),
        new Bottle(1900, 360),
        new Bottle(2550, 360),
        new Bottle(2700, 360),
    ];
}

