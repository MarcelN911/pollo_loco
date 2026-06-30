let canvas;
let world;
let keyboard = new Keyboard();

/**
 * Runs once the page has loaded.
 * Gets the canvas element and creates the World,
 * which takes care of drawing and updating the whole game from now on.
 */
function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
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
