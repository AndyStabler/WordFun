/**
 * Created By Andy Stabler
 */
var wordFun = {GRAVITY: .5};

/**
 * The animator is the main controller for the explosions
 *
 * Contains a queue of exploders (a new exploder is added when the fire event occurs. They are removed once
 *  the exploder dies)
 *
 * There must be a canvas with the id 'word-fun-canvas' - this is where the drawings will take place
 */
wordFun.animator = function () {
    "use strict";
    this.ctx = document.getElementById('word-fun-canvas').getContext('2d');
    this.initDimension();
    this.exploders = [];
    this.clearCanvas();
    this.started = false;
    this.paused = false;
};

/**
 * Sets the dimension of the canvas to the window's dimension
 */
wordFun.animator.prototype.initDimension = function () {
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
wordFun.animator.prototype.pushExploder = function (exploder) {
    "use strict";
    if (this.paused)
        return;
    var that = this;
    // add the exploder to the end of the queue
    this.exploders.push(exploder);

    // check the explosion every so often - once it's finished remove it from the animation
    var t = setInterval(function () {
        if (exploder.isFinished()) {
            // remove it from queue
            that.shiftExploder();
            // stop checking to see if it's dead once we know it is
            clearInterval(t);
        }
    }, 500);

    if (!this.started) {
        this.started = true;
        this.animRequest = requestAnimationFrame(anim.explode.bind(anim));
    }
};

/**
 * Remove an exploder from the animation queue - done once an exploder has finished
 */
wordFun.animator.prototype.shiftExploder = function () {
    "use strict";
    // remove most recent exploder from queue
    this.exploders.shift();
    // stop the animation if there are no explosions to animate
    if (this.exploders.length == 0) {
        cancelAnimationFrame(this.animRequest);
        this.started = false;
        this.clearCanvas();
    }
};

wordFun.animator.prototype.clearCanvas = function () {
    "use strict";
    this.ctx.clearRect(0, 0, this.width, this.height);
};

/**
 * Main draw function for the Animator object
 *
 * calls explode function on each exploder in the queue
 */
wordFun.animator.prototype.explode = function () {
    "use strict";
    this.initDimension();
    this.exploders.forEach(function (exploder) {
        exploder.explode();
    });

    this.animRequest = requestAnimationFrame(this.explode.bind(this));
};

/**
 * Create a new Exploder and add it to the queue to be drawn
 */
wordFun.animator.prototype.fire = function () {
    "use strict";

    var mW = this.ctx.canvas.width,
        mH = this.ctx.canvas.height;

    // don't get too close to the edge unless we have no choice
    var x = wordFun.ran(mW > 200 ? 100 : 0, mW > 200 ? mW - 100 : mW);
    var y = wordFun.ran(mH > 200 ? 100 : 0, mH > 200 ? mH - 100 : mH);

    this.pushExploder(new wordFun.exploder(this.ctx, x, y));
};

wordFun.animator.prototype.pauseToggle = function () {
    "use strict";
    if (this.paused) {
        this.paused = false;
        requestAnimationFrame(anim.explode.bind(anim));
    } else {
        this.paused = true;
        this.animRequest = cancelAnimationFrame(this.animRequest);
    }
};

/**
 * An exploder is a firework - holds many pellets that fly off when a key is pressed
 * @param ctx the canvas context to draw the explosion on to
 * @param x the x coordinate of the explosion
 * @param y the y coordinate of the explosion
 */
wordFun.exploder = function (ctx, x, y) {
    "use strict";
    this.ctx = ctx;
    // generate a number of pellets to be used in the explosion
    this.makePellets(x, y, 20);
};

/**
 * Generates a number of pellets for use in the explosion
 * @param x the x coordinate of the pellet
 * @param y the y coordinate of the pellet
 * @param count the number of pellets to generate
 */
wordFun.exploder.prototype.makePellets = function (x, y, count) {
    "use strict";
    var pellets = [];
    for (var i = 0; i < count; i++)
        pellets.push(new wordFun.pellet(x, y));
    this.pellets = pellets;
};

/**
 * Draws the pellets and updates their position
 */
wordFun.exploder.prototype.explode = function () {
    "use strict";
    this.draw();
    // increase the angle of rotation
    this.pellets.forEach(function (pellet) {
        pellet.updatePosition();
    });
};

/**
 * Draws all pellets in the explosion onto the canvas
 */
wordFun.exploder.prototype.draw = function () {
    "use strict";
    var that = this;
    this.pellets.forEach(function (pellet) {
        pellet.draw(that.ctx);
    });
};

/**
 * if any pellet in the explosion is dead, then the explosion is finished
 * TODO: could class Exploder as finished when all pellets are dead?
 * @return {boolean}
 */
wordFun.exploder.prototype.isFinished = function () {
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
wordFun.pellet = function (x, y) {
    "use strict";
    this.size = 8;
    this.x = x;
    this.y = y;
    this.opacity = 1;
    this.dead = false;
    this.speed = wordFun.ran(5, 10);
    this.setAngle(wordFun.ran(0, 360) * (Math.PI / 180));
    this.colour = wordFun.randomColor();
};

wordFun.pellet.prototype.setAngle = function (angle) {
    "use strict";
    this.angle = angle;
    this.scaleX = Math.cos(this.angle);
    this.scaleY = Math.sin(this.angle);
    this.vx = this.speed * this.scaleX;
    this.vy = this.speed * this.scaleY;
};

/**
 * Updates the pellet's position
 */
wordFun.pellet.prototype.updatePosition = function () {
    "use strict";
    this.x += this.vx;
    this.y -= this.vy;
    this.vy -= wordFun.GRAVITY;

    // decrease the opacity over time - once its opacity is low enough we class it as dead
    this.opacity -= this.opacity > .02 ? .02 : 0;
    if (this.opacity <= 0.2)
        this.dead = true;
};

/**
 * Draw the pellet on the canvas' context
 */
wordFun.pellet.prototype.draw = function (ctx) {
    "use strict";
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.size, this.size);
    ctx.fill();
    ctx.restore();
};

wordFun.randomColor = function () {
    "use strict";
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)];
    return color;
};

wordFun.ran = function (min, max) {
    "use strict";
    return Math.floor(Math.random() * (max - min)) + min;
};

// This is some guff needed so the requestAnimationFrame/cancelAnimationFrame function calls work across most browsers

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
