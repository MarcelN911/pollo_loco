/**
 * The final enemy "Señora Gallina".
 * She wakes up when the character gets close, then alternates between
 * walking toward him and launching attack charges.
 * A bottle hit reduces her health by one step; five hits kill her.
 */
class Endboss extends MovableObject {
    width = 200;
    height = 230;
    y = 190;
    speed = 0.8;
    energy = 100;
    state = "walking";
    isActivated = false;
    world;
    offset = { top: 20, left: 20, right: 20, bottom: 20 };

    IMAGES_WALKING = [
        "assets/img/4_enemie_boss_chicken/1_walk/G1.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G2.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G3.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G4.png",
    ];

    IMAGES_ALERT = [
        "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
    ];

    IMAGES_ATTACK = [
        "assets/img/4_enemie_boss_chicken/3_attack/G13.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G14.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G15.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G16.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G20.png",
    ];

    IMAGES_HURT = [
        "assets/img/4_enemie_boss_chicken/4_hurt/G21.png",
        "assets/img/4_enemie_boss_chicken/4_hurt/G22.png",
        "assets/img/4_enemie_boss_chicken/4_hurt/G23.png",
    ];

    IMAGES_DEAD = [
        "assets/img/4_enemie_boss_chicken/5_dead/G24.png",
        "assets/img/4_enemie_boss_chicken/5_dead/G25.png",
        "assets/img/4_enemie_boss_chicken/5_dead/G26.png",
    ];

    /**
     * @param {number} x - Starting position at the far right of the level.
     */
    constructor(x) {
        super();
        this.x = x;
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    /**
     * Starts the movement loop and the animation loop.
     */
    animate() {
        this.moveIntervalId = setInterval(() => {
            this.checkActivation();
            this.move();
        }, 1000 / 60);

        this.animationIntervalId = setInterval(() => {
            this.playBossAnimation();
        }, 200);
    }

    /**
     * Stops every loop owned by this boss. Called by World when it is
     * torn down, e.g. on restart.
     */
    stop() {
        clearInterval(this.moveIntervalId);
        clearInterval(this.animationIntervalId);
        clearInterval(this.attackIntervalId);
    }

    /**
     * Activates the boss the first time the character walks close enough.
     * Shows the alert animation before she starts moving.
     */
    checkActivation() {
        let isClose = this.world.character.x > this.x - 600;
        if (!this.isActivated && isClose) {
            this.isActivated = true;
            this.startAlertPhase();
        }
    }

    /**
     * Plays the alert animation for 3 seconds, then switches to walking.
     * Also starts the periodic attack cycle from this point on.
     */
    startAlertPhase() {
        this.state = "alert";
        setTimeout(() => {
            if (!this.isDead()) {
                this.state = "walking";
                this.startAttackCycle();
            }
        }, 3000);
    }

    /**
     * Repeats every 7 seconds: switches to a fast attack charge for 2 seconds,
     * then returns to the normal walking speed.
     */
    startAttackCycle() {
        this.attackIntervalId = setInterval(() => this.runAttackCharge(), 7000);
    }

    /**
     * Switches the boss into a fast attack charge for 2 seconds, then
     * returns to the normal walking speed, unless she died or got hurt.
     */
    runAttackCharge() {
        if (this.isDead() || this.state === "hurt") {
            return;
        }
        this.state = "attack";
        this.speed = 2.5;
        setTimeout(() => {
            if (!this.isDead()) {
                this.state = "walking";
                this.speed = 0.8;
            }
        }, 2000);
    }

    /**
     * Restarts the periodic attack cycle after the game was paused,
     * but only if the boss was already active and past the alert phase.
     */
    resumeAttackCycle() {
        let shouldResume = this.isActivated && this.state !== "alert" && !this.isDead();
        if (shouldResume) {
            clearInterval(this.attackIntervalId);
            this.startAttackCycle();
        }
    }

    /**
     * Moves the boss to the left when active, but only while walking or attacking.
     */
    move() {
        let canMove = this.isActivated && (this.state === "walking" || this.state === "attack");
        if (canMove) {
            this.moveLeft();
            this.otherDirection = false;
        }
    }

    /**
     * Plays the animation frame that matches the current state.
     */
    playBossAnimation() {
        if (this.state === "alert") {
            this.playAnimation(this.IMAGES_ALERT);
        } else if (this.state === "attack") {
            this.playAnimation(this.IMAGES_ATTACK);
        } else if (this.state === "hurt") {
            this.playAnimation(this.IMAGES_HURT);
        } else if (this.state === "dead") {
            this.playAnimation(this.IMAGES_DEAD);
        } else {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /**
     * Reduces the boss's health by one step and switches to the hurt state.
     * Switches to dead if health reaches zero.
     */
    hit() {
        if (this.isDead()) {
            return;
        }
        this.energy = Math.max(this.energy - 20, 0);
        this.world.soundManager.playBossHurt();
        if (this.isDead()) {
            this.state = "dead";
            return;
        }
        this.state = "hurt";
        this.scheduleRecoverFromHurt();
    }

    /**
     * Switches the boss back to walking 700ms after getting hurt,
     * unless she died in the meantime.
     */
    scheduleRecoverFromHurt() {
        setTimeout(() => {
            if (!this.isDead()) {
                this.state = "walking";
            }
        }, 700);
    }

    /**
     * @returns {boolean} True when the boss has no energy left.
     */
    isDead() {
        return this.energy <= 0;
    }
}
