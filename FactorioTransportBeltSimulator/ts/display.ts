/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Display
{
  gameDiv: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  title = document.title;
  sprites: Sprites;

  entityTransportBelt: DisplayEntity;
  entitySplitterSouth: DisplayEntity;
  entitySplitterNorth: DisplayEntity;
  entitySplitter: DisplayEntity;

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

    this.setScale(5);

    this.entityTransportBelt = new DisplayEntityTransportBelt();
    this.entitySplitter = new DisplayEntitySplitter();
  }

  countFrame = 0;
  countCalc = 0;
  nextFrameLog = 0;
  lastFrameLog = 0;
  animate = 0;
  scaleLevel: number;
  scale: number;

  setScale(scaleLevel: number): void
  {
    scaleLevel = Math.floor(scaleLevel);
    if (scaleLevel > 6) scaleLevel = 6;
    if (scaleLevel < 0) scaleLevel = 0;
    if (scaleLevel !== this.scaleLevel)
    {
      this.scaleLevel = scaleLevel;
      this.scale = 4 << scaleLevel;
    }
  }

  calc(): void
  {
    this.animate++;
    this.countCalc++;
  }

  draw(time: number): boolean
  {
    if (!this.sprites || !this.sprites.hasLoaded()) return false; // missing sprites?

    // todo: loop elements
    this.entityTransportBelt.prepareForDisplay(this);
    this.entitySplitter.prepareForDisplay(this);

    const c = this.canvasContext;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;
    c.imageSmoothingEnabled = false;
    c.imageSmoothingQuality = "high";

    // --- Background (tutorial-grid) ---
    if (this.scaleLevel > 1)
    {
      c.clearRect(0, 0, w, h);

      const gridWidth = Math.floor(this.sprites.tutorialGrid.width * this.scale / 64);
      const gridHeight = Math.floor(this.sprites.tutorialGrid.height * this.scale / 64);
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

    // --- Entities ---
    const belt = this.entityTransportBelt.draw;
    const splitter = this.entitySplitter.draw;

    // --- belts ---
    //  0 = left -> right
    //  1 = right -> left
    //  2 = bottom -> top
    //  3 = top -> bottom
    //  4 = right -> top
    //  5 = top -> right
    //  6 = left -> top
    //  7 = top -> left
    //  8 = bottom -> right
    //  9 = right -> bottom
    // 10 = bottom -> left
    // 11 = left -> bottom
    // 12 = void -> top
    // 13 = top -> void
    // 14 = void -> right
    // 15 = right -> void
    // 16 = void -> bottom
    // 17 = bottom -> void
    // 18 = void -> left
    // 19 = left -> void

    belt(2, 1, 8); belt(3, 1, 0); belt(4, 1, 0); belt(5, 1, 0); belt(6, 1, 11);
    belt(6, 2, 3);
    belt(2, 3, 2); belt(3, 3, 9); belt(4, 3, 1); belt(5, 3, 10); belt(6, 3, 3);
    belt(2, 4, 4); belt(3, 4, 7); belt(5, 4, 4); belt(6, 4, 7);

    belt(1, 1, 17);
    splitter(1, 2, 0);
    belt(1, 3, 12);

    belt(7, 2, 14); belt(8, 2, 0); belt(9, 2, 11); belt(10, 2, 9); belt(11, 2, 1); belt(12, 2, 18);
    belt(7, 4, 15); belt(8, 4, 1); belt(9, 4, 7); belt(10, 4, 5); belt(11, 4, 0); belt(12, 4, 19);
    splitter(9, 3, 1);

    // --- Helper lines ---
    const helpLines = (x: number, y: number, width: number, height: number) =>
    {
      c.beginPath();
      c.strokeStyle = "#0f0";
      c.lineWidth = 1;
      const s = this.scale;
      for (let cy = 0; cy <= height; cy++)
      {
        c.moveTo(x * s + 0.5, (y + cy) * s + 0.5);
        c.lineTo((x + width) * s + 0.5, (y + cy) * s + 0.5);
      }
      for (let cx = 0; cx <= width; cx++)
      {
        c.moveTo((x + cx) * s + 0.5, y * s + 0.5);
        c.lineTo((x + cx) * s + 0.5, (y + height) * s + 0.5);
      }
      c.stroke();
      c.closePath();
    };

    //helpLines(8, 2, 4, 3);

    // --- Final ---
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

    return true;
  }
}
