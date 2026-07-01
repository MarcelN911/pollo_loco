/**
 * Holds the whole playable world: character, background, clouds
 * and later enemies and items. Takes care of drawing everything
 * at the correct position and moving the camera along with the character.
 */
class World {
    character = new Character();
    endboss = new Endboss(2800);
    backgroundObjects = level1_backgroundObjects;
    clouds = level1_clouds;
    enemies = level1_enemies;
    coins = level1_coins;
    bottles = level1_bottles;
    throwableObjects = [];
    maxCoins = level1_coins.length;
    maxBottles = 7;
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
        this.createStatusBars();
        this.setWorld();
        this.bottleBar.setPercentage((this.character.bottles / this.maxBottles) * 100);
        this.draw();
        this.run();
    }

    /**
     * Creates the three fixed status bars shown in the top left corner
     * and the endboss bar in the top right corner.
     */
    createStatusBars() {
        this.healthBar = new StatusBar("img/7_statusbars/1_statusbar/2_statusbar_health/green", 20, 10);
        this.coinBar = new StatusBar("img/7_statusbars/1_statusbar/1_statusbar_coin/blue", 20, 55);
        this.bottleBar = new StatusBar("img/7_statusbars/1_statusbar/3_statusbar_bottle/orange", 20, 100);
        let bossBarX = this.canvas.width - 170;
        this.endbossBar = new StatusBar("img/7_statusbars/2_statusbar_endboss/green", bossBarX, 10, "green");
    }

    /**
     * Gives the character and the endboss a reference back to this world.
     */
    setWorld() {
        this.character.world = this;
        this.endboss.world = this;
    }

    /**
     * Starts the logic loop that moves the camera, checks every kind
     * of collision and keeps the status bars in sync.
     */
    run() {
        setInterval(() => {
            this.updateCamera();
            this.checkEnemyCollisions();
            this.checkBossCollisions();
            this.checkItemCollisions();
            this.checkThrowableCollisions();
            this.cleanupThrowables();
            this.healthBar.setPercentage(this.character.energy);
            this.endbossBar.setPercentage(this.endboss.energy);
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
     * Does nothing once the character has already died.
     */
    checkEnemyCollisions() {
        if (this.character.isDead()) {
            return;
        }
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
     * Checks collisions between the character, the endboss and thrown bottles.
     * Walking into the boss damages the character; a bottle hit damages the boss.
     */
    checkBossCollisions() {
        if (this.endboss.isDead() || this.character.isDead()) {
            return;
        }
        if (this.character.isColliding(this.endboss)) {
            this.character.hit();
        }
        this.throwableObjects.forEach((bottle) => {
            if (!bottle.hasSplashed && bottle.isColliding(this.endboss)) {
                this.endboss.hit();
                bottle.splash();
            }
        });
    }

    /**
     * Checks whether the character touches a coin or a bottle
     * lying on the ground and collects it if so.
     */
    checkItemCollisions() {
        this.coins = this.coins.filter((coin) => !this.tryCollectCoin(coin));
        this.bottles = this.bottles.filter((bottle) => !this.tryCollectBottle(bottle));
    }

    /**
     * Collects a coin if the character touches it.
     * @param {Coin} coin - The coin to check.
     * @returns {boolean} True if the coin was collected.
     */
    tryCollectCoin(coin) {
        if (!this.character.isColliding(coin)) {
            return false;
        }
        this.character.coins += 1;
        this.coinBar.setPercentage((this.character.coins / this.maxCoins) * 100);
        return true;
    }

    /**
     * Collects a ground bottle if the character touches it.
     * @param {Bottle} bottle - The bottle to check.
     * @returns {boolean} True if the bottle was collected.
     */
    tryCollectBottle(bottle) {
        if (!this.character.isColliding(bottle)) {
            return false;
        }
        this.character.bottles += 1;
        this.bottleBar.setPercentage((this.character.bottles / this.maxBottles) * 100);
        return true;
    }

    /**
     * Spawns a thrown bottle in front of the character and removes
     * one bottle from the character's collected amount.
     * Called by the character when the throw key is pressed.
     */
    throwBottle() {
        this.character.bottles -= 1;
        this.bottleBar.setPercentage((this.character.bottles / this.maxBottles) * 100);
        let startX = this.character.x + 100;
        let startY = this.character.y + 100;
        let bottle = new ThrowableObject(startX, startY, this.character.otherDirection);
        this.throwableObjects.push(bottle);
    }

    /**
     * Checks whether any thrown bottle in the air hits a living enemy.
     */
    checkThrowableCollisions() {
        this.throwableObjects.forEach((bottle) => {
            this.enemies.forEach((enemy) => {
                this.checkSingleThrowableHit(bottle, enemy);
            });
        });
    }

    /**
     * Kills the enemy and lets the bottle splash if they touch.
     * @param {ThrowableObject} bottle - The thrown bottle to check.
     * @param {Chicken} enemy - The enemy to check against.
     */
    checkSingleThrowableHit(bottle, enemy) {
        if (enemy.isDead || bottle.hasSplashed || !bottle.isColliding(enemy)) {
            return;
        }
        enemy.die();
        bottle.splash();
        this.removeEnemyAfterDelay(enemy);
    }

    /**
     * Removes thrown bottles from the array once their splash
     * animation has finished playing.
     */
    cleanupThrowables() {
        this.throwableObjects = this.throwableObjects.filter((bottle) => {
            return !(bottle.hasSplashed && bottle.currentImage > bottle.IMAGES_SPLASH.length);
        });
    }

    /**
     * Clears the canvas and draws every layer in the correct order:
     * background, items and enemies in the world, the character on top,
     * and finally the status bars that always stay fixed on screen.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.coins);
        this.addObjectsToMap(this.bottles);
        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.endboss);
        this.addToMap(this.character);
        this.ctx.translate(-this.camera_x, 0);
        this.drawStatusBars();

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    /**
     * Draws the three status bars and the endboss bar.
     * They are drawn outside of the camera translation,
     * so they always stay fixed on the screen.
     */
    drawStatusBars() {
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        if (this.endboss.isActivated) {
            this.addToMap(this.endbossBar);
        }
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
