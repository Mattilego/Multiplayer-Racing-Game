let keyCodesPressed = {};
for(let i = 0;i < 222; i++){
     keyCodesPressed[i] = false;
}
let keysPressed = [];
let touches = [];
let mousePos = {"x": 0,"y":0};
        
let holdControls = new Map();//key to function map, ran every frame key is held
let pressControls = new Map();//key to function map, ran once when key is pressed

holdControls.set("w", accellerate); holdControls.set({ x: window.innerWidth*3/4, y: window.innerHeight/2, width: window.innerWidth/4, height: window.innerHeight/2 }, accellerate);
holdControls.set("s", deaccellerate); holdControls.set({ x: window.innerWidth/2, y: window.innerHeight/2, width: window.innerWidth/4, height: window.innerHeight/2 }, deaccellerate);
holdControls.set("d", turnRight); holdControls.set({ x: window.innerWidth/4, y: window.innerHeight/2, width: window.innerWidth/4, height: window.innerHeight/2 }, turnRight);
holdControls.set("a", turnLeft); holdControls.set({ x: 0, y: window.innerHeight/2, width: window.innerWidth/4, height: window.innerHeight/2 }, turnLeft);
holdControls.set("<", drift); holdControls.set({ x: window.innerWidth/2, y: 0, width: window.innerWidth/2, height: window.innerHeight/2 }, drift);

pressControls.set("q", useItem); pressControls.set({ x: 0, y: 0, width: window.innerWidth/2, height: window.innerHeight/2 }, useItem);
        
document.body.onkeydown = keyDown;
document.body.onkeyup = keyUp;
document.body.onmousedown = mouseDown;
document.body.onmouseup = mouseUp;
document.body.onmousemove = mouseMoved;
document.body.onclick = clicked;
document.body.style.background = "grey";
        
/**
 * Sets the isAccelerating property of the first (player) racer to true. Called
 * every frame when the "w" key is held down.
 */

function accellerate(){
    racers[0].isAccelerating = true;
}

/**
 * Sets the isDecelerating property of the first (player) racer to true. Called
 * every frame when the "s" key is held down.
 */
function deaccellerate(){
    racers[0].isDecelerating = true;
}

/**
 * Sets the isTurningRight property of the first (player) racer to true. Called
 * every frame when the "d" key is held down.
 */
function turnRight(){
    racers[0].isTurningRight = true;
}

/**
 * Sets the isTurningLeft property of the first (player) racer to true. Called
 * every frame when the "a" key is held down.
 */
function turnLeft(){
    racers[0].isTurningLeft = true;
}
/**
 * Sets the isDrifting property of the first (player) racer to true. 
 * Called every frame when the "<" key is held down.
 */

function drift(){
    racers[0].isDrifting = true;
}
/**
 * Adds the key to the keysPressed array and sets the corresponding keyCodesPressed value to true.
 * @param {object} event - The event object containing the key that was pressed.
 */
function keyDown(event){
    if (!(keyCodesPressed[event.keyCode])){
        keysPressed.push(event.key);
        // Check for press controls
        pressControls.forEach(function(value, key){
            if (event.key.toLowerCase() === key) {
                value();
            }
        });
    }
    keyCodesPressed[event.keyCode] = true;
}
/**
 * Removes the key from the keysPressed array and sets the corresponding keyCodesPressed value to false.
 * @param {object} event - The event object containing the key that was released.
 */
function keyUp(event){
    keyCodesPressed[event.keyCode] = false;
    keysPressed = keysPressed.filter(function(value){return value != event.key});
}
function mouseDown(event){
    mouseDown = true;
}
function mouseUp(event){
    mouseDown = false;
}
/**
 * Updates the mousePos object with the current x and y coordinates of the mouse
 * as it moves.
 * @param {object} event - The event object containing the mouse coordinates.
 */
function mouseMoved(event){
    mousePos = {"x": event.x, "y": event.y};
}
function clicked(event){
    
}

/**
 * Checks all controls in the "controls" map and runs the corresponding
 * function if the key is currently being held down.
 */
function checkControls(){//Run every frame
    touches = getTouches();
    holdControls.forEach(function(value, key){
        if (typeof key === "string"){
            if (keysPressed.includes(key)){
                value();
            }
        }else{
            for (let i = 0; i < touches.length; i++){
                if (isTouchInsideBoundingBox(touches[i].clientX, touches[i].clientY, key)){
                    value();
                }
            }
        }
    });
}

// Function to get active touch points
function getTouches() {
    return Array.from(touches); // Convert TouchList to an array
}

// Function to check if touch is inside bounding box
function isTouchInsideBoundingBox(touchX, touchY, boundingBox) {
    return touchX >= boundingBox.x && touchX <= boundingBox.x + boundingBox.width &&
           touchY >= boundingBox.y && touchY <= boundingBox.y + boundingBox.height;
}

function useItem() {
    racers[0].useItemRequest = true;
}

//Mobile controls

document.addEventListener('touchstart', handleTouchDown, false);
document.addEventListener('touchmove', handleTouch, false);

function handleTouchDown(event) {
    pressControls.filter((value, key) => typeof key === "object").forEach((value, key) => {
        if (isTouchInsideBoundingBox(event.x, event.y, key)) {
            value();
        }
    });
}

function handleTouch(event) {
    touches = event.touches;
}