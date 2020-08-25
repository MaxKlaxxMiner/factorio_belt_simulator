/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

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
  calcTime = 0;
  countFrame = 0;
  countCalc = 0;
  animate = 0;
  scaleLevel = 5;

  ui(): void
  {
    if (keys[107]) // numpad +
    {
      keys[107] = false;
      this.scaleLevel++;
      if (this.scaleLevel > 6) this.scaleLevel = 6;
    }
    if (keys[109]) // numpad -
    {
      keys[109] = false;
      this.scaleLevel--;
      if (this.scaleLevel < 0) this.scaleLevel = 0;
    }
  }

  calc(): void
  {
    this.animate++;
    this.countCalc++;
    this.calcTime += 16.6666666;
  }

  draw(): void
  {
    const sp = this.sprites;
    const c = this.canvasContext;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;
    if (!sp || !sp.hasLoaded()) return; // missing sprites?

    this.ui();

    const time = performance.now();
    if (this.calcTime === 0) this.calcTime = time;
    if (this.calcTime < time + 30 && this.calcTime > time - 30) this.calc(); // inner sync?
    else while (this.calcTime < time - 20) this.calc(); // resync

    c.imageSmoothingEnabled = false;
    c.imageSmoothingQuality = "high";

    const scale = 4 << this.scaleLevel;
    const ofsX = -scale * 0.52;
    const ofsY = -scale * 0.62;
    const animate = this.animate % 16;

    c.clearRect(0, 0, w, h);

    // --- Background (tutorial-grid) ---
    if (this.scaleLevel > 1)
    {
      const gridWidth = Math.floor(this.sprites.tutorialGrid.width * scale / 64);
      const gridHeight = Math.floor(this.sprites.tutorialGrid.height * scale / 64);
      for (let y = 0; y < h; y += gridHeight)
      {
        for (let x = -(y % gridWidth) * 6; x < w; x += gridWidth)
        {
          c.drawImage(this.sprites.tutorialGrid, x, y, gridWidth, gridHeight);
        }
      }
    }
    else // fill gray = faster
    {
      c.fillStyle = "#848484";
      c.fillRect(0, 0, w, w);
    }

    if (this.scaleLevel < 2) c.imageSmoothingEnabled = true;

    const belt = (x: number, y: number, type: number) =>
    {
      c.drawImage(sp.transportBelt, animate * 64, type * 64, 64, 64, x * scale + ofsX, y * scale + ofsY, scale * 2, scale * 2);
    };

    belt(1, 1, 8); belt(2, 1, 0); belt(3, 1, 0); belt(4, 1, 0); belt(5, 1, 11);
    belt(1, 2, 2); belt(5, 2, 3);
    belt(1, 3, 2); belt(2, 3, 9); belt(3, 3, 1); belt(4, 3, 10); belt(5, 3, 3);
    belt(1, 4, 4); belt(2, 4, 7); belt(4, 4, 4); belt(5, 4, 7);

    if (this.animate < 120)
    {
      c.globalAlpha = Easing.easeInQuad((120 - this.animate) / 120);
      c.fillStyle = "#000";
      c.fillRect(0, 0, w, h);
      c.globalAlpha = 1.0;
    }

    this.countFrame++;
    if (time > this.nextFrameLog)
    {
      if (this.countFrame > 0) document.title = this.title + " - FPS " + (this.countFrame / (time - this.lastFrameLog) * 1000).toFixed(1) + ", UPS " + (this.countCalc / (time - this.lastFrameLog) * 1000).toFixed(1);
      this.countFrame = 0;
      this.countCalc = 0;
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

  //window.setInterval(() => game.draw(), 8); // 125 FPS test

  const run = () => { requestAnimFrame(run); game.draw(); }; run();
};
