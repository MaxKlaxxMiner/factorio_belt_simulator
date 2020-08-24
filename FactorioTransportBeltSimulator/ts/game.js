/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */
var Game = /** @class */ (function () {
    function Game(gameDiv, canvasWidth, canvasHeight) {
        this.title = document.title;
        this.nextFrameLog = 0;
        this.lastFrameLog = 0;
        this.countFrame = 0;
        this.gameDiv = gameDiv;
        gameDiv.style.width = canvasWidth + "px";
        gameDiv.style.height = canvasHeight + "px";
        gameDiv.style.backgroundColor = "#036";
        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        this.ctx = canvas.getContext("2d");
        gameDiv.appendChild(canvas);
    }
    Game.prototype.draw = function () {
        //this.ctx.putImageData(bitmap, 0, 0);
        this.countFrame++;
        var time = performance.now();
        if (time > this.nextFrameLog) {
            if (this.countFrame > 0)
                document.title = this.title + " - fps: " + (this.countFrame / (time - this.lastFrameLog) * 1000).toFixed(1);
            this.countFrame = 0;
            this.nextFrameLog += 1000;
            this.lastFrameLog = time;
            if (this.nextFrameLog < time)
                this.nextFrameLog = time;
        }
    };
    return Game;
}());
var keys = {};
var game;
window.onload = function () {
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
    //window.setInterval(() => game.draw(), 1);
    var run = function () { requestAnimFrame(run); game.draw(); };
    run();
};
//# sourceMappingURL=game.js.map