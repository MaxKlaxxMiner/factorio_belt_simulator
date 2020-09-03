﻿/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Display
{
  gameDiv: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  title = document.title;
  sprites: Sprites;
  map: Map;

  entityTransportBelt: DisplayEntity;
  entitySplitter: DisplayEntity;

  constructor(gameDiv: HTMLElement, canvasWidth: number, canvasHeight: number, map: Map)
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

    this.setScale(22);

    this.entityTransportBelt = new DisplayEntityTransportBelt();
    this.entitySplitter = new DisplayEntitySplitter();
    this.map = map;
  }

  countFrame = 0;
  countCalc = 0;
  nextFrameLog = 0;
  lastFrameLog = 0;
  animate = 0;
  scaleLevel: number;
  scale: number;

  zoomLevels = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 19, 22, 26, 30, 36, 42, 49, 57, 67, 79, 93, 109, 128, 151, 178, 209];

  setScale(scaleLevel: number): void
  {
    scaleLevel = Math.floor(scaleLevel);
    if (scaleLevel >= this.zoomLevels.length) scaleLevel = this.zoomLevels.length - 1;
    if (scaleLevel < 0) scaleLevel = 0;
    if (scaleLevel !== this.scaleLevel)
    {
      this.scaleLevel = scaleLevel;
      this.scale = this.zoomLevels[scaleLevel];
      this.draw(performance.now()); // fast redraw
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
    if (this.scaleLevel >= 8)
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

    //belt(2, 1, 8); belt(3, 1, 0); belt(5, 1, 0); belt(6, 1, 11);
    //belt(1, 2, 17); belt(2, 2, 2); belt(3, 2, 14); belt(5, 2, 19); belt(6, 2, 3); belt(7, 2, 16);
    //splitter(4, 1, 3, this.animate & 31);
    //splitter(1, 3, 0); splitter(6, 3, 1, this.animate * 0.2 & 31);
    //splitter(4, 4, 2, this.animate * 2 & 31);
    //belt(1, 4, 12); belt(2, 4, 2); belt(3, 4, 15); belt(5, 4, 18); belt(6, 4, 3); belt(7, 4, 13);
    //belt(2, 5, 4); belt(3, 5, 1); belt(5, 5, 1); belt(6, 5, 7);

    //todo: optimize viewport
    const lines = this.map.entityLines;
    for (let y = 0; y < lines.length; y++)
    {
      const line = lines[y];
      if (!line) continue;
      for (let x = line.firstX; x <= line.lastX; x++)
      {
        const entity = line[x];
        if (!entity) continue;
        switch (entity.e)
        {
          case EntityType.transportBelt: {
            switch (entity.d) // direction
            {
              case 1: { // right
                if (!entity.ln) belt(x - 1, y, 14);
                belt(x, y, 0);
                if (!entity.rn) belt(x + 1, y, 19);
              } break;
            }
          } break;
        }
      }
    }

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

    const mx = mouseX / this.scale >> 0;
    const my = mouseY / this.scale >> 0;
    if (mouseX + mouseY > 0)
    {
      c.globalAlpha = 0.7;
      belt(mx - 1, my, 14); belt(mx, my, 0); belt(mx + 1, my, 19);
      c.globalAlpha = 1;
    }
    //helpLines(mx, my, 1, 1);

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
