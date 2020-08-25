﻿/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Game
{
  gameDiv: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  title = document.title;
  sprites: Sprites;

  constructor(gameDiv: HTMLElement, canvasWidth: number, canvasHeight: number)
  {
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

  nextFrameLog = 0;
  lastFrameLog = 0;
  countFrame = 0;
  animate = 0;

  draw(): void
  {
    const sp = this.sprites;
    const c = this.canvasContext;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;
    if (!sp || !sp.hasLoaded()) return; // missing sprites?

    c.imageSmoothingEnabled = false;
    c.imageSmoothingQuality = "high";
    c.clearRect(0, 0, w, h);

    const scale = 32;
    const animate = this.animate % 16;
    const belt = (x: number, y: number, type: number) =>
    {
      c.drawImage(sp.transportBelt, animate * 64, type * 64, 64, 64, x * scale, y * scale, scale * 2, scale * 2);
    };

    belt(0, 0, 8); belt(1, 0, 0); belt(2, 0, 0); belt(3, 0, 0); belt(4, 0, 11);
    belt(0, 1, 2); belt(4, 1, 3);
    belt(0, 2, 2); belt(1, 2, 9); belt(2, 2, 1); belt(3, 2, 10); belt(4, 2, 3);
    belt(0, 3, 4); belt(1, 3, 7); belt(3, 3, 4); belt(4, 3, 7);

    if (this.animate < 120)
    {
      c.globalAlpha = Easing.easeInQuad((120 - this.animate) / 120);
      c.fillRect(0, 0, w, h);
      c.globalAlpha = 1.0;
    }

    this.animate++;
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
