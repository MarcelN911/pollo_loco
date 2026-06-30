/**
 * Holds the whole playable world: character, background, clouds
 * and later enemies and items. Takes care of drawing everything
 * at the correct position and moving the camera along with the character.
 */
class World {
    character = new Character();
    backgroundObjects = level1_backgroundObjects;
    clouds = level1_clouds;
    enemies = level1_enemies;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;

    /**
     * @param {HTMLCanvasElement} canvas - The canvas to draw on.
     * @param {Keyboard} keyboard - The keyboard state used by the character.
     */
    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.keyboard = keyboard;
        this.setWorld();
        this.draw();
        this.run();
    }

    /**
     * Gives the character a reference back to this world,
     * so it can read the keyboard state.
     */
    setWorld() {
        this.character.world = this;
    }

    /**
     * Starts the logic loop that moves the camera along with the character
     * and checks for collisions with enemies.
     */
    run() {
        setInterval(() => {
            this.updateCamera();
            this.checkCollisions();
        }, 1000 / 60);
    }

    /**
     * Follows the character with the camera, but never shows the
     * area before the start of the level (would just be black).
     */
    updateCamera() {
        let wantedCameraX = -this.character.x + 100;
        this.camera_x = Math.min(0, wantedCameraX);
    }

    /**
     * Checks every living enemy for a collision with the character.
     */
    checkCollisions() {
        this.enemies.forEach((enemy) => {
            this.checkSingleEnemyCollision(enemy);
        });
    }

    /**
     * Reacts to a collision with one enemy: stomps it if the character
     * landed on top of it, otherwise the character takes damage.
     * @param {Chicken} enemy - The enemy to check against the character.
     */
    checkSingleEnemyCollision(enemy) {
        if (enemy.isDead || !this.character.isColliding(enemy)) {
            return;
        }
        if (this.isStomp(enemy)) {
            this.handleStomp(enemy);
        } else {
            this.character.hit();
        }
    }

    /**
     * Decides whether the character is landing on top of the enemy
     * instead of just bumping into it from the side.
     * @param {Chicken} enemy - The enemy to check against.
     * @returns {boolean} True if this counts as a stomp.
     */
    isStomp(enemy) {
        let characterIsFalling = this.character.speedY < 0;
        let characterFeet = this.character.y + this.character.height - this.character.offset.bottom;
        let enemyTop = enemy.y + enemy.offset.top;
        return characterIsFalling && characterFeet < enemyTop + 30;
    }

    /**
     * Kills the enemy, gives the character a small bounce upwards
     * and removes the enemy from the level after a short delay.
     * @param {Chicken} enemy - The enemy that got stomped.
     */
    handleStomp(enemy) {
        enemy.die();
        this.character.speedY = 10;
        this.removeEnemyAfterDelay(enemy);
    }

    /**
     * Removes a dead enemy from the enemies array after a short delay,
     * so its death animation stays visible for a moment first.
     * @param {Chicken} enemy - The enemy to remove.
     */
    removeEnemyAfterDelay(enemy) {
        setTimeout(() => {
            let index = this.enemies.indexOf(enemy);
            if (index > -1) {
                this.enemies.splice(index, 1);
            }
        }, 1000);
    }

    /**
     * Clears the canvas and draws every layer in the correct order:
     * background, clouds and finally the character on top.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.enemies);
        this.addToMap(this.character);
        this.ctx.translate(-this.camera_x, 0);

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    /**
     * Draws every object of a given array onto the canvas.
     * @param {MovableObject[]} objects - The objects to draw.
     */
    addObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addToMap(object);
        });
    }

    /**
     * Draws a single object, flipping it horizontally if it is
     * currently facing the other direction.
     * @param {MovableObject} movableObject - The object to draw.
     */
    addToMap(movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(movableObject);
        }
        this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y, movableObject.width, movableObject.height);
        if (movableObject.otherDirection) {
            this.flipImageBack(movableObject);
        }
    }

    /**
     * Mirrors the canvas before drawing a flipped object.
     * @param {MovableObject} movableObject - The object that is flipped.
     */
    flipImage(movableObject) {
        this.ctx.save();
        this.ctx.translate(movableObject.width, 0);
        this.ctx.scale(-1, 1);
        movableObject.x = movableObject.x * -1;
    }

    /**
     * Undoes the mirroring after a flipped object has been drawn.
     * @param {MovableObject} movableObject - The object that was flipped.
     */
    flipImageBack(movableObject) {
        movableObject.x = movableObject.x * -1;
        this.ctx.restore();
    }
}
