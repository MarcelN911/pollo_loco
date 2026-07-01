/**
 * A salsa bottle lying on the ground, waiting to be collected.
 * Once collected it is added to the character's bottle count,
 * which can later be used to throw bottles with ThrowableObject.
 */
class Bottle extends MovableObject {
    width = 60;
    height = 60;
    offset = { top: 10, left: 15, right: 15, bottom: 5 };

    /**
     * @param {number} x - Horizontal position inside the level.
     * @param {number} y - Vertical position inside the level.
     */
    constructor(x, y) {
        super();
        this.loadImage("img/6_salsa_bottle/1_salsa_bottle_on_ground.png");
        this.x = x;
        this.y = y;
    }
}
