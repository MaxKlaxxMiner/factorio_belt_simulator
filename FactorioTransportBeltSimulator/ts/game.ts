/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

// --- globals ---
const keys: { [key: number]: boolean } = {};
let mouseX = 0;
let mouseY = 0;
let mouseButtons = 0;
let mouseWheel = 0;
let game: Game;

class Game
{
  map: Map;
  display: Display;

  constructor(gameDiv: HTMLElement, canvasWidth: number, canvasHeight: number)
  {
    this.map = new Map();
    this.display = new Display(gameDiv, canvasWidth, canvasHeight, this.map);

    const m = this.map;

    const loopBp = "0eNqd092ugyAMAOB36TVbxCFuvMpysujWLCRaDXTLMYZ3H+rNOZlLJpfl5yvQMkLdPLB3lhjMCPbakQdzHsHbO1XNNMZDj2DAMrYggKp2ithV5PvO8a7GhiEIsHTDXzAy/AhAYssWF2kOhgs92hpdXPDJENB3Pm7raMoaqZ1U+0LAAOa0L2KGm3V4XebzIN7gfAOcf4LVCnzYAB+2nFglPIWUUV6xihQrW7d0woXnc/27sV6Ry4QafScfU+Tsvfyxe+dON38+hoCmitZko2cZ4yc6v5T1KFWpTqUuZaYLHcILdU8UnQ==";

    m.addBlueprint(1, 1, loopBp);
    m.addBlueprint(5, 1, loopBp);
    m.addBlueprint(1, 5, loopBp);
    m.addBlueprint(5, 5, loopBp);

    //for (let y = 2; y < 12; y++)
    //{
    //  for (let x = 2; x < 22; x++)
    //  {
    //    m.add(x, y, EntityType.transportBelt, Math.random() * 4 >> 0);
    //    //m.add(x, y, EntityType.transportBelt, y & 3);
    //  }
    //}

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

    function mouseWheelEvent(m: MouseWheelEvent)
    {
      console.log(m);
      if ((<any>m).wheelDelta !== undefined) // IE workaround
      {
        if ((<any>m).wheelDelta < 0) mouseWheel++; else mouseWheel--;
        return;
      }
      if (typeof m.deltaY === "number")
      {
        if (m.deltaY > 0) mouseWheel++; else mouseWheel--; // generic
      }
      else
      {
        if (m.detail > 0) mouseWheel++; else mouseWheel--; // firefox workaround
      }
    }

    if ("onmousewheel" in window)
    {
      window.onmousewheel = mouseWheelEvent;
    }
    else // Firefox fallback
    {
      document.addEventListener("DOMMouseScroll", mouseWheelEvent, false);
    }

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
