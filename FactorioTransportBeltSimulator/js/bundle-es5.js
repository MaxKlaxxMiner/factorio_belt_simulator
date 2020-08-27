var Game = (function () {
    function Game(gameDiv, canvasWidth, canvasHeight) {
        this.title = document.title;
        this.nextFrameLog = 0;
        this.lastFrameLog = 0;
        this.calcTime = 0;
        this.countFrame = 0;
        this.countCalc = 0;
        this.animate = 0;
        this.scaleLevel = 5;
        this.gameDiv = gameDiv;
        gameDiv.style.width = canvasWidth + "px";
        gameDiv.style.height = canvasHeight + "px";
        gameDiv.style.backgroundColor = "#036";
        this.canvasElement = document.createElement("canvas");
        this.canvasElement.width = canvasWidth;
        this.canvasElement.height = canvasHeight;
        this.canvasContext = this.canvasElement.getContext("2d");
        gameDiv.appendChild(this.canvasElement);
        this.sprites = new Sprites();
    }
    Game.prototype.ui = function () {
        if (keys[107]) {
            keys[107] = false;
            this.scaleLevel++;
            if (this.scaleLevel > 6)
                this.scaleLevel = 6;
        }
        if (keys[109]) {
            keys[109] = false;
            this.scaleLevel--;
            if (this.scaleLevel < 0)
                this.scaleLevel = 0;
        }
    };
    Game.prototype.calc = function () {
        this.animate++;
        this.countCalc++;
        this.calcTime += 16.6666666;
    };
    Game.prototype.draw = function () {
        var sp = this.sprites;
        var c = this.canvasContext;
        var w = this.canvasElement.width;
        var h = this.canvasElement.height;
        if (!sp || !sp.hasLoaded())
            return;
        this.ui();
        var time = performance.now();
        if (this.calcTime === 0)
            this.calcTime = time;
        if (this.calcTime < time + 30 && this.calcTime > time - 30)
            this.calc();
        else
            while (this.calcTime < time - 20)
                this.calc();
        c.imageSmoothingEnabled = false;
        c.imageSmoothingQuality = "high";
        var scale = 4 << this.scaleLevel;
        var ofsX = -scale * 0.5;
        var ofsY = -scale * 0.5;
        var animate = this.animate & 15;
        var animate2 = (this.animate * 0.70) & 31;
        c.clearRect(0, 0, w, h);
        if (this.scaleLevel > 1) {
            var gridWidth = Math.floor(this.sprites.tutorialGrid.width * scale / 64);
            var gridHeight = Math.floor(this.sprites.tutorialGrid.height * scale / 64);
            for (var y = 0; y < h; y += gridHeight) {
                for (var x = -(y % gridWidth) * 6; x < w; x += gridWidth) {
                    c.drawImage(this.sprites.tutorialGrid, x, y, gridWidth, gridHeight);
                }
            }
        }
        else {
            c.fillStyle = "#848484";
            c.fillRect(0, 0, w, w);
        }
        if (this.scaleLevel < 2)
            c.imageSmoothingEnabled = true;
        var belt = function (x, y, type) {
            c.drawImage(sp.transportBelt, animate * 64, type * 64, 64, 64, x * scale + ofsX, y * scale + ofsY, scale * 2, scale * 2);
        };
        belt(1, 1, 8);
        belt(2, 1, 0);
        belt(3, 1, 0);
        belt(4, 1, 0);
        belt(5, 1, 11);
        belt(1, 2, 2);
        belt(5, 2, 3);
        belt(1, 3, 2);
        belt(2, 3, 9);
        belt(3, 3, 1);
        belt(4, 3, 10);
        belt(5, 3, 3);
        belt(1, 4, 4);
        belt(2, 4, 7);
        belt(4, 4, 4);
        belt(5, 4, 7);
        var splOfsX = -scale * 0.15;
        var splOfsY = -scale * 0.0;
        var splW = Math.floor(sp.splitterSouth.width / 8);
        var splH = Math.floor(sp.splitterSouth.height / 4);
        belt(6, 2, 14);
        belt(7, 2, 0);
        belt(8, 2, 11);
        belt(9, 2, 9);
        belt(10, 2, 1);
        belt(11, 2, 18);
        belt(8, 3, 3);
        belt(9, 3, 3);
        belt(6, 4, 15);
        belt(7, 4, 1);
        belt(8, 4, 7);
        belt(9, 4, 5);
        belt(10, 4, 0);
        belt(11, 4, 19);
        c.drawImage(sp.splitterSouth, (animate2 & 7) * splW, (animate2 >> 3) * splH, splW, splH, 8 * scale + splOfsX, 3 * scale + splOfsY, scale * 2.55, scale);
        c.beginPath();
        c.strokeStyle = "#0f0";
        c.lineWidth = 1;
        c.moveTo(8 * scale + 0.5, 0);
        c.lineTo(8 * scale + 0.5, 8 * scale);
        c.moveTo(9 * scale + 0.5, 0);
        c.lineTo(9 * scale + 0.5, 8 * scale);
        c.moveTo(10 * scale + 0.5, 0);
        c.lineTo(10 * scale + 0.5, 8 * scale);
        c.stroke();
        c.closePath();
        if (this.animate < 120) {
            c.globalAlpha = Easing.easeInQuad((120 - this.animate) / 120);
            c.fillStyle = "#000";
            c.fillRect(0, 0, w, h);
            c.globalAlpha = 1.0;
        }
        this.countFrame++;
        if (time > this.nextFrameLog) {
            if (this.countFrame > 0)
                document.title = this.title + " - FPS " + (this.countFrame / (time - this.lastFrameLog) * 1000).toFixed(1) + ", UPS " + (this.countCalc / (time - this.lastFrameLog) * 1000).toFixed(1);
            this.countFrame = 0;
            this.countCalc = 0;
            this.nextFrameLog += 1000;
            this.lastFrameLog = time;
            if (this.nextFrameLog < time)
                this.nextFrameLog = time;
        }
    };
    Game.run = function () {
        document.body.onkeydown = function (e) {
            console.log("key pressed: " + e.keyCode);
            keys[e.keyCode] = true;
        };
        document.body.onkeyup = function (e) {
            keys[e.keyCode] = false;
        };
        var docSize = getDocumentSize();
        var div = document.getElementById("game");
        game = new Game(div, docSize.width, docSize.height);
        var run = function () { requestAnimFrame(run); game.draw(); };
        run();
    };
    return Game;
}());
var keys = {};
var game;
var Sprites = (function () {
    function Sprites() {
        var _this = this;
        this.loadChecked = false;
        Sprites.loadImg("/factorio/data/base/graphics/terrain/tutorial-grid/hr-tutorial-grid1.png", function (img) { _this.tutorialGrid = img; });
        var path = "/factorio/data/base/graphics/entity/";
        Sprites.loadImg(path + "transport-belt/transport-belt.png", function (img) { _this.transportBelt = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-east.png", function (img) { _this.splitterEast = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-north.png", function (img) { _this.splitterNorth = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-south.png", function (img) { _this.splitterSouth = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-west.png", function (img) { _this.splitterWest = img; });
        Sprites.loadImg(path + "underground-belt/underground-belt-structure.png", function (img) { _this.undergroundBelt = img; });
    }
    Sprites.loadImg = function (url, callback) {
        var _this = this;
        var img = new Image();
        img.onload = function () { return callback(img); };
        img.onerror = function () {
            console.error("load error: " + url);
            if (_this.showError)
                return;
            alert("load error: " + url);
            _this.showError = true;
        };
        img.src = url;
    };
    Sprites.prototype.hasLoaded = function () {
        if (this.loadChecked)
            return true;
        var check = this.tutorialGrid && this.transportBelt && this.splitterEast && this.splitterNorth && this.splitterSouth && this.splitterWest && this.undergroundBelt && true;
        if (check)
            this.loadChecked = true;
        return check;
    };
    Sprites.showError = false;
    return Sprites;
}());
var requestAnimFrame = (function () { return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || (function (cb) { return window.setTimeout(cb, 1000 / 60); })); })();
function getDocumentSize() {
    var body = document.body;
    var html = document.documentElement;
    return {
        width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
        height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    };
}
var Easing = {
    linear: function (t) { return t; },
    easeInQuad: function (t) { return t * t; },
    easeOutQuad: function (t) { return t * (2 - t); },
    easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    easeInCubic: function (t) { return t * t * t; },
    easeOutCubic: function (t) { return (--t) * t * t + 1; },
    easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    easeInQuart: function (t) { return t * t * t * t; },
    easeOutQuart: function (t) { return 1 - (--t) * t * t * t; },
    easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; },
    easeInQuint: function (t) { return t * t * t * t * t; },
    easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t; },
    easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; }
};
//# sourceMappingURL=bundle-es5.js.map