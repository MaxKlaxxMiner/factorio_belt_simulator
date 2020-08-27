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

  updateForDisplay(display: Display): void
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
  updateForDisplay(display: Display)
  {
    super.updateForDisplay(display);
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
