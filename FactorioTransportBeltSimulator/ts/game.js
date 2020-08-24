class Game {
    constructor(gameDiv, canvasWidth, canvasHeight) {
        this.title = document.title;
        this.nextFrameLog = 0;
        this.lastFrameLog = 0;
        this.countFrame = 0;
        this.gameDiv = gameDiv;
        gameDiv.style.width = canvasWidth + "px";
        gameDiv.style.height = canvasHeight + "px";
        gameDiv.style.backgroundColor = "#036";
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        this.ctx = canvas.getContext("2d");
        gameDiv.appendChild(canvas);
        this.sprites = new Sprites();
    }
    draw() {
        this.countFrame++;
        const time = performance.now();
        if (time > this.nextFrameLog) {
            if (this.countFrame > 0)
                document.title = this.title + " - fps: " + (this.countFrame / (time - this.lastFrameLog) * 1000).toFixed(1) + " (" + this.sprites.hasLoaded() + ")";
            this.countFrame = 0;
            this.nextFrameLog += 1000;
            this.lastFrameLog = time;
            if (this.nextFrameLog < time)
                this.nextFrameLog = time;
        }
    }
}
const keys = {};
let game;
window.onload = () => {
    document.body.onkeydown = (e) => {
        console.log("key pressed: " + e.keyCode);
        keys[e.keyCode] = true;
    };
    document.body.onkeyup = (e) => {
        keys[e.keyCode] = false;
    };
    const docSize = getDocumentSize();
    const div = document.getElementById("game");
    game = new Game(div, docSize.width, docSize.height);
    const run = () => { requestAnimFrame(run); game.draw(); };
    run();
};
//# sourceMappingURL=game.js.map