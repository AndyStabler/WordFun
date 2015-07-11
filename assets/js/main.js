/**
 * Created by Andy Stabler
 */
var anim = new wordFun.animator();
var displayInterval;
var displayRunning = false;

document.getElementById('word-fun-input').addEventListener('keypress', anim.fire.bind(anim));
document.getElementById('word-fun-input').focus();
document.getElementById('word-fun-auto').addEventListener('click',
    function () {
        "use strict";
        var autoButton = document.getElementById('word-fun-auto');
        if (!displayRunning) {
            displayRunning = true;
            autoButton.innerHTML = "Stop Display";
            startDisplay();
        } else {
            displayRunning = false;
            autoButton.innerHTML = "Start Display";
            clearInterval(displayInterval);
        }
    });

function startDisplay() {
    "use strict";
    // requestAnimationFrame is called in fire, so we can just use setInterval here
    displayInterval = setInterval(function () {
        anim.fire()
    }, 80);
}