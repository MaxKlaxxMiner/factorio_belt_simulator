/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Game
{
  display: Display;

  constructor(gameDiv: HTMLElement, canvasWidth: number, canvasHeight: number)
  {
    this.display = new Display(gameDiv, canvasWidth, canvasHeight);
  }

  uiUpdate(): void
  {
    if (keys[107]) // numpad +
    {
      keys[107] = false;
      this.display.setScale(this.display.scaleLevel + 1);
    }
    if (keys[109]) // numpad -
    {
      keys[109] = false;
      this.display.setScale(this.display.scaleLevel - 1);
    }
  }

  calcTime = 0;

  calc(): void
  {
    this.display.calc();
    this.calcTime += 16.6666666;
  }

  draw(): void
  {
    const time = performance.now();
    if (!this.display.draw(time)) return;

    this.uiUpdate();

    if (this.calcTime === 0) this.calcTime = time;
    if (this.calcTime < time + 30 && this.calcTime > time - 30) this.calc(); // inner sync?
    else while (this.calcTime < time - 20) this.calc(); // resync
  }

  static run(): void
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
  }
}

const keys: { [key: number]: boolean } = {};
let game: Game;
