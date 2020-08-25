﻿/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Sprites
{
  tutorialGrid: HTMLImageElement;
  transportBelt: HTMLImageElement;
  splitterEast: HTMLImageElement;
  splitterNorth: HTMLImageElement;
  splitterSouth: HTMLImageElement;
  splitterWest: HTMLImageElement;
  undergroundBelt: HTMLImageElement;

  static showError = false;
  static loadImg(url: string, callback: (img: HTMLImageElement) => void): void
  {
    const img = new Image();
    img.onload = () => callback(img);
    img.onerror = () =>
    {
      console.error("load error: " + url);
      if (this.showError) return;
      alert("load error: " + url);
      this.showError = true;
    }
    img.src = url;
  }

  constructor()
  {
    Sprites.loadImg("/factorio/data/base/graphics/terrain/tutorial-grid/hr-tutorial-grid1.png", img => { this.tutorialGrid = img; });

    const path = "/factorio/data/base/graphics/entity/";
    Sprites.loadImg(path + "transport-belt/transport-belt.png", img => { this.transportBelt = img; });
    Sprites.loadImg(path + "splitter/splitter-east.png", img => { this.splitterEast = img; });
    Sprites.loadImg(path + "splitter/splitter-north.png", img => { this.splitterNorth = img; });
    Sprites.loadImg(path + "splitter/splitter-south.png", img => { this.splitterSouth = img; });
    Sprites.loadImg(path + "splitter/splitter-west.png", img => { this.splitterWest = img; });
    Sprites.loadImg(path + "underground-belt/underground-belt-structure.png", img => { this.undergroundBelt = img; });
  }

  loadChecked = false;
  hasLoaded(): boolean
  {
    if (this.loadChecked) return true;
    const check = this.tutorialGrid && this.transportBelt && this.splitterEast && this.splitterNorth && this.splitterSouth && this.splitterWest && this.undergroundBelt && true;
    if (check) this.loadChecked = true;
    return check;
  }
}
