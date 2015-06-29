/**
 * Created by andy on 27/06/15.
 */

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

document.getElementById('word-fun-input').addEventListener('keypress', temp);
document.getElementById('word-fun-input').focus();

function temp() {
    var anim = new Animator(document.getElementById('word-fun-canvas'));
    var pellets = anim.createPellets(200, 200);
    var request = requestAnimationFrame(function () {
        anim.explode(pellets)
    });

    setTimeout(function () {
        cancelAnimationFrame(request)
    }, 5000);
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

function Animator(canvas) {
    canvas.setAttribute('width', '500');
    canvas.setAttribute('height', '500');
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
}

Animator.prototype.createPellets = function (x, y) {
    return makePellets(x, y, 5);
};

Animator.prototype.explode = function (pellets) {
    this.draw(pellets);
    // increase the angle of rotation
    pellets.forEach(function (pellet) {
        pellet.angle += 3 * Math.PI / 180;
        pellet.updatePosition();
    });
    requestAnimationFrame(function () {
        this.explode(pellets)
    }.bind(this));
};

Animator.prototype.draw = function (pellets) {
    //this.ctx.clearRect(0, 0, this.width, this.height);
    var that = this;
    pellets.forEach(function (pellet) {
        pellet.draw(that.ctx);
    });
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(200, 200, 25, 25);
};

function makePellets(x, y, count) {
    var pellets = [];
    for (var i = 0; i < count; i++)
        pellets.push(new Pellet(x, y));
    return pellets;
}

function Pellet(x, y) {
    this.size = 25;
    this.x = x;//Math.floor(Math.random() * (x + 100 - x - 100)) + x - 100;//
    this.y = y;//Math.floor(Math.random() * (y + 100 - y - 100)) + y - 100;//
    this.generateArcCx();
    this.generateArcCy();
    // radius is the hyp
    this.arcRadius = Math.sqrt(Math.pow(this.arcCx, 2) + Math.pow(this.arcCy, 2));
    this.colour = randomColor();
    this.angle = 3 * Math.PI / 180;
    console.log("arcCx = " + this.arcCx + ". this.x = " + this.x + ". is left arc? " + (this.arcCx < this.x) + ". Colour is " + this.colour);
}

Pellet.prototype.generateArcCx = function () {
    // decide between a left and a right arc at random
    this.isLeftArc = Math.random() < 0.5;
    if (this.isLeftArc) {
        // a left arc has been chosen
        var max = this.x - this.size; //500;
        var min = this.x - 4 * this.size; //0;//
    } else {
        // a right arc has been chosen
        max = this.x + 5 * this.size; //500;//
        min = this.x + 2 * this.size; //0;//
    }
    this.arcCx = Math.floor(Math.random() * (max - min)) + min;
};

Pellet.prototype.generateArcCy = function () {
    var max = this.y + this.size / 2;
    var min = this.y - this.size;
    this.arcCy = Math.floor(Math.random() * (max - min)) + min;
};

Pellet.prototype.updatePosition = function () {
    // check if we're firing to the left
    // update coordinates
    this.x = this.arcCx + this.size * (this.isLeftArc ? Math.sin(this.angle) : Math.cos(this.angle));
    this.y = this.arcCy + this.size * (this.isLeftArc ? Math.cos(this.angle) : Math.sin(this.angle))*2;
};

Pellet.prototype.draw = function (ctx) {
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.size, this.size);
    ctx.fill();
};

function randomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)];
    return color;
}