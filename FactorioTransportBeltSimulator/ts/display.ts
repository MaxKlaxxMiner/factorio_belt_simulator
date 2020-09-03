/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Display
{
  gameDiv: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  title = document.title;
  sprites: Sprites;
  map: Map;

  entityTransportBelt: DisplayEntityTransportBelt;
  entitySplitter: DisplayEntitySplitter;

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

    this.setScale(18);

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
    }
  }

  calc(): void
  {
    this.animate++;
    this.countCalc++;
  }

  draw(time: number): boolean
  {
    // --- pipeline step 0: prepare ---
    if (!this.sprites || !this.sprites.hasLoaded()) return false; // missing sprites?

    this.entityTransportBelt.prepareForDisplay(this);
    this.entitySplitter.prepareForDisplay(this);

    const c = this.canvasContext;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;
    c.imageSmoothingEnabled = false;
    c.imageSmoothingQuality = "high";

    // --- pipeline step 1: background (tutorial-grid) ---
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

    // --- Entities-Methods ---
    const belt = this.entityTransportBelt.draw;
    const splitter = this.entitySplitter.draw;

    //todo: optimize viewport

    // --- pipeline step 2: draw transport belts ---
    const additives: { x: number, y: number, t: BeltType }[] = [];
    this.map.callEntities(0, 0, 100, 100, (x, y, e) =>
    {
      switch (e.t)
      {
        case EntityType.transportBelt: {
          switch (e.d) // direction
          {
            case Direction.top: {
              if (e.isCurve())
              {
                if (e.fromLeft()) belt(x, y, BeltType.leftToTop);
                if (e.fromRight()) belt(x, y, BeltType.rightToTop);
              }
              else
              {
                belt(x, y, BeltType.bottomToTop);
                if (!e.fromBottom(true)) additives.push({ x: x, y: y + 1, t: BeltType.voidToTop });
              }
              if (e.tn === undefined || !e.tn.isCurve() && !e.fromTop(true)) additives.push({ x: x, y: y - 1, t: BeltType.bottomToVoid });
            } break;

            case Direction.right: {
              if (e.isCurve())
              {
                if (e.fromTop()) belt(x, y, BeltType.topToRight);
                if (e.fromBottom()) belt(x, y, BeltType.bottomToRight);
              }
              else
              {
                belt(x, y, BeltType.leftToRight);
                if (!e.fromLeft(true)) additives.push({ x: x - 1, y: y, t: BeltType.voidToRight });
              }
              if (e.rn === undefined || !e.rn.isCurve() && !e.fromRight(true)) additives.push({ x: x + 1, y: y, t: BeltType.leftToVoid });
            } break;

            case Direction.bottom: {
              if (e.isCurve())
              {
                if (e.fromLeft()) belt(x, y, BeltType.leftToBottom);
                if (e.fromRight()) belt(x, y, BeltType.rightToBottom);
              }
              else
              {
                belt(x, y, BeltType.topToBottom);
                if (!e.fromTop(true)) additives.push({ x: x, y: y - 1, t: BeltType.voidToBottom });
              }
              if (e.bn === undefined || !e.bn.isCurve() && !e.fromBottom(true)) additives.push({ x: x, y: y + 1, t: BeltType.topToVoid });
            } break;

            case Direction.left: {
              if (e.isCurve())
              {
                if (e.fromTop()) belt(x, y, BeltType.topToLeft);
                if (e.fromBottom()) belt(x, y, BeltType.bottomToLeft);
              }
              else
              {
                belt(x, y, BeltType.rightToLeft);
                if (!e.fromRight(true)) additives.push({ x: x + 1, y: y, t: BeltType.voidToLeft });
              }
              if (e.ln === undefined || !e.ln.isCurve() && !e.fromLeft(true)) additives.push({ x: x - 1, y: y, t: BeltType.rightToVoid });
            } break;
          }
        } break;
      }
    });

    // --- pipeline step 3: draw belt additives ---
    additives.forEach(add =>
    {
      belt(add.x, add.y, add.t);
    });

    // --- pipeline step 4: draw entities ---
    this.map.callEntities(0, 0, 100, 100, (x, y, e) =>
    {
      switch (e.t)
      {
        case EntityType.splitterLeft: {
          switch (e.d) // direction
          {
            case Direction.right: {
            } break;
          }
        } break;
        case EntityType.splitterRight: {
          switch (e.d) // direction
          {
          case Direction.right: {
          } break;
          }
        } break;
      }
    });


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
