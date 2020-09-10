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

    // add ultra-zoom
    for (let z = this.zoomLevels[this.zoomLevels.length - 1]; z < 20000; z *= Math.pow((Math.sqrt(5) + 1) / 2, 1 / 3)) this.zoomLevels.push((z + 0.5) >> 0);
  }

  countFrame = 0;
  countCalc = 0;
  nextFrameLog = 0;
  lastFrameLog = 0;
  animate = 0;

  scaleLevel: number;
  scale: number;
  offsetX = 0;
  offsetY = 0;

  zoomLevels = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 19, 22, 26, 30, 36, 42, 49, 57, 67, 79, 93, 109, 128];

  setScale(scaleLevel: number): void
  {
    scaleLevel = scaleLevel >> 0;
    if (scaleLevel >= this.zoomLevels.length) scaleLevel = this.zoomLevels.length - 1;
    if (scaleLevel < 0) scaleLevel = 0;
    if (scaleLevel !== this.scaleLevel)
    {
      this.scaleLevel = scaleLevel;
      const newScale = this.zoomLevels[scaleLevel];
      if (this.scale)
      {
        this.offsetX = (this.offsetX - mouseX) / this.scale * newScale + mouseX;
        this.offsetY = (this.offsetY - mouseY) / this.scale * newScale + mouseY;
      }
      this.scale = newScale;
    }
  }

  calc(): void
  {
    this.animate++;
    this.countCalc++;
  }

  getMouseFieldPos(): { x: number, y: number }
  {
    const x = ((mouseX - this.offsetX + this.scale * 1000000) / this.scale >> 0) - 1000000;
    const y = ((mouseY - this.offsetY + this.scale * 1000000) / this.scale >> 0) - 1000000;
    return { x, y };
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

      const picWidth = this.sprites.tutorialGrid.width;
      const picHeight = this.sprites.tutorialGrid.height;
      const gridWidth = picWidth * this.scale / 64 >> 0;
      const gridHeight = picHeight * this.scale / 64 >> 0;
      const startY = -((this.offsetY / gridHeight >> 0) + 1) * gridHeight;
      const endY = h - this.offsetY;
      const endX = w - this.offsetX;
      for (let y = startY; y <= endY; y += gridHeight)
      {
        const startX = ((y + gridHeight * 1000000) * -6) % gridWidth - ((this.offsetX / gridWidth >> 0) + 1) * gridWidth;
        for (let x = startX; x <= endX; x += gridWidth)
        {
          c.drawImage(this.sprites.tutorialGrid, x + this.offsetX, y + this.offsetY, gridWidth, gridHeight);
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
    const beltAdds: { x: number, y: number, t: BeltType }[] = [];
    const entityAdds: { x: number, y: number, t: number, animate?: number, draw: (x: number, y: number, type: number, animate?: number) => void }[] = [];
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
                if (!e.fromBottom(true)) beltAdds.push({ x: x, y: y + 1, t: BeltType.voidToTop });
              }
              if (e.tn === undefined || !e.tn.isCurve() && !e.fromTop(true)) beltAdds.push({ x: x, y: y - 1, t: BeltType.bottomToVoid });
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
                if (!e.fromLeft(true)) beltAdds.push({ x: x - 1, y: y, t: BeltType.voidToRight });
              }
              if (e.rn === undefined || !e.rn.isCurve() && !e.fromRight(true)) beltAdds.push({ x: x + 1, y: y, t: BeltType.leftToVoid });
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
                if (!e.fromTop(true)) beltAdds.push({ x: x, y: y - 1, t: BeltType.voidToBottom });
              }
              if (e.bn === undefined || !e.bn.isCurve() && !e.fromBottom(true)) beltAdds.push({ x: x, y: y + 1, t: BeltType.topToVoid });
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
                if (!e.fromRight(true)) beltAdds.push({ x: x + 1, y: y, t: BeltType.voidToLeft });
              }
              if (e.ln === undefined || !e.ln.isCurve() && !e.fromLeft(true)) beltAdds.push({ x: x - 1, y: y, t: BeltType.rightToVoid });
            } break;
          }
        } break;

        case EntityType._splitterLeft: {
          switch (e.d) // direction
          {
            case Direction.top: {
              belt(x, y, BeltType.bottomToTop);
              belt(x + 1, y, BeltType.bottomToTop);
              if (!e.fromBottom(true)) beltAdds.push({ x: x, y: y + 1, t: BeltType.voidToTop });
              if (!e.rn.fromBottom(true)) beltAdds.push({ x: x + 1, y: y + 1, t: BeltType.voidToTop });
              if (e.tn === undefined || !e.tn.isCurve() && !e.fromTop(true)) beltAdds.push({ x: x, y: y - 1, t: BeltType.bottomToVoid });
              if (e.rn.tn === undefined || !e.rn.tn.isCurve() && !e.rn.fromTop(true)) beltAdds.push({ x: x + 1, y: y - 1, t: BeltType.bottomToVoid });
              entityAdds.push({ x: x, y: y, t: 0, draw: splitter });
            } break;
            case Direction.right: {
              belt(x, y, BeltType.leftToRight);
              belt(x, y + 1, BeltType.leftToRight);
              if (!e.fromLeft(true)) beltAdds.push({ x: x - 1, y: y, t: BeltType.voidToRight });
              if (!e.bn.fromLeft(true)) beltAdds.push({ x: x - 1, y: y + 1, t: BeltType.voidToRight });
              if (e.rn === undefined || !e.rn.isCurve() && !e.fromRight(true)) beltAdds.push({ x: x + 1, y: y, t: BeltType.leftToVoid });
              if (e.bn.rn === undefined || !e.bn.rn.isCurve() && !e.bn.fromRight(true)) beltAdds.push({ x: x + 1, y: y + 1, t: BeltType.leftToVoid });
              entityAdds.push({ x: x, y: y, t: 3, draw: splitter });
            } break;
            case Direction.bottom: {
              belt(x - 1, y, BeltType.topToBottom);
              belt(x, y, BeltType.topToBottom);
              if (!e.fromTop(true)) beltAdds.push({ x: x, y: y - 1, t: BeltType.voidToBottom });
              if (!e.ln.fromTop(true)) beltAdds.push({ x: x - 1, y: y - 1, t: BeltType.voidToBottom });
              if (e.bn === undefined || !e.bn.isCurve() && !e.fromBottom(true)) beltAdds.push({ x: x, y: y + 1, t: BeltType.topToVoid });
              if (e.ln.bn === undefined || !e.ln.bn.isCurve() && !e.ln.fromBottom(true)) beltAdds.push({ x: x - 1, y: y + 1, t: BeltType.topToVoid });
              entityAdds.push({ x: x - 1, y: y, t: 1, draw: splitter });
            } break;
            case Direction.left: {
              belt(x, y - 1, BeltType.rightToLeft);
              belt(x, y, BeltType.rightToLeft);
              if (!e.fromRight(true)) beltAdds.push({ x: x + 1, y: y, t: BeltType.voidToLeft });
              if (!e.tn.fromRight(true)) beltAdds.push({ x: x + 1, y: y - 1, t: BeltType.voidToLeft });
              if (e.ln === undefined || !e.ln.isCurve() && !e.fromLeft(true)) beltAdds.push({ x: x - 1, y: y, t: BeltType.rightToVoid });
              if (e.tn.ln === undefined || !e.tn.ln.isCurve() && !e.tn.fromLeft(true)) beltAdds.push({ x: x - 1, y: y - 1, t: BeltType.rightToVoid });
              entityAdds.push({ x: x, y: y - 1, t: 2, draw: splitter });
            } break;
          }
        } break;
      }
    });

    // --- pipeline step 3: draw belt additives ---
    beltAdds.forEach(add =>
    {
      belt(add.x, add.y, add.t);
    });

    // --- pipeline step 4: draw entities ---
    entityAdds.forEach(add =>
    {
      add.draw(add.x, add.y, add.t, add.animate);
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

    if (mouseX + mouseY > 0 && this.scale < 500)
    {
      const m = this.getMouseFieldPos();
      c.globalAlpha = 0.7;
      belt(m.x - 1, m.y, 14); belt(m.x, m.y, 0); belt(m.x + 1, m.y, 19);
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
