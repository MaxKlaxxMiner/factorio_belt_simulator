/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

class Game
{
  map: Map;
  display: Display;

  constructor(gameDiv: HTMLElement, canvasWidth: number, canvasHeight: number)
  {
    this.map = new Map();
    this.display = new Display(gameDiv, canvasWidth, canvasHeight, this.map);

    const m = this.map;

    for (let y = 2; y < 12; y++)
    {
      for (let x = 2; x < 22; x++)
      {
        m.add(x, y, EntityType.transportBelt, Math.random() * 4 >> 0);
        //m.add(x, y, EntityType.transportBelt, 0);
      }
    }

    //m.add(3, 2, EntityType.transportBelt, Direction.bottom);
    //m.add(2, 3, EntityType.transportBelt, Direction.right);
    //m.add(3, 3, EntityType.transportBelt, Direction.right);
  }

  lastWheel = 0;
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
    if (this.lastWheel !== mouseWheel)
    {
      if (mouseWheel < this.lastWheel)
      {
        this.display.setScale(this.display.scaleLevel + 1);
      }
      else
      {
        this.display.setScale(this.display.scaleLevel - 1);
      }
      this.lastWheel = mouseWheel;
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
    // --- init ---
    const docSize = getDocumentSize();
    const div = document.getElementById("game");
    game = new Game(div, docSize.width, docSize.height);

    // --- key events ---
    document.body.onkeydown = (e: KeyboardEvent) =>
    {
      console.log("key pressed: " + e.keyCode);
      keys[e.keyCode] = true;
    };
    document.body.onkeyup = (e: KeyboardEvent) =>
    {
      keys[e.keyCode] = false;
    };

    // --- mouse events ---
    document.addEventListener("contextmenu", event => event.preventDefault()); // disable context menu (right mouse click)

    window.onmousewheel = (m: MouseWheelEvent) =>
    {
      if (m.deltaY > 0) mouseWheel++; else mouseWheel--;
    };

    const mouseEvent = (m: MouseEvent) =>
    {
      mouseX = m.x;
      mouseY = m.y;
      mouseButtons = m.buttons;
    };

    div.onmousedown = mouseEvent;
    div.onmousemove = mouseEvent;
    div.onmouseup = mouseEvent;

    // --- run game-loop --

    //window.setInterval(() => game.draw(), 8); // 125 FPS test
    const run = () => { requestAnimFrame(run); game.draw(); }; run(); // vsync
  }
}

const keys: { [key: number]: boolean } = {};
let mouseX = 0;
let mouseY = 0;
let mouseButtons = 0;
let mouseWheel = 0;
let game: Game;
