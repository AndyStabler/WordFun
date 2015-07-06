/**
 * Created by Andy Stabler
 */
var anim = new wordFun.animator();
var displayTimer;
var displayRunning = false;

document.getElementById('word-fun-input').addEventListener('keypress', anim.fire.bind(anim));
document.getElementById('word-fun-input').focus();
document.getElementById('word-fun-auto').addEventListener('click',
    function () {
        "use strict";
        var autoButton = document.getElementById('word-fun-auto');
        if (!displayRunning) {
            displayRunning = !displayRunning;
            autoButton.innerHTML = "Stop Display";
            displayTimer = requestAnimationFrame(startDisplay);
        } else {
            displayRunning = !displayRunning;
            autoButton.innerHTML = "Start Display";
            cancelAnimationFrame(displayTimer);
        }
    });


function startDisplay() {
    "use strict";
    anim.fire.bind(anim)();
    displayTimer = requestAnimationFrame(startDisplay);
}