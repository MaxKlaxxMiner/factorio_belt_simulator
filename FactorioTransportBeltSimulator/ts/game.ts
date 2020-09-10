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

    const test = "0eNqdluFugyAUhd/l/qYNF1Crr9Isi7ZkIbFolC5rGt99tF2aZZXscv8Jwc/j4R4uV+j6sx0n5wM0V3CHwc/Q7K8wuw/f9re5cBktNOCCPYEA355uozC1fh6HKWw62wdYBDh/tF/Q4PImwPrggrMP0n1weffnU2enuCDFEDAOc3xt8LevRtQGi20h4BKfzLZYFvHCUhxWfIhyj26yh8cCtULWGWSTRTYcsqGQiwyyztJcZpBVkmxWyBWHTHJjx3HDUDTXT/I89i6EOLfCxCfzf60oM8TKLBswI291lg2oSD78IPV6gpEVNJWAGc55kIIVnNLUpD0pObWp/qLLNTQrUDQ0K1E0Q2pO/WtKlSpJqlKZMGIVyYkUTSyroWGiObKihZRSUIZTCjQ0q4vJhAWsxiVJOllBS23VLq+lIEEfK1KkX9esbkXafc2JFk20YpDxNbTxdnu/CTe/Ls4CPu00P063HZrK1FVZoSyLclm+ARXersg=";

    m.addBlueprint(1, 1, test);

    //for (let y = 2; y < 12; y++)
    //{
    //  for (let x = 2; x < 22; x++)
    //  {
    //    m.add(x, y, EntityType.transportBelt, Math.random() * 4 >> 0);
    //    //m.add(x, y, EntityType.transportBelt, y & 3);
    //  }
    //}

    //m.add(3, 3, EntityType.splitter, Direction.top);
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
    let moveDirX = 0;
    let moveDirY = 0;

    if (keys[87]) moveDirY++; // W
    if (keys[65]) moveDirX++; // A
    if (keys[83]) moveDirY--; // S
    if (keys[68]) moveDirX--; // D
    if (moveDirX !== 0 || moveDirY !== 0)
    {
      if (moveDirX !== 0 && moveDirY !== 0) // diagonal move? -> reduce speed
      {
        moveDirX /= Math.sqrt(2);
        moveDirY /= Math.sqrt(2);
      }
      this.display.offsetX += moveDirX * Math.min(50, Math.max(5, this.display.scale * 0.2));
      this.display.offsetY += moveDirY * Math.min(50, Math.max(5, this.display.scale * 0.2));
    }
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
