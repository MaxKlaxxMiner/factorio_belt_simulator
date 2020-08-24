/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

var requestAnimFrame = (() => (window.requestAnimationFrame || (<any>window).webkitRequestAnimationFrame || (<any>window).mozRequestAnimationFrame || ((cb: TimerHandler) => window.setTimeout(cb, 1000 / 60))))();

interface DocumentSize
{
  width: number;
  height: number;
}

function getDocumentSize(): DocumentSize
{
  const body = document.body;
  const html = document.documentElement;
  return {
    width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
    height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
  };
}

class Game
{
  gameDiv: HTMLElement;
  ctx: CanvasRenderingContext2D;
  title = document.title;

  constructor(gameDiv: HTMLElement, canvasWidth, canvasHeight)
  {
    this.gameDiv = gameDiv;
    gameDiv.style.width = canvasWidth + "px";
    gameDiv.style.height = canvasHeight + "px";
    gameDiv.style.backgroundColor = "#036";

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    this.ctx = canvas.getContext("2d");
    gameDiv.appendChild(canvas);
  }

  nextFrameLog = 0;
  lastFrameLog = 0;
  countFrame = 0;
  draw(): void
  {
    //this.ctx.putImageData(bitmap, 0, 0);

    this.countFrame++;
    const time = performance.now();
    if (time > this.nextFrameLog)
    {
      if (this.countFrame > 0) document.title = this.title + " - fps: " + (this.countFrame / (time - this.lastFrameLog) * 1000).toFixed(1);
      this.countFrame = 0;
      this.nextFrameLog += 1000;
      this.lastFrameLog = time;
      if (this.nextFrameLog < time) this.nextFrameLog = time;
    }
  }
}

var keys = {};
var game: Game;

window.onload = () =>
{
  document.body.onkeydown = (e: KeyboardEvent) =>
  {
    console.log("key pressed: " + e.keyCode);
    keys[e.keyCode] = true;
  };
  document.body.onkeyup = (e: KeyboardEvent) =>
  {
    keys[e.keyCode] = false;
  };

  var docSize = getDocumentSize();
  var div = document.getElementById("game");
  game = new Game(div, docSize.width, docSize.height);

  //window.setInterval(() => game.draw(), 1);

  var run = () => { requestAnimFrame(run); game.draw(); }; run();
};
