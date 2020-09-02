var Display = (function () {
    function Display(gameDiv, canvasWidth, canvasHeight) {
        this.title = document.title;
        this.countFrame = 0;
        this.countCalc = 0;
        this.nextFrameLog = 0;
        this.lastFrameLog = 0;
        this.animate = 0;
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
        this.setScale(5);
        this.entityTransportBelt = new DisplayEntityTransportBelt();
        this.entitySplitter = new DisplayEntitySplitter();
    }
    Display.prototype.setScale = function (scaleLevel) {
        scaleLevel = Math.floor(scaleLevel);
        if (scaleLevel > 6)
            scaleLevel = 6;
        if (scaleLevel < 0)
            scaleLevel = 0;
        if (scaleLevel !== this.scaleLevel) {
            this.scaleLevel = scaleLevel;
            this.scale = 4 << scaleLevel;
        }
    };
    Display.prototype.calc = function () {
        this.animate++;
        this.countCalc++;
    };
    Display.prototype.draw = function (time) {
        var _this = this;
        if (!this.sprites || !this.sprites.hasLoaded())
            return false;
        this.entityTransportBelt.prepareForDisplay(this);
        this.entitySplitter.prepareForDisplay(this);
        var c = this.canvasContext;
        var w = this.canvasElement.width;
        var h = this.canvasElement.height;
        c.imageSmoothingEnabled = false;
        c.imageSmoothingQuality = "high";
        if (this.scaleLevel > 1) {
            c.clearRect(0, 0, w, h);
            var gridWidth = Math.floor(this.sprites.tutorialGrid.width * this.scale / 64);
            var gridHeight = Math.floor(this.sprites.tutorialGrid.height * this.scale / 64);
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
        var belt = this.entityTransportBelt.draw;
        var splitter = this.entitySplitter.draw;
        belt(2, 1, 8);
        belt(3, 1, 0);
        belt(5, 1, 0);
        belt(6, 1, 11);
        belt(1, 2, 17);
        belt(2, 2, 2);
        belt(3, 2, 14);
        belt(5, 2, 19);
        belt(6, 2, 3);
        belt(7, 2, 16);
        splitter(4, 1, 3, this.animate & 31);
        splitter(1, 3, 0);
        splitter(6, 3, 1, this.animate * 0.2 & 31);
        splitter(4, 4, 2, this.animate * 2 & 31);
        belt(1, 4, 12);
        belt(2, 4, 2);
        belt(3, 4, 15);
        belt(5, 4, 18);
        belt(6, 4, 3);
        belt(7, 4, 13);
        belt(2, 5, 4);
        belt(3, 5, 1);
        belt(5, 5, 1);
        belt(6, 5, 7);
        var helpLines = function (x, y, width, height) {
            c.beginPath();
            c.strokeStyle = "#0f0";
            c.lineWidth = 1;
            var s = _this.scale;
            for (var cy = 0; cy <= height; cy++) {
                c.moveTo(x * s + 0.5, (y + cy) * s + 0.5);
                c.lineTo((x + width) * s + 0.5, (y + cy) * s + 0.5);
            }
            for (var cx = 0; cx <= width; cx++) {
                c.moveTo((x + cx) * s + 0.5, y * s + 0.5);
                c.lineTo((x + cx) * s + 0.5, (y + height) * s + 0.5);
            }
            c.stroke();
            c.closePath();
        };
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
        return true;
    };
    return Display;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DisplayEntity = (function () {
    function DisplayEntity() {
        this.draw = this.draw.bind(this);
    }
    DisplayEntity.prototype.prepareForDisplay = function (display) {
        this.ctx = display.canvasContext;
        this.ofsX = 0;
        this.ofsY = 0;
        this.scale = display.scale;
        this.scaleX = display.scale;
        this.scaleY = display.scale;
        this.spriteW = 32;
        this.spriteH = 32;
        this.animate = display.animate;
    };
    DisplayEntity.prototype.draw = function (x, y, type, animate) {
    };
    return DisplayEntity;
}());
var DisplayEntityTransportBelt = (function (_super) {
    __extends(DisplayEntityTransportBelt, _super);
    function DisplayEntityTransportBelt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayEntityTransportBelt.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.sprite = display.sprites.transportBelt;
        this.ofsX -= this.scale * 0.5;
        this.ofsY -= this.scale * 0.5;
        this.scaleX *= 2;
        this.scaleY *= 2;
        this.spriteW = this.sprite.width / 16 >> 0;
        this.spriteH = this.sprite.height / 20 >> 0;
        this.animate &= 15;
    };
    DisplayEntityTransportBelt.prototype.draw = function (x, y, type) {
        this.ctx.drawImage(this.sprite, this.animate * this.spriteW, type * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntityTransportBelt;
}(DisplayEntity));
var DisplayEntitySplitterSouth = (function (_super) {
    __extends(DisplayEntitySplitterSouth, _super);
    function DisplayEntitySplitterSouth() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayEntitySplitterSouth.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.belt = display.entityTransportBelt;
        this.sprite = display.sprites.splitterSouth;
        this.ofsX -= this.scale * 0.155;
        this.scaleX *= 2.56;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterSouth.prototype.draw = function (x, y, type, animate) {
        this.belt.draw(x, y, 3);
        this.belt.draw(x + 1, y, 3);
        if (animate === undefined)
            animate = this.animate;
        this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntitySplitterSouth;
}(DisplayEntity));
var DisplayEntitySplitterNorth = (function (_super) {
    __extends(DisplayEntitySplitterNorth, _super);
    function DisplayEntitySplitterNorth() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayEntitySplitterNorth.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.belt = display.entityTransportBelt;
        this.sprite = display.sprites.splitterNorth;
        this.ofsX -= this.scale * 0.03;
        this.ofsY -= this.scale * 0.05;
        this.scaleX *= 2.5;
        this.scaleY *= 1.1;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterNorth.prototype.draw = function (x, y, type, animate) {
        this.belt.draw(x, y, 2);
        this.belt.draw(x + 1, y, 2);
        if (animate === undefined)
            animate = this.animate;
        this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntitySplitterNorth;
}(DisplayEntity));
var DisplayEntitySplitterWestTop = (function (_super) {
    __extends(DisplayEntitySplitterWestTop, _super);
    function DisplayEntitySplitterWestTop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayEntitySplitterWestTop.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.belt = display.entityTransportBelt;
        this.sprite = display.sprites.splitterWestTop;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.ofsX -= this.scale * 0.015;
        this.ofsY -= this.scale * 0.31;
        this.scaleX *= 1.40;
        this.scaleY *= 1.50;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterWestTop.prototype.draw = function (x, y, type, animate) {
        this.belt.draw(x, y, 1);
        if (animate === undefined)
            animate = this.animate;
        this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntitySplitterWestTop;
}(DisplayEntity));
var DisplayEntitySplitterWest = (function (_super) {
    __extends(DisplayEntitySplitterWest, _super);
    function DisplayEntitySplitterWest() {
        var _this = _super.call(this) || this;
        _this.top = new DisplayEntitySplitterWestTop();
        return _this;
    }
    DisplayEntitySplitterWest.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.top.prepareForDisplay(display);
        this.belt = display.entityTransportBelt;
        this.sprite = display.sprites.splitterWest;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.ofsX -= this.scale * 0.015;
        this.ofsY -= this.scale * 0.30;
        this.scaleX *= 1.40;
        this.scaleY *= 1.35;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterWest.prototype.draw = function (x, y, type, animate) {
        this.top.draw(x, y, type, animate);
        this.belt.draw(x, y + 1, 1);
        if (animate === undefined)
            animate = this.animate;
        this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, (y + 1) * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntitySplitterWest;
}(DisplayEntity));
var DisplayEntitySplitterEastTop = (function (_super) {
    __extends(DisplayEntitySplitterEastTop, _super);
    function DisplayEntitySplitterEastTop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayEntitySplitterEastTop.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.belt = display.entityTransportBelt;
        this.sprite = display.sprites.splitterEastTop;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.ofsX -= this.scale * 0.075;
        this.ofsY -= this.scale * 0.435;
        this.scaleX *= 1.40;
        this.scaleY *= 1.62;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterEastTop.prototype.draw = function (x, y, type, animate) {
        this.belt.draw(x, y, 0);
        if (animate === undefined)
            animate = this.animate;
        this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntitySplitterEastTop;
}(DisplayEntity));
var DisplayEntitySplitterEast = (function (_super) {
    __extends(DisplayEntitySplitterEast, _super);
    function DisplayEntitySplitterEast() {
        var _this = _super.call(this) || this;
        _this.top = new DisplayEntitySplitterEastTop();
        return _this;
    }
    DisplayEntitySplitterEast.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.top.prepareForDisplay(display);
        this.belt = display.entityTransportBelt;
        this.sprite = display.sprites.splitterEast;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.ofsX -= this.scale * 0.075;
        this.ofsY -= this.scale * 0.25;
        this.scaleX *= 1.40;
        this.scaleY *= 1.31;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterEast.prototype.draw = function (x, y, type, animate) {
        this.top.draw(x, y, type, animate);
        this.belt.draw(x, y + 1, 0);
        if (animate === undefined)
            animate = this.animate;
        this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, (y + 1) * this.scale + this.ofsY, this.scaleX, this.scaleY);
    };
    return DisplayEntitySplitterEast;
}(DisplayEntity));
var DisplayEntitySplitter = (function (_super) {
    __extends(DisplayEntitySplitter, _super);
    function DisplayEntitySplitter() {
        var _this = _super.call(this) || this;
        _this.splitterNorth = new DisplayEntitySplitterNorth();
        _this.splitterSouth = new DisplayEntitySplitterSouth();
        _this.splitterWest = new DisplayEntitySplitterWest();
        _this.splitterEast = new DisplayEntitySplitterEast();
        return _this;
    }
    DisplayEntitySplitter.prototype.prepareForDisplay = function (display) {
        _super.prototype.prepareForDisplay.call(this, display);
        this.splitterNorth.prepareForDisplay(display);
        this.splitterSouth.prepareForDisplay(display);
        this.splitterWest.prepareForDisplay(display);
        this.splitterEast.prepareForDisplay(display);
    };
    DisplayEntitySplitter.prototype.draw = function (x, y, type, animate) {
        switch (type) {
            case 0:
                this.splitterNorth.draw(x, y, 0, animate);
                break;
            case 1:
                this.splitterSouth.draw(x, y, 0, animate);
                break;
            case 2:
                this.splitterWest.draw(x, y, 0, animate);
                break;
            case 3:
                this.splitterEast.draw(x, y, 0, animate);
                break;
        }
    };
    return DisplayEntitySplitter;
}(DisplayEntity));
var Game = (function () {
    function Game(gameDiv, canvasWidth, canvasHeight) {
        this.calcTime = 0;
        this.display = new Display(gameDiv, canvasWidth, canvasHeight);
    }
    Game.prototype.uiUpdate = function () {
        if (keys[107]) {
            keys[107] = false;
            this.display.setScale(this.display.scaleLevel + 1);
        }
        if (keys[109]) {
            keys[109] = false;
            this.display.setScale(this.display.scaleLevel - 1);
        }
    };
    Game.prototype.calc = function () {
        this.display.calc();
        this.calcTime += 16.6666666;
    };
    Game.prototype.draw = function () {
        var time = performance.now();
        if (!this.display.draw(time))
            return;
        this.uiUpdate();
        if (this.calcTime === 0)
            this.calcTime = time;
        if (this.calcTime < time + 30 && this.calcTime > time - 30)
            this.calc();
        else
            while (this.calcTime < time - 20)
                this.calc();
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
        Sprites.loadImg(path + "transport-belt/hr-transport-belt.png", function (img) { _this.transportBelt = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-north.png", function (img) { _this.splitterNorth = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-south.png", function (img) { _this.splitterSouth = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-east-top_patch.png", function (img) { _this.splitterEastTop = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-east.png", function (img) { _this.splitterEast = img; });
        Sprites.loadImg(path + "splitter/hr-splitter-west-top_patch.png", function (img) { _this.splitterWestTop = img; });
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
        var check = this.tutorialGrid
            && this.transportBelt
            && this.splitterNorth && this.splitterSouth && this.splitterWestTop && this.splitterWest && this.splitterEastTop && this.splitterEast
            && this.undergroundBelt
            && true;
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