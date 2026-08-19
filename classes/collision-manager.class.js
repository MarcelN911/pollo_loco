/**
 * Handles every collision check in the game: the character against
 * enemies, the endboss, coins and bottles, plus thrown bottles against
 * enemies. Keeps World itself focused on state, the loop and drawing.
 */
class CollisionManager {
    world;

    /**
     * @param {World} world - The world this manager checks collisions for.
     */
    constructor(world) {
        this.world = world;
    }

    /**
     * Runs every collision check for the current frame, in order.
     */
    checkAll() {
        this.checkEnemyCollisions();
        this.checkBossCollisions();
        this.checkItemCollisions();
        this.checkThrowableCollisions();
        this.cleanupThrowables();
    }

    /**
     * Checks every living enemy for a collision with the character.
     * Does nothing once the character has already died.
     */
    checkEnemyCollisions() {
        if (this.world.character.isDead()) {
            return;
        }
        this.world.enemies.forEach((enemy) => {
            this.checkSingleEnemyCollision(enemy);
        });
    }

    /**
     * Reacts to a collision with one enemy: stomps it if the character
     * landed on top of it, otherwise the character takes damage.
     * @param {Chicken} enemy - The enemy to check against the character.
     */
    checkSingleEnemyCollision(enemy) {
        let character = this.world.character;
        if (enemy.isDead || !character.isColliding(enemy)) {
            return;
        }
        if (this.isStomp(enemy)) {
            this.handleStomp(enemy);
        } else {
            character.hit();
        }
    }

    /**
     * Decides whether the character is landing on top of the enemy
     * instead of just bumping into it from the side.
     * @param {Chicken} enemy - The enemy to check against.
     * @returns {boolean} True if this counts as a stomp.
     */
    isStomp(enemy) {
        let character = this.world.character;
        let characterIsFalling = character.speedY < 0;
        let characterFeet = character.y + character.height - character.offset.bottom;
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
        this.world.character.speedY = 10;
        this.removeEnemyAfterDelay(enemy);
    }

    /**
     * Removes a dead enemy from the enemies array after a short delay,
     * so its death animation stays visible for a moment first.
     * @param {Chicken} enemy - The enemy to remove.
     */
    removeEnemyAfterDelay(enemy) {
        setTimeout(() => {
            let enemies = this.world.enemies;
            let index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1);
            }
            enemy.stop();
        }, 1000);
    }

    /**
     * Checks collisions between the character, the endboss and thrown bottles.
     * Walking into the boss damages the character; a bottle hit damages the boss.
     */
    checkBossCollisions() {
        if (this.world.endboss.isDead() || this.world.character.isDead()) {
            return;
        }
        this.checkCharacterVsBoss();
        this.checkThrownBottlesVsBoss();
    }

    /**
     * Damages the character if he walks directly into the endboss.
     */
    checkCharacterVsBoss() {
        let world = this.world;
        if (world.character.isColliding(world.endboss)) {
            world.character.hit();
        }
    }

    /**
     * Damages the endboss with every thrown bottle that hits her.
     */
    checkThrownBottlesVsBoss() {
        let world = this.world;
        world.throwableObjects.forEach((bottle) => {
            if (!bottle.hasSplashed && bottle.isColliding(world.endboss)) {
                world.endboss.hit();
                bottle.splash();
            }
        });
    }

    /**
     * Checks whether the character touches a coin or a bottle
     * lying on the ground and collects it if so.
     */
    checkItemCollisions() {
        this.world.coins = this.collectTouchedCoins();
        this.world.bottles = this.collectTouchedBottles();
    }

    /**
     * Goes through every coin in the level and collects the ones
     * the character is currently touching.
     * @returns {Coin[]} The coins that are still lying on the ground.
     */
    collectTouchedCoins() {
        let remaining = [];
        for (let i = 0; i < this.world.coins.length; i++) {
            let coin = this.world.coins[i];
            if (!this.tryCollectCoin(coin)) {
                remaining.push(coin);
            }
        }
        return remaining;
    }

    /**
     * Goes through every bottle in the level and collects the ones
     * the character is currently touching.
     * @returns {Bottle[]} The bottles that are still lying on the ground.
     */
    collectTouchedBottles() {
        let remaining = [];
        for (let i = 0; i < this.world.bottles.length; i++) {
            let bottle = this.world.bottles[i];
            if (!this.tryCollectBottle(bottle)) {
                remaining.push(bottle);
            }
        }
        return remaining;
    }

    /**
     * Collects a coin if the character touches it.
     * @param {Coin} coin - The coin to check.
     * @returns {boolean} True if the coin was collected.
     */
    tryCollectCoin(coin) {
        let world = this.world;
        if (!world.character.isColliding(coin)) {
            return false;
        }
        coin.stop();
        world.character.coins += 1;
        world.coinBar.setPercentage((world.character.coins / world.maxCoins) * 100);
        world.soundManager.playCoin();
        return true;
    }

    /**
     * Collects a ground bottle if the character touches it.
     * @param {Bottle} bottle - The bottle to check.
     * @returns {boolean} True if the bottle was collected.
     */
    tryCollectBottle(bottle) {
        let world = this.world;
        if (!world.character.isColliding(bottle)) {
            return false;
        }
        world.character.bottles += 1;
        world.bottleBar.setPercentage((world.character.bottles / world.maxBottles) * 100);
        return true;
    }

    /**
     * Checks whether any thrown bottle in the air hits a living enemy.
     */
    checkThrowableCollisions() {
        this.world.throwableObjects.forEach((bottle) => {
            this.world.enemies.forEach((enemy) => {
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
        let stillFlying = [];
        for (let i = 0; i < this.world.throwableObjects.length; i++) {
            let bottle = this.world.throwableObjects[i];
            let isFinished = bottle.hasSplashed && bottle.currentImage > bottle.IMAGES_SPLASH.length;
            if (isFinished) {
                bottle.stop();
            } else {
                stillFlying.push(bottle);
            }
        }
        this.world.throwableObjects = stillFlying;
    }
}
