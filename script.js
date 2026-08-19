let canvas;
let world;
let keyboard = new Keyboard();
let soundManager = new SoundManager();

/**
 * Runs once the page has loaded and just grabs the canvas element.
 * The World is not created yet, the player still sees the start screen.
 */
function init() {
    canvas = document.getElementById("canvas");
    initTouchControls();
    updateMuteButton();
}

/**
 * Toggles muted sound on or off and updates the mute button's icon.
 * Called directly from the mute button's onclick attribute.
 */
function toggleMute() {
    soundManager.toggleMute();
    updateMuteButton();
}

/**
 * Swaps the mute button's icon to match the current mute state.
 */
function updateMuteButton() {
    let button = document.getElementById("mute-btn");
    button.innerHTML = soundManager.isMuted ? "&#128263;" : "&#128266;";
    button.title = soundManager.isMuted ? "Ton an" : "Stummschalten";
}

/**
 * Wires up the on-screen touch buttons so pressing one sets the same
 * keyboard state as the matching physical key, and releasing it clears
 * that state again. Pointer events cover touch, mouse and pen in one go.
 */
function initTouchControls() {
    document.querySelectorAll(".touch-btn").forEach((button) => {
        let key = button.dataset.key;
        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            keyboard[key] = true;
        });
        button.addEventListener("pointerup", () => (keyboard[key] = false));
        button.addEventListener("pointerleave", () => (keyboard[key] = false));
        button.addEventListener("pointercancel", () => (keyboard[key] = false));
        button.addEventListener("contextmenu", (event) => event.preventDefault());
    });
}

/**
 * Toggles fullscreen mode for the whole game area.
 * Called directly from the fullscreen button's onclick attribute.
 */
function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.querySelector(".game-container").requestFullscreen();
    }
}

/**
 * Swaps the fullscreen button's icon and label to match the current state.
 * Runs on the browser's own "fullscreenchange" event, so it also catches
 * the user leaving fullscreen with Escape instead of the button itself.
 */
function updateFullscreenButton() {
    let button = document.getElementById("fullscreen-btn");
    let isFullscreen = !!document.fullscreenElement;
    button.innerHTML = isFullscreen ? "&#10529;" : "&#10530;";
    button.title = isFullscreen ? "Vollbild verlassen" : "Vollbild";
}

/**
 * Hides the start screen and creates the World, which takes care of
 * drawing and updating the whole game from now on.
 * Called directly from the start button's onclick attribute.
 */
function startGame() {
    document.getElementById("start-screen").classList.add("hidden");
    world = new World(canvas, keyboard, soundManager);
    world.onGameEnd = showEndScreen;
    soundManager.startBackgroundMusic();
}

/**
 * Shows the end screen with the matching win or lose graphic.
 * Called by World itself once the character or the endboss has died.
 * @param {boolean} won - True if the player defeated the endboss.
 */
function showEndScreen(won) {
    let badge = document.getElementById("end-badge");
    badge.src = won ? "assets/img/You won, you lost/You won A.png" : "assets/img/You won, you lost/You lost.png";
    badge.alt = won ? "Gewonnen" : "Verloren";
    document.getElementById("end-screen").classList.remove("hidden");
}

/**
 * Hides the end screen and starts a fresh game with a fresh keyboard
 * state, so no key that was still held down at death stays stuck.
 * Called directly from the end screen's restart button.
 */
function restartGame() {
    document.getElementById("end-screen").classList.add("hidden");
    keyboard = new Keyboard();
    world = new World(canvas, keyboard, soundManager);
    world.onGameEnd = showEndScreen;
    soundManager.startBackgroundMusic();
}

/**
 * Hides the end screen and shows the start screen again.
 * Called directly from the end screen's home button.
 */
function goHome() {
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
}

/**
 * Opens the dialog that explains the controls.
 * Called directly from the "Steuerung" button's onclick attribute.
 */
function openControls() {
    document.getElementById("controls-dialog").showModal();
}

/**
 * Closes the controls dialog.
 * Called directly from the dialog's close button.
 */
function closeControls() {
    document.getElementById("controls-dialog").close();
}

/**
 * Opens the dialog that explains the story behind the game.
 * Called directly from the "Story" button's onclick attribute.
 */
function openStory() {
    document.getElementById("story-dialog").showModal();
}

/**
 * Closes the story dialog.
 * Called directly from the dialog's close button.
 */
function closeStory() {
    document.getElementById("story-dialog").close();
}

/**
 * Closes the dialog when the click lands on the backdrop itself,
 * i.e. next to the dialog content, not inside it.
 * @param {MouseEvent} event - The click event from the dialog element.
 */
function handleDialogBackdropClick(event) {
    if (event.target === event.currentTarget) {
        event.currentTarget.close();
    }
}

/**
 * Updates one property of the keyboard object based on the pressed key.
 * @param {string} key - The value of event.key.
 * @param {boolean} isPressed - True on keydown, false on keyup.
 */
function setKeyboardState(key, isPressed) {
    if (key === "ArrowLeft") keyboard.left = isPressed;
    if (key === "ArrowRight") keyboard.right = isPressed;
    if (key === "ArrowUp") keyboard.up = isPressed;
    if (key === "ArrowDown") keyboard.down = isPressed;
    if (key === " ") keyboard.space = isPressed;
    if (key === "d" || key === "D") keyboard.throw = isPressed;
}

/**
 * Handles the keydown event and marks the matching key as pressed.
 * @param {KeyboardEvent} event - The native keydown event.
 */
function handleKeyDown(event) {
    setKeyboardState(event.key, true);
}

/**
 * Handles the keyup event and marks the matching key as released.
 * @param {KeyboardEvent} event - The native keyup event.
 */
function handleKeyUp(event) {
    setKeyboardState(event.key, false);
}

window.addEventListener("load", init);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
document.addEventListener("fullscreenchange", updateFullscreenButton);
