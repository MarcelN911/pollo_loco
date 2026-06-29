let canvas;
let ctx;

/**
 * Runs once the page has loaded.
 * Gets the canvas element and its 2D rendering context.
 * More logic will be added here in the next steps.
 */
function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
}

window.addEventListener("load", init);
