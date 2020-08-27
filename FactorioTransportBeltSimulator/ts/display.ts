/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Display
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

  countFrame = 0;
  countCalc = 0;
  nextFrameLog = 0;
  lastFrameLog = 0;
  animate = 0;
  scaleLevel = 5;

  setScale(scaleLevel: number): void
  {
    scaleLevel = Math.floor(scaleLevel);
    if (scaleLevel > 6) scaleLevel = 6;
    if (scaleLevel < 0) scaleLevel = 0;
    if (scaleLevel !== this.scaleLevel)
    {
      this.scaleLevel = scaleLevel;
    }
  }

  calc(): void
  {
    this.animate++;
    this.countCalc++;
  }

  draw(time: number): boolean
  {
    const sp = this.sprites;
    const c = this.canvasContext;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;
    if (!sp || !sp.hasLoaded()) return false; // missing sprites?

    c.imageSmoothingEnabled = false;
    c.imageSmoothingQuality = "high";

    const scale = 4 << this.scaleLevel;
    const ofsX = -scale * 0.5;
    const ofsY = -scale * 0.5;
    const animate = this.animate & 15;
    const animate2 = (this.animate * 0.70) & 31;

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

    belt(1, 1, 8); belt(2, 1, 0); belt(3, 1, 0); belt(4, 1, 0); belt(5, 1, 11);
    belt(1, 2, 2); belt(5, 2, 3);
    belt(1, 3, 2); belt(2, 3, 9); belt(3, 3, 1); belt(4, 3, 10); belt(5, 3, 3);
    belt(1, 4, 4); belt(2, 4, 7); belt(4, 4, 4); belt(5, 4, 7);

    const splOfsX = -scale * 0.15;
    const splOfsY = -scale * 0.0;
    const splW = Math.floor(sp.splitterSouth.width / 8);
    const splH = Math.floor(sp.splitterSouth.height / 4);
    belt(6, 2, 14); belt(7, 2, 0); belt(8, 2, 11); belt(9, 2, 9); belt(10, 2, 1); belt(11, 2, 18);
    belt(8, 3, 3); belt(9, 3, 3);
    belt(6, 4, 15); belt(7, 4, 1); belt(8, 4, 7); belt(9, 4, 5); belt(10, 4, 0); belt(11, 4, 19);
    c.drawImage(sp.splitterSouth, (animate2 & 7) * splW, (animate2 >> 3) * splH, splW, splH, 8 * scale + splOfsX, 3 * scale + splOfsY, scale * 2.55, scale);
    c.beginPath();
    c.strokeStyle = "#0f0";
    c.lineWidth = 1;
    c.moveTo(8 * scale + 0.5, 0); c.lineTo(8 * scale + 0.5, 8 * scale);
    c.moveTo(9 * scale + 0.5, 0); c.lineTo(9 * scale + 0.5, 8 * scale);
    c.moveTo(10 * scale + 0.5, 0); c.lineTo(10 * scale + 0.5, 8 * scale);
    c.stroke();
    c.closePath();

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
