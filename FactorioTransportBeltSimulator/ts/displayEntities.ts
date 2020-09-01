/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

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
    this.ofsX = 0;
    this.ofsY = 0;
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

  draw(x: number, y: number, type: number)
  {
    this.ctx.drawImage(this.sprite, this.animate * this.spriteW, type * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterSouth extends DisplayEntity
{
  belt: DisplayEntityTransportBelt;

  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.belt = display.entityTransportBelt;
    this.sprite = display.sprites.splitterSouth;
    this.ofsX -= this.scale * 0.15;
    this.scaleX *= 2.55;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    this.belt.draw(x, y, 3);
    this.belt.draw(x + 1, y, 3);
    this.ctx.drawImage(this.sprite, (this.animate & 7) * this.spriteW, (this.animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitterNorth extends DisplayEntity
{
  belt: DisplayEntityTransportBelt;

  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.belt = display.entityTransportBelt;
    this.sprite = display.sprites.splitterNorth;
    this.ofsX -= this.scale * 0.03;
    this.scaleX *= 2.50;
    this.spriteW = this.sprite.width / 8 >> 0;
    this.spriteH = this.sprite.height / 4 >> 0;
    this.animate = this.animate * 0.70 & 31;
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    this.belt.draw(x, y, 2);
    this.belt.draw(x + 1, y, 2);
    this.ctx.drawImage(this.sprite, (this.animate & 7) * this.spriteW, (this.animate >> 3) * this.spriteH, this.spriteW, this.spriteH, x * this.scale + this.ofsX, y * this.scale + this.ofsY, this.scaleX, this.scaleY);
  }
}

class DisplayEntitySplitter extends DisplayEntity
{
  splitterNorth: DisplayEntitySplitterNorth;
  splitterSouth: DisplayEntitySplitterSouth;

  constructor()
  {
    super();
    this.splitterNorth = new DisplayEntitySplitterNorth();
    this.splitterSouth = new DisplayEntitySplitterSouth();
  }

  prepareForDisplay(display: Display)
  {
    super.prepareForDisplay(display);
    this.splitterNorth.prepareForDisplay(display);
    this.splitterSouth.prepareForDisplay(display);
  }

  draw(x: number, y: number, type: number, animate?: number)
  {
    switch (type)
    {
      case 0: this.splitterNorth.draw(x, y, 0, animate); break;
      case 1: this.splitterSouth.draw(x, y, 0, animate); break;
    }
  }
}
