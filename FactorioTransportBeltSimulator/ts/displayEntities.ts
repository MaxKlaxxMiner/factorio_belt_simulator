﻿/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

enum BeltType
{
  leftToRight = 0,
  rightToLeft = 1,
  bottomToTop = 2,
  topToBottom = 3,
  rightToTop = 4,
  topToRight = 5,
  leftToTop = 6,
  topToLeft = 7,
  bottomToRight = 8,
  rightToBottom = 9,
  bottomToLeft = 10,
  leftToBottom = 11,
  voidToTop = 12,
  topToVoid = 13,
  voidToRight = 14,
  rightToVoid = 15,
  voidToBottom = 16,
  bottomToVoid = 17,
  voidToLeft = 18,
  leftToVoid = 19
}

class DisplayEntity
{
  ctx: CanvasRenderingContext2D;
  ofsX: number;
  ofsY: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  spriteW: number;
  spriteH: number;
  animate: number;

  sprite: HTMLImageElement;

  constructor()
  {
    this.draw = this.draw.bind(this);
  }

  prepareForDisplay(display: Display): void
  {
    this.ctx = display.canvasContext;
    this.ofsX = display.offsetX;
    this.ofsY = display.offsetY;
    this.scale = display.scale;
    this.scaleX = display.scale;
    this.scaleY = display.scale;
    this.spriteW = 32;
    this.spriteH = 32;
    this.animate = display.animate;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
  }
}

class DisplayEntityTransportBelt extends DisplayEntity
{
  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.sprite = display.sprites.transportBelt;
    this.ofsX -= this.scale * 0.5;
    this.ofsY -= this.scale * 0.5;
    this.scaleX *= 2;
    this.scaleY *= 2;
    this.spriteW = this.sprite.width / 16 >> 0;
    this.spriteH = this.sprite.height / 20 >> 0;
    this.animate &= 15;
  }

  draw(x: number, y: number, type: BeltType)
  {
    this.ctx.drawImage(this.sprite, this.animate * this.spriteW, type * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterSouth extends DisplayEntity
{
  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.sprite = display.sprites.splitterSouth;
    this.ofsX -= this.scale * 0.155;
    this.scaleX *= 2.56;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    if (animate === undefined) animate = this.animate;
    this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterNorth extends DisplayEntity
{
  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.sprite = display.sprites.splitterNorth;
    this.ofsX -= this.scale * 0.03;
    this.ofsY -= this.scale * 0.05;
    this.scaleX *= 2.5;
    this.scaleY *= 1.1;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    if (animate === undefined) animate = this.animate;
    this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterWestTop extends DisplayEntity
{
  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.sprite = display.sprites.splitterWestTop;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.ofsX -= this.scale * 0.015;
    this.ofsY -= this.scale * 0.3134;
    this.scaleX *= 1.40;
    this.scaleY *= 1.50;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    if (animate === undefined) animate = this.animate;
    this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterWest extends DisplayEntity
{
  top: DisplayEntitySplitterWestTop;

  constructor()
  {
    super();
    this.top = new DisplayEntitySplitterWestTop();
  }

  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.top.prepareForDisplay(display);
    this.sprite = display.sprites.splitterWest;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.ofsX -= this.scale * 0.015;
    this.ofsY -= this.scale * 0.30;
    this.scaleX *= 1.40;
    this.scaleY *= 1.35;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    this.top.draw(x, y, type, animate);
    if (animate === undefined) animate = this.animate;
    this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, (y + 1) * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterEastTop extends DisplayEntity
{
  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.sprite = display.sprites.splitterEastTop;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.ofsX -= this.scale * 0.075;
    this.ofsY -= this.scale * 0.434;
    this.scaleX *= 1.40;
    this.scaleY *= 1.62;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    if (animate === undefined) animate = this.animate;
    this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterEast extends DisplayEntity
{
  top: DisplayEntitySplitterEastTop;

  constructor()
  {
    super();
    this.top = new DisplayEntitySplitterEastTop();
  }

  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.top.prepareForDisplay(display);
    this.sprite = display.sprites.splitterEast;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.ofsX -= this.scale * 0.075;
    this.ofsY -= this.scale * 0.25;
    this.scaleX *= 1.40;
    this.scaleY *= 1.303;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    this.top.draw(x, y, type, animate);
    if (animate === undefined) animate = this.animate;
    this.ctx.drawImage(this.sprite, (animate & 7) * this.spriteW, (animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, (y + 1) * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitter extends DisplayEntity
{
  splitterNorth: DisplayEntitySplitterNorth;
  splitterSouth: DisplayEntitySplitterSouth;
  splitterWest: DisplayEntitySplitterWest;
  splitterEast: DisplayEntitySplitterEast;

  constructor()
  {
    super();
    this.splitterNorth = new DisplayEntitySplitterNorth();
    this.splitterSouth = new DisplayEntitySplitterSouth();
    this.splitterWest = new DisplayEntitySplitterWest();
    this.splitterEast = new DisplayEntitySplitterEast();
  }

  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.splitterNorth.prepareForDisplay(display);
    this.splitterSouth.prepareForDisplay(display);
    this.splitterWest.prepareForDisplay(display);
    this.splitterEast.prepareForDisplay(display);
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    switch (type)
    {
      case 0: this.splitterNorth.draw(x, y, 0, animate); break;
      case 1: this.splitterSouth.draw(x, y, 0, animate); break;
      case 2: this.splitterWest.draw(x, y, 0, animate); break;
      case 3: this.splitterEast.draw(x, y, 0, animate); break;
    }
  }
}
