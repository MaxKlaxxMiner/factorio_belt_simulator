var Display = (function () {
    function Display(gameDiv, canvasWidth, canvasHeight, map) {
        this.title = document.title;
        this.countFrame = 0;
        this.countCalc = 0;
        this.nextFrameLog = 0;
        this.lastFrameLog = 0;
        this.animate = 0;
        this.zoomLevels = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 19, 22, 26, 30, 36, 42, 49, 57, 67, 79, 93, 109, 128, 151, 178, 209];
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
        this.setScale(18);
        this.entityTransportBelt = new DisplayEntityTransportBelt();
        this.entitySplitter = new DisplayEntitySplitter();
        this.map = map;
    }
    Display.prototype.setScale = function (scaleLevel) {
        scaleLevel = Math.floor(scaleLevel);
        if (scaleLevel >= this.zoomLevels.length)
            scaleLevel = this.zoomLevels.length - 1;
        if (scaleLevel < 0)
            scaleLevel = 0;
        if (scaleLevel !== this.scaleLevel) {
            this.scaleLevel = scaleLevel;
            this.scale = this.zoomLevels[scaleLevel];
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
        if (this.scaleLevel >= 8) {
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
        var beltAdds = [];
        var entityAdds = [];
        this.map.callEntities(0, 0, 100, 100, function (x, y, e) {
            switch (e.t) {
                case EntityType.transportBelt:
                    {
                        switch (e.d) {
                            case Direction.top:
                                {
                                    if (e.isCurve()) {
                                        if (e.fromLeft())
                                            belt(x, y, BeltType.leftToTop);
                                        if (e.fromRight())
                                            belt(x, y, BeltType.rightToTop);
                                    }
                                    else {
                                        belt(x, y, BeltType.bottomToTop);
                                        if (!e.fromBottom(true))
                                            beltAdds.push({ x: x, y: y + 1, t: BeltType.voidToTop });
                                    }
                                    if (e.tn === undefined || !e.tn.isCurve() && !e.fromTop(true))
                                        beltAdds.push({ x: x, y: y - 1, t: BeltType.bottomToVoid });
                                }
                                break;
                            case Direction.right:
                                {
                                    if (e.isCurve()) {
                                        if (e.fromTop())
                                            belt(x, y, BeltType.topToRight);
                                        if (e.fromBottom())
                                            belt(x, y, BeltType.bottomToRight);
                                    }
                                    else {
                                        belt(x, y, BeltType.leftToRight);
                                        if (!e.fromLeft(true))
                                            beltAdds.push({ x: x - 1, y: y, t: BeltType.voidToRight });
                                    }
                                    if (e.rn === undefined || !e.rn.isCurve() && !e.fromRight(true))
                                        beltAdds.push({ x: x + 1, y: y, t: BeltType.leftToVoid });
                                }
                                break;
                            case Direction.bottom:
                                {
                                    if (e.isCurve()) {
                                        if (e.fromLeft())
                                            belt(x, y, BeltType.leftToBottom);
                                        if (e.fromRight())
                                            belt(x, y, BeltType.rightToBottom);
                                    }
                                    else {
                                        belt(x, y, BeltType.topToBottom);
                                        if (!e.fromTop(true))
                                            beltAdds.push({ x: x, y: y - 1, t: BeltType.voidToBottom });
                                    }
                                    if (e.bn === undefined || !e.bn.isCurve() && !e.fromBottom(true))
                                        beltAdds.push({ x: x, y: y + 1, t: BeltType.topToVoid });
                                }
                                break;
                            case Direction.left:
                                {
                                    if (e.isCurve()) {
                                        if (e.fromTop())
                                            belt(x, y, BeltType.topToLeft);
                                        if (e.fromBottom())
                                            belt(x, y, BeltType.bottomToLeft);
                                    }
                                    else {
                                        belt(x, y, BeltType.rightToLeft);
                                        if (!e.fromRight(true))
                                            beltAdds.push({ x: x + 1, y: y, t: BeltType.voidToLeft });
                                    }
                                    if (e.ln === undefined || !e.ln.isCurve() && !e.fromLeft(true))
                                        beltAdds.push({ x: x - 1, y: y, t: BeltType.rightToVoid });
                                }
                                break;
                        }
                    }
                    break;
                case EntityType._splitterLeft:
                    {
                        switch (e.d) {
                            case Direction.top:
                                {
                                    belt(x, y, BeltType.bottomToTop);
                                    belt(x + 1, y, BeltType.bottomToTop);
                                    if (!e.fromBottom(true))
                                        beltAdds.push({ x: x, y: y + 1, t: BeltType.voidToTop });
                                    if (!e.rn.fromBottom(true))
                                        beltAdds.push({ x: x + 1, y: y + 1, t: BeltType.voidToTop });
                                    if (e.tn === undefined || !e.tn.isCurve() && !e.fromTop(true))
                                        beltAdds.push({ x: x, y: y - 1, t: BeltType.bottomToVoid });
                                    if (e.rn.tn === undefined || !e.rn.tn.isCurve() && !e.rn.fromTop(true))
                                        beltAdds.push({ x: x + 1, y: y - 1, t: BeltType.bottomToVoid });
                                    entityAdds.push({ x: x, y: y, t: 0, draw: splitter });
                                }
                                break;
                            case Direction.right:
                                {
                                    belt(x, y, BeltType.leftToRight);
                                    belt(x, y + 1, BeltType.leftToRight);
                                    if (!e.fromLeft(true))
                                        beltAdds.push({ x: x - 1, y: y, t: BeltType.voidToRight });
                                    if (!e.bn.fromLeft(true))
                                        beltAdds.push({ x: x - 1, y: y + 1, t: BeltType.voidToRight });
                                    if (e.rn === undefined || !e.rn.isCurve() && !e.fromRight(true))
                                        beltAdds.push({ x: x + 1, y: y, t: BeltType.leftToVoid });
                                    if (e.bn.rn === undefined || !e.bn.rn.isCurve() && !e.bn.fromRight(true))
                                        beltAdds.push({ x: x + 1, y: y + 1, t: BeltType.leftToVoid });
                                    entityAdds.push({ x: x, y: y, t: 3, draw: splitter });
                                }
                                break;
                            case Direction.bottom:
                                {
                                    belt(x - 1, y, BeltType.topToBottom);
                                    belt(x, y, BeltType.topToBottom);
                                    if (!e.fromTop(true))
                                        beltAdds.push({ x: x, y: y - 1, t: BeltType.voidToBottom });
                                    if (!e.ln.fromTop(true))
                                        beltAdds.push({ x: x - 1, y: y - 1, t: BeltType.voidToBottom });
                                    if (e.bn === undefined || !e.bn.isCurve() && !e.fromBottom(true))
                                        beltAdds.push({ x: x, y: y + 1, t: BeltType.topToVoid });
                                    if (e.ln.bn === undefined || !e.ln.bn.isCurve() && !e.ln.fromBottom(true))
                                        beltAdds.push({ x: x - 1, y: y + 1, t: BeltType.topToVoid });
                                    entityAdds.push({ x: x - 1, y: y, t: 1, draw: splitter });
                                }
                                break;
                            case Direction.left:
                                {
                                    belt(x, y - 1, BeltType.rightToLeft);
                                    belt(x, y, BeltType.rightToLeft);
                                    if (!e.fromRight(true))
                                        beltAdds.push({ x: x + 1, y: y, t: BeltType.voidToLeft });
                                    if (!e.tn.fromRight(true))
                                        beltAdds.push({ x: x + 1, y: y - 1, t: BeltType.voidToLeft });
                                    if (e.ln === undefined || !e.ln.isCurve() && !e.fromLeft(true))
                                        beltAdds.push({ x: x - 1, y: y, t: BeltType.rightToVoid });
                                    if (e.tn.ln === undefined || !e.tn.ln.isCurve() && !e.tn.fromLeft(true))
                                        beltAdds.push({ x: x - 1, y: y - 1, t: BeltType.rightToVoid });
                                    entityAdds.push({ x: x, y: y - 1, t: 2, draw: splitter });
                                }
                                break;
                        }
                    }
                    break;
            }
        });
        beltAdds.forEach(function (add) {
            belt(add.x, add.y, add.t);
        });
        entityAdds.forEach(function (add) {
            add.draw(add.x, add.y, add.t, add.animate);
        });
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
        var mx = mouseX / this.scale >> 0;
        var my = mouseY / this.scale >> 0;
        if (mouseX + mouseY > 0) {
            c.globalAlpha = 0.7;
            belt(mx - 1, my, 14);
            belt(mx, my, 0);
            belt(mx + 1, my, 19);
            c.globalAlpha = 1;
        }
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
var BeltType;
(function (BeltType) {
    BeltType[BeltType["leftToRight"] = 0] = "leftToRight";
    BeltType[BeltType["rightToLeft"] = 1] = "rightToLeft";
    BeltType[BeltType["bottomToTop"] = 2] = "bottomToTop";
    BeltType[BeltType["topToBottom"] = 3] = "topToBottom";
    BeltType[BeltType["rightToTop"] = 4] = "rightToTop";
    BeltType[BeltType["topToRight"] = 5] = "topToRight";
    BeltType[BeltType["leftToTop"] = 6] = "leftToTop";
    BeltType[BeltType["topToLeft"] = 7] = "topToLeft";
    BeltType[BeltType["bottomToRight"] = 8] = "bottomToRight";
    BeltType[BeltType["rightToBottom"] = 9] = "rightToBottom";
    BeltType[BeltType["bottomToLeft"] = 10] = "bottomToLeft";
    BeltType[BeltType["leftToBottom"] = 11] = "leftToBottom";
    BeltType[BeltType["voidToTop"] = 12] = "voidToTop";
    BeltType[BeltType["topToVoid"] = 13] = "topToVoid";
    BeltType[BeltType["voidToRight"] = 14] = "voidToRight";
    BeltType[BeltType["rightToVoid"] = 15] = "rightToVoid";
    BeltType[BeltType["voidToBottom"] = 16] = "voidToBottom";
    BeltType[BeltType["bottomToVoid"] = 17] = "bottomToVoid";
    BeltType[BeltType["voidToLeft"] = 18] = "voidToLeft";
    BeltType[BeltType["leftToVoid"] = 19] = "leftToVoid";
})(BeltType || (BeltType = {}));
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
        this.sprite = display.sprites.splitterSouth;
        this.ofsX -= this.scale * 0.155;
        this.scaleX *= 2.56;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterSouth.prototype.draw = function (x, y, type, animate) {
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
        this.sprite = display.sprites.splitterEast;
        this.spriteW = this.sprite.width / 8 >> 0;
        this.spriteH = this.sprite.height / 4 >> 0;
        this.ofsX -= this.scale * 0.075;
        this.ofsY -= this.scale * 0.25;
        this.scaleX *= 1.40;
        this.scaleY *= 1.303;
        this.animate = this.animate * 0.70 & 31;
    };
    DisplayEntitySplitterEast.prototype.draw = function (x, y, type, animate) {
        this.top.draw(x, y, type, animate);
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
var keys = {};
var mouseX = 0;
var mouseY = 0;
var mouseButtons = 0;
var mouseWheel = 0;
var game;
var Game = (function () {
    function Game(gameDiv, canvasWidth, canvasHeight) {
        this.lastWheel = 0;
        this.calcTime = 0;
        this.map = new Map();
        this.display = new Display(gameDiv, canvasWidth, canvasHeight, this.map);
        var m = this.map;
        var test = "0eNqdluFugyAUhd/l/qYNF1Crr9Isi7ZkIbFolC5rGt99tF2aZZXscv8Jwc/j4R4uV+j6sx0n5wM0V3CHwc/Q7K8wuw/f9re5cBktNOCCPYEA355uozC1fh6HKWw62wdYBDh/tF/Q4PImwPrggrMP0n1weffnU2enuCDFEDAOc3xt8LevRtQGi20h4BKfzLZYFvHCUhxWfIhyj26yh8cCtULWGWSTRTYcsqGQiwyyztJcZpBVkmxWyBWHTHJjx3HDUDTXT/I89i6EOLfCxCfzf60oM8TKLBswI291lg2oSD78IPV6gpEVNJWAGc55kIIVnNLUpD0pObWp/qLLNTQrUDQ0K1E0Q2pO/WtKlSpJqlKZMGIVyYkUTSyroWGiObKihZRSUIZTCjQ0q4vJhAWsxiVJOllBS23VLq+lIEEfK1KkX9esbkXafc2JFk20YpDxNbTxdnu/CTe/Ls4CPu00P063HZrK1FVZoSyLclm+ARXersg=";
        m.addBlueprint(1, 1, test);
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
        if (this.lastWheel !== mouseWheel) {
            if (mouseWheel < this.lastWheel) {
                this.display.setScale(this.display.scaleLevel + 1);
            }
            else {
                this.display.setScale(this.display.scaleLevel - 1);
            }
            this.lastWheel = mouseWheel;
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
        var docSize = getDocumentSize();
        var div = document.getElementById("game");
        game = new Game(div, docSize.width, docSize.height);
        document.body.onkeydown = function (e) {
            console.log("key pressed: " + e.keyCode);
            keys[e.keyCode] = true;
        };
        document.body.onkeyup = function (e) {
            keys[e.keyCode] = false;
        };
        document.addEventListener("contextmenu", function (event) { return event.preventDefault(); });
        function mouseWheelEvent(m) {
            console.log(m);
            if (m.wheelDelta !== undefined) {
                if (m.wheelDelta < 0)
                    mouseWheel++;
                else
                    mouseWheel--;
                return;
            }
            if (typeof m.deltaY === "number") {
                if (m.deltaY > 0)
                    mouseWheel++;
                else
                    mouseWheel--;
            }
            else {
                if (m.detail > 0)
                    mouseWheel++;
                else
                    mouseWheel--;
            }
        }
        if ("onmousewheel" in window) {
            window.onmousewheel = mouseWheelEvent;
        }
        else {
            document.addEventListener("DOMMouseScroll", mouseWheelEvent, false);
        }
        var mouseEvent = function (m) {
            mouseX = m.x;
            mouseY = m.y;
            mouseButtons = m.buttons;
        };
        div.onmousedown = mouseEvent;
        div.onmousemove = mouseEvent;
        div.onmouseup = mouseEvent;
        var run = function () { requestAnimFrame(run); game.draw(); };
        run();
    };
    return Game;
}());
var EntityType;
(function (EntityType) {
    EntityType[EntityType["transportBelt"] = 0] = "transportBelt";
    EntityType[EntityType["splitter"] = 1] = "splitter";
    EntityType[EntityType["_splitterLeft"] = 2] = "_splitterLeft";
    EntityType[EntityType["_splitterRight"] = 3] = "_splitterRight";
})(EntityType || (EntityType = {}));
var Direction;
(function (Direction) {
    Direction[Direction["top"] = 0] = "top";
    Direction[Direction["right"] = 1] = "right";
    Direction[Direction["bottom"] = 2] = "bottom";
    Direction[Direction["left"] = 3] = "left";
})(Direction || (Direction = {}));
var MapEntity = (function () {
    function MapEntity(x, y, t, d) {
        this.x = x;
        this.y = y;
        this.t = t;
        this.d = d;
    }
    MapEntity.prototype.toTop = function () { return this.d === Direction.top; };
    MapEntity.prototype.toRight = function () { return this.d === Direction.right; };
    MapEntity.prototype.toBottom = function () { return this.d === Direction.bottom; };
    MapEntity.prototype.toLeft = function () { return this.d === Direction.left; };
    MapEntity.prototype.fromTop = function (backCheck) { return this.tn !== undefined && (this.tn.toBottom() || backCheck === true && this.tn.toTop() && !this.tn.isCurve()); };
    MapEntity.prototype.fromRight = function (backCheck) { return this.rn !== undefined && (this.rn.toLeft() || backCheck === true && this.rn.toRight() && !this.rn.isCurve()); };
    MapEntity.prototype.fromBottom = function (backCheck) { return this.bn !== undefined && (this.bn.toTop() || backCheck === true && this.bn.toBottom() && !this.bn.isCurve()); };
    MapEntity.prototype.fromLeft = function (backCheck) { return this.ln !== undefined && (this.ln.toRight() || backCheck === true && this.ln.toLeft() && !this.ln.isCurve()); };
    MapEntity.prototype.isCurve = function () {
        if (this.t === EntityType.transportBelt) {
            switch (this.d) {
                case Direction.top: return !this.fromBottom() && this.fromLeft() !== this.fromRight();
                case Direction.right: return !this.fromLeft() && this.fromTop() !== this.fromBottom();
                case Direction.bottom: return !this.fromTop() && this.fromLeft() !== this.fromRight();
                case Direction.left: return !this.fromRight() && this.fromTop() !== this.fromBottom();
            }
        }
        return false;
    };
    return MapEntity;
}());
var Map = (function () {
    function Map() {
        this.entityLines = [];
    }
    Map.prototype.updatFirstLast = function (x, y) {
        var line = this.entityLines[y];
        if (!line)
            return;
        if (line.firstX === undefined)
            line.firstX = x;
        if (line.lastX === undefined)
            line.lastX = x;
        if (line[x]) {
            if (x < line.firstX)
                line.firstX = x;
            if (x > line.lastX)
                line.lastX = x;
        }
        else {
            while (!line[line.firstX])
                line.firstX++;
            while (!line[line.lastX])
                line.lastX--;
            while (line.length > 0 && !line[line.length - 1])
                line.length--;
        }
        while (this.entityLines.length > 0 && !this.entityLines[this.entityLines.length - 1])
            this.entityLines.length--;
    };
    Map.prototype.removeEntity = function (x, y) {
        var _this = this;
        var line = this.entityLines[y];
        if (!line)
            return false;
        var entity = line[x];
        if (!entity)
            return false;
        var extraRemoves = [];
        switch (entity.t) {
            case EntityType._splitterLeft:
                {
                    switch (entity.d) {
                        case Direction.top:
                            extraRemoves.push({ x: x + 1, y: y });
                            break;
                        case Direction.right:
                            extraRemoves.push({ x: x, y: y + 1 });
                            break;
                        case Direction.bottom:
                            extraRemoves.push({ x: x - 1, y: y });
                            break;
                        case Direction.left:
                            extraRemoves.push({ x: x, y: y - 1 });
                            break;
                    }
                }
                break;
            case EntityType._splitterRight:
                {
                    switch (entity.d) {
                        case Direction.top:
                            extraRemoves.push({ x: x - 1, y: y });
                            break;
                        case Direction.right:
                            extraRemoves.push({ x: x, y: y - 1 });
                            break;
                        case Direction.bottom:
                            extraRemoves.push({ x: x + 1, y: y });
                            break;
                        case Direction.left:
                            extraRemoves.push({ x: x, y: y + 1 });
                            break;
                    }
                }
                break;
        }
        if (entity.ln) {
            delete line[x - 1].rn;
            delete entity.ln;
        }
        if (entity.rn) {
            delete line[x + 1].ln;
            delete entity.rn;
        }
        if (entity.tn) {
            delete this.entityLines[y - 1][x].bn;
            delete entity.tn;
        }
        if (entity.bn) {
            delete this.entityLines[y + 1][x].tn;
            delete entity.bn;
        }
        delete line[x];
        line.count--;
        if (line.count === 0)
            delete this.entityLines[y];
        this.updatFirstLast(x, y);
        if (extraRemoves.length > 0) {
            extraRemoves.forEach(function (e) { _this.removeEntity(e.x, e.y); });
        }
        return true;
    };
    Map.prototype.add = function (x, y, e, d) {
        if (e === EntityType.splitter) {
            switch (d) {
                case Direction.top:
                    {
                        this.add(x, y, EntityType._splitterLeft, d);
                        this.add(x + 1, y, EntityType._splitterRight, d);
                    }
                    break;
                case Direction.right:
                    {
                        this.add(x, y, EntityType._splitterLeft, d);
                        this.add(x, y + 1, EntityType._splitterRight, d);
                    }
                    break;
                case Direction.bottom:
                    {
                        this.add(x, y, EntityType._splitterRight, d);
                        this.add(x + 1, y, EntityType._splitterLeft, d);
                    }
                    break;
                case Direction.left:
                    {
                        this.add(x, y, EntityType._splitterRight, d);
                        this.add(x, y + 1, EntityType._splitterLeft, d);
                    }
                    break;
            }
            return;
        }
        var newEntity = new MapEntity(x, y, e, d);
        this.removeEntity(x, y);
        var lineT = this.entityLines[y - 1];
        var lineB = this.entityLines[y + 1];
        var line = this.entityLines[y];
        if (!line) {
            this.entityLines[y] = line = [];
            line.count = 0;
        }
        line[x] = newEntity;
        line.count++;
        if (line[x - 1]) {
            newEntity.ln = line[x - 1];
            line[x - 1].rn = newEntity;
        }
        if (line[x + 1]) {
            newEntity.rn = line[x + 1];
            line[x + 1].ln = newEntity;
        }
        if (lineT && lineT[x]) {
            newEntity.tn = lineT[x];
            lineT[x].bn = newEntity;
        }
        if (lineB && lineB[x]) {
            newEntity.bn = lineB[x];
            lineB[x].tn = newEntity;
        }
        this.updatFirstLast(x, y);
    };
    Map.prototype.addBlueprint = function (startX, startY, base64) {
        var _this = this;
        var r = Blueprint.decodeBlueprint(base64);
        if (r.length === 0)
            return false;
        r.forEach(function (e) { _this.add(e.x + startX, e.y + startY, e.t, e.d); });
        return true;
    };
    Map.prototype.getBlueprint = function (label) {
        if (label === void 0) { label = "blueprint"; }
        var entities = [];
        for (var y = 0; y < this.entityLines.length; y++) {
            var line = this.entityLines[y];
            if (!line || line.count === 0)
                continue;
            for (var x = line.firstX; x <= line.lastX; x++) {
                var e = line[x];
                if (e) {
                    entities.push(new MapEntity(e.x, e.y, e.t, e.d));
                }
            }
        }
        return Blueprint.encodeBlueprint(label, entities);
    };
    Map.prototype.getEntity = function (x, y) {
        var line = this.entityLines[y];
        if (!line)
            return undefined;
        return line[x];
    };
    Map.prototype.callEntities = function (firstX, firstY, lastX, lastY, call) {
        var lines = this.entityLines;
        if (lastY >= lines.length)
            lastY = lines.length - 1;
        for (var y = firstY; y <= lastY; y++) {
            var line = lines[y];
            if (!line)
                continue;
            var lx = lastX <= line.lastX ? lastX : line.lastX;
            for (var x = firstX >= line.firstX ? firstX : line.firstX; x <= lx; x++) {
                var e = line[x];
                if (e)
                    call(x, y, e);
            }
        }
    };
    return Map;
}());
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
var Blueprint = (function () {
    function Blueprint() {
    }
    Blueprint.decodeBlueprint = function (base64) {
        var result = [];
        try {
            if (base64[0] !== "0")
                return result;
            var blueprint = JSON.parse(pako.inflate(atob(base64.substr(1)), { to: "string" }).toString());
            console.log(blueprint);
            var entities = blueprint.blueprint.entities;
            var minX_1 = 1000000;
            var minY_1 = 1000000;
            entities.forEach(function (e) {
                if (e.position.x < minX_1)
                    minX_1 = e.position.x;
                if (e.position.y < minY_1)
                    minY_1 = e.position.y;
            });
            entities.forEach(function (e) {
                var x = (e.position.x - minX_1 + .01) >> 0;
                var y = (e.position.y - minY_1 + .01) >> 0;
                var d = e.direction === 2 ? Direction.right : e.direction === 6 ? Direction.left : e.direction === 4 ? Direction.bottom : Direction.top;
                switch (e.name) {
                    case "transport-belt":
                        result.push(new MapEntity(x, y, EntityType.transportBelt, d));
                        break;
                    case "splitter":
                        result.push(new MapEntity(x, y, EntityType.splitter, d));
                        break;
                }
            });
        }
        catch (exc) { }
        return result;
    };
    Blueprint.encodeBlueprint = function (label, entities) {
        var result = {
            blueprint: {
                icons: [],
                entities: [],
                label: label,
                item: "blueprint",
                version: 281474976710656
            }
        };
        var count = 0;
        entities.forEach(function (e) {
            var next;
            var dir = e.d === Direction.right ? 2 : e.d === Direction.bottom ? 4 : e.d === Direction.left ? 6 : 0;
            switch (e.t) {
                case EntityType.transportBelt:
                    {
                        next = {
                            entity_number: ++count,
                            name: "transport-belt",
                            position: { x: e.x + 0.5, y: e.y + 0.5 }
                        };
                        if (dir === 2 || dir === 4 || dir === 6)
                            next.direction = dir;
                    }
                    break;
                case EntityType._splitterLeft:
                    {
                        next = {
                            entity_number: ++count,
                            name: "splitter",
                            position: { x: e.x, y: e.y }
                        };
                        switch (e.d) {
                            case Direction.top:
                                next.position.x += 0.5;
                                break;
                            case Direction.right:
                                next.position.y += 0.5;
                                next.direction = 2;
                                break;
                            case Direction.bottom:
                                next.position.x -= 0.5;
                                next.direction = 4;
                                break;
                            case Direction.left:
                                next.position.y -= 0.5;
                                next.direction = 6;
                                break;
                        }
                    }
                    break;
            }
            if (next)
                result.blueprint.entities.push(next);
        });
        return "0" + btoa(pako.deflate(JSON.stringify(result), { to: "string" }).toString());
    };
    return Blueprint;
}());
//# sourceMappingURL=bundle-es5.js.map