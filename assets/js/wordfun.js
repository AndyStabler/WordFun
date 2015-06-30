// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

function Animator(canvas) {
    "use strict";
    this.ctx = canvas.getContext('2d');
    this.initDimension();
    this.exploders = [];
    this.clearCanvas();
}

/**
 * Sets the dimension of the canvas to the window's dimension
 */
Animator.prototype.initDimension = function () {
    "use strict";
    // set the canvas size to match the window's
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
};

/**
 * Add an exploder to the queue of exploders to animate
 */
Animator.prototype.pushExploder = function (exploder) {
    "use strict";
    var that = this;
    // add the exploder to the end of the queue
    this.exploders.push(exploder);

    // if we aren't running, start up
    if (!running) {
        running = true;
        requestAnimationFrame(anim.explode.bind(anim));
    }

    // check the explosion every so often - once it's finished remove it from the animation
    var t = setInterval(function () {
        if (exploder.isFinished()) {
            // remove it from queue
            that.shiftExploder();
            // stop checking to see if it's dead once we know it is
            clearInterval(t);
        }
    }, 1000);

};

/**
 * Remove an exploder from the animation queue - done once an exploder has finished
 */
Animator.prototype.shiftExploder = function () {
    "use strict";
    // remove most recent exploder from queue
    this.exploders.shift();
    // stop the animation if there are no explosions to animate
    if (this.exploders.length == 0) {
        cancelAnimationFrame(animRequest);
        running = false;
        this.clearCanvas();
    }
};

Animator.prototype.clearCanvas = function () {
    "use strict";
    this.ctx.clearRect(0, 0, this.width, this.height);
};

/**
 * Main draw function for the Animator object
 *
 * calls explode function on each exploder in the queue
 */
Animator.prototype.explode = function () {
    "use strict";
    this.initDimension();
    this.clearCanvas();
    this.exploders.forEach(function (exploder) {
        exploder.explode();
    });

    animRequest = requestAnimationFrame(this.explode.bind(this));
};

/**
 * An exploder is a firework - holds many pellets that fly off when a key is pressed
 * @param ctx the canvas context to draw the explosion on to
 * @param x the x coordinate of the explosion
 * @param y the y coordinate of the explosion
 */
function Exploder(ctx, x, y) {
    "use strict";
    this.ctx = ctx;
    // generate a number of pellets to be used in the explosion
    this.makePellets(x, y, 10);
}

/**
 * Generates a number of pellets for use in the explosion
 * @param x the x coordinate of the pellet
 * @param y the y coordinate of the pellet
 * @param count the number of pellets to generate
 */
Exploder.prototype.makePellets = function (x, y, count) {
    "use strict";
    var pellets = [];
    for (var i = 0; i < count; i++)
        pellets.push(new Pellet(x, y));
    this.pellets = pellets;
};

/**
 * Draws the pellets and updates their position
 */
Exploder.prototype.explode = function () {
    "use strict";
    this.draw();
    // increase the angle of rotation
    this.pellets.forEach(function (pellet) {
        pellet.angle += 3 * Math.PI / 180;
        pellet.updatePosition();
    });
};

/**
 * Draws all pellets in the explosion onto the canvas
 */
Exploder.prototype.draw = function () {
    "use strict";
    var that = this;
    this.pellets.forEach(function (pellet) {
        pellet.draw(that.ctx);
    });
};

/**
 * if any pellet in the explosion is dead, then the explosion is finisheds
 * TODO: could class Exploder as finished when all pellets are dead?
 * @return {boolean}
 */
Exploder.prototype.isFinished = function () {
    "use strict";
    return this.pellets.some(function (pellet) {
        return pellet.dead
    });
};

/**
 * A pellet used as part of an explosion
 * @param x x coordinate of the pellet
 * @param y y coordinate of the pellet
 */
function Pellet(x, y) {
    "use strict";
    this.size = 30;
    this.x = x;
    this.y = y;
    this.opacity = 1;
    this.dead = false;
    // arcCx/Cy are the coordinates of the center of the arc circle
    this.generateArcCx();
    this.generateArcCy();
    // radius is the hyp
    this.arcRadius = Math.sqrt(Math.pow(Math.abs(this.arcCx - this.x), 2) + Math.pow(Math.abs(this.arcCy - this.y), 2));
    this.colour = randomColor();
    this.angle = 3 * Math.PI / 180;
}

/**
 * Generates the x coordinate of the arc circle's center
 *
 * the x coordinate must be far enough away from the pellet's x coordinate to make the explosion look fairly real
 * the further away the point, the longer the arc will be
 */
Pellet.prototype.generateArcCx = function () {
    // decide between a left and a right arc at random
    this.isLeftArc = Math.random() < 0.5;
    if (this.isLeftArc) {
        // a left arc has been chosen
        var max = this.x - this.size;
        var min = this.x - 4 * this.size;
    } else {
        // a right arc has been chosen
        max = this.x + 5 * this.size;
        min = this.x + 2 * this.size;
    }
    this.arcCx = ran(min, max);
};

/**
 * Generates the y coordinate of the arc circle's center
 *
 * the y coordinate must be <= to the pellet's y coordinate to make the explosion look fairly real
 * if the arcY coordinate was above the pellet's y coordinate, the arc would look weird (it would go in a positive
 * and negative x direction)
 */
Pellet.prototype.generateArcCy = function () {
    var max = this.y;
    var min = this.y - this.size;
    this.arcCy = ran(min, max);
};

/**
 * Updates the pellet's position along its trajectory arc \
 */
Pellet.prototype.updatePosition = function () {
    // we want all pellets in an explosion to start at the same x,y pos
    // so either add the radius (if we're performing a left arc) or subtract it (if we're performing a right arc)
    var xRad = this.isLeftArc ? this.arcRadius : -this.arcRadius;

    this.x = this.arcCx + xRad * Math.cos(this.angle);
    this.y = this.arcCy - this.arcRadius * Math.sin(this.angle) * 2;
    // decrease the opacity over time - once its opacity is low enough we class it as dead
    this.opacity -= this.opacity > .02 ? .02 : 0;
    if (this.opacity <= 0.2)
        this.dead = true;
};

/**
 * Draw the pellet on the canvas' context
 */
Pellet.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.colour;

    ctx.beginPath();
    ctx.rect(this.x, this.y, this.size, this.size);

    ctx.fill();
    ctx.restore();
};

function randomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)];
    return color;
}

document.getElementById('word-fun-input').addEventListener('keypress', newCharacter);
document.getElementById('pause').addEventListener('click',
    function () {
        if (running) {
            cancelAnimationFrame(animRequest);
            running = false;
        } else {
            requestAnimationFrame(anim.explode.bind(anim));
            running = true;
        }
    });

document.getElementById('word-fun-input').focus();

var anim = new Animator(document.getElementById('word-fun-canvas'));
var running = false;
var animRequest;

function newCharacter() {
    "use strict";

    var canvas = document.getElementById('word-fun-canvas'),
        mW = canvas.width,
        mH = canvas.height;

    // don't get too close to the edge unless we have no choice
    var x = ran(mW > 100 ? 25 : 0, mW);
    var y = ran(mH > 100 ? 25 : 0, mH);

    anim.pushExploder(new Exploder(anim.ctx, x, y));
}


function ran(min, max) {
    "use strict";
    return Math.floor(Math.random() * (max - min)) + min;
}