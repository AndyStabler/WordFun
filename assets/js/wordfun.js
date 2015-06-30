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
    canvas.setAttribute('width', '500');
    canvas.setAttribute('height', '500');
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.exploders = [];
    this.clearCanvas();
}

Animator.prototype.pushExploder = function (exploder) {
    "use strict";
    var that = this;
    // add the exploder to the beginning of the
    this.exploders.push(exploder);

    if (!running) {
        running = true;
        requestAnimationFrame(anim.explode.bind(anim));
    }
    // remove the exploder after some time
    setTimeout(function () {
        that.shiftExploder();
    }, 1000);
};

Animator.prototype.shiftExploder = function () {
    "use strict";
    // remove from beginning
    this.exploders.shift();
    // stop the animation if there are no explosions to animte
    if (this.exploders.length == 0) {
        cancelAnimationFrame(animRequest);
        running = false;
        this.clearCanvas();
    }
};

Animator.prototype.clearCanvas = function () {
    "use strict";
    //this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
};

Animator.prototype.explode = function () {
    "use strict";
    this.clearCanvas();
    this.exploders.forEach(function (exploder) {
        exploder.explode();
    });

    animRequest = requestAnimationFrame(this.explode.bind(this));
};

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

function Exploder(ctx, x, y) {
    "use strict";
    this.ctx = ctx;
    this.makePellets(x, y, 10);
}

Exploder.prototype.makePellets = function (x, y, count) {
    "use strict";
    var pellets = [];
    for (var i = 0; i < count; i++)
        pellets.push(new Pellet(x, y));
    this.pellets = pellets;
};

Exploder.prototype.explode = function () {
    "use strict";
    this.draw();
    // increase the angle of rotation
    this.pellets.forEach(function (pellet) {
        pellet.angle += 3 * Math.PI / 180;
        pellet.updatePosition();
    });
};

Exploder.prototype.draw = function () {
    "use strict";
    var that = this;
    this.pellets.forEach(function (pellet) {
        pellet.draw(that.ctx);
    });

    // just the center dot for debugging
    this.ctx.fillStyle = "#cccccc";
    this.ctx.fillRect(200, 200, 5, 5);
};

function Pellet(x, y) {
    this.size = 25;
    this.x = x;
    this.y = y;
    this.opacity = 1;
    this.generateArcCx();
    this.generateArcCy();
    // radius is the hyp
    this.arcRadius = Math.sqrt(Math.pow(Math.abs(this.arcCx - this.x), 2) + Math.pow(Math.abs(this.arcCy - this.y), 2));
    this.colour = randomColor();
    this.angle = 3 * Math.PI / 180;
    console.log("arcCx = " + this.arcCx + ". this.x = " + this.x + ". is left arc? " + (this.arcCx < this.x) + ". Colour is " + this.colour);
}

Pellet.prototype.generateArcCx = function () {
    // decide between a left and a right arc at random
    this.isLeftArc = Math.random() < 0.5;
    if (this.isLeftArc) {
        // a left arc has been chosen
        var max = this.x - this.size;
        var min = this.x - 4 * this.size;//4 * this.size;
    } else {
        // a right arc has been chosen
        max = this.x + 5 * this.size;
        min = this.x + 2 * this.size;
    }
    this.arcCx = Math.floor(Math.random() * (max - min)) + min;
};

Pellet.prototype.generateArcCy = function () {
    var max = this.y;// + this.size / 2; // todo: maybe make max this.y?
    var min = this.y - this.size;
    this.arcCy = Math.floor(Math.random() * (max - min)) + min;
};

Pellet.prototype.updatePosition = function () {
    // check if we're firing to the left
    // update coordinates

    var xRad = this.isLeftArc ? this.arcRadius : -this.arcRadius;

    this.x = this.arcCx + xRad * Math.cos(this.angle);//(this.isLeftArc ? Math.sin(this.angle) : Math.cos(this.angle));
    this.y = this.arcCy - this.arcRadius * Math.sin(this.angle);//(this.isLeftArc ? Math.cos(this.angle) : Math.sin(this.angle));
    //this.opacity += 0.001;
};

Pellet.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.colour;

    ctx.beginPath();
    //ctx.rotate(this.angle);
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

/*
 http://stackoverflow.com/a/1846704/3380056
 */
function keyPressed(e) {
    "use strict";
    var keynum;
    if (window.event) { // IE
        keynum = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera
        keynum = e.which;
    }
    return keynum;
}

function update(evt) {
    "use strict";
    var key = keyPressed(evt);
    alert(key + " matches /[a-zA-Z0-9]/ : " + /[a-zA-Z0-9]/.test(String.fromCharCode(key)));
    if (!/[a-zA-Z0-9]/.test(String.fromCharCode(key))) return;

    var canvas = document.getElementById('word-fun-canvas');

    // TODO: remove gaps in value range
    // integer range = 48-57 (min/max inclusive)
    // char range = 65-90, 97-122

}