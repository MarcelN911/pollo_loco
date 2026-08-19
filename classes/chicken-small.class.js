/**
 * A small chicken enemy. Smaller and faster than the normal Chicken,
 * but uses the exact same walking/dying logic from its parent class.
 */
class ChickenSmall extends Chicken {
    width = 50;
    height = 50;
    y = 370;
    offset = { top: 4, left: 6, right: 6, bottom: 5 };

    /**
     * @param {number} x - Starting position inside the level.
     */
    constructor(x) {
        let walkingImages = [
            "assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
            "assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
            "assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
        ];
        let deadImage = "assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png";
        super(x, walkingImages, deadImage);
        this.speed = 0.3 + Math.random() * 0.3;
    }
}
