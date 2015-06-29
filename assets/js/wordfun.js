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