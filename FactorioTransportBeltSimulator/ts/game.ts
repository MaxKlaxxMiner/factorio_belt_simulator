/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Game
{
  gameDiv: HTMLElement;
  ctx: CanvasRenderingContext2D;
  title = document.title;
  sprites: Sprites;

  constructor(gameDiv: HTMLElement, canvasWidth: number, canvasHeight: number)
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

    this.sprites = new Sprites();
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
      if (this.countFrame > 0) document.title = this.title + " - fps: " + (this.countFrame / (time - this.lastFrameLog) * 1000).toFixed(1) + " (" + this.sprites.hasLoaded() + ")";
      this.countFrame = 0;
      this.nextFrameLog += 1000;
      this.lastFrameLog = time;
      if (this.nextFrameLog < time) this.nextFrameLog = time;
    }
  }
}

const keys: { [key: number]: boolean } = {};
let game: Game;

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

  const docSize = getDocumentSize();
  const div = document.getElementById("game");
  game = new Game(div, docSize.width, docSize.height);

  //window.setInterval(() => game.draw(), 1);

  const run = () => { requestAnimFrame(run); game.draw(); }; run();
};
