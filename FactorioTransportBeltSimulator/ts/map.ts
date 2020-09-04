/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

enum EntityType
{
  transportBelt = 0,
  splitterLeft = 1,
  splitterRight = 2
}

enum Direction
{
  top = 0,
  right = 1,
  bottom = 2,
  left = 3
}

class MapEntity
{
  /** X-Position */
  x: number;
  /** Y-Position */
  y: number;
  /** Entity-Type */
  t: EntityType;
  /** Direction (0 = top, 1 = right, 2 = bottom, 3 = left) */
  d: Direction;

  constructor(x: number, y: number, t: EntityType, d: Direction)
  {
    this.x = x;
    this.y = y;
    this.t = t;
    this.d = d;
  }

  /** Top-Neighbor (if exists) */
  tn?: MapEntity;
  /** Right-Neighbor (if exists) */
  rn?: MapEntity;
  /** Bottom-Neighbor (if exists) */
  bn?: MapEntity;
  /** Left-Neighbor (if exists) */
  ln?: MapEntity;

  toTop(): boolean { return this.d === Direction.top; }
  toRight(): boolean { return this.d === Direction.right; }
  toBottom(): boolean { return this.d === Direction.bottom; }
  toLeft(): boolean { return this.d === Direction.left; }
  fromTop(backCheck?: boolean): boolean { return this.tn !== undefined && (this.tn.toBottom() || backCheck === true && this.tn.toTop() && !this.tn.isCurve()); }
  fromRight(backCheck?: boolean): boolean { return this.rn !== undefined && (this.rn.toLeft() || backCheck === true && this.rn.toRight() && !this.rn.isCurve()); }
  fromBottom(backCheck?: boolean): boolean { return this.bn !== undefined && (this.bn.toTop() || backCheck === true && this.bn.toBottom() && !this.bn.isCurve()); }
  fromLeft(backCheck?: boolean): boolean { return this.ln !== undefined && (this.ln.toRight() || backCheck === true && this.ln.toLeft() && !this.ln.isCurve()); }
  isCurve(): boolean
  {
    switch (this.d)
    {
      case Direction.top: return !this.fromBottom() && this.fromLeft() !== this.fromRight();
      case Direction.right: return !this.fromLeft() && this.fromTop() !== this.fromBottom();
      case Direction.bottom: return !this.fromTop() && this.fromLeft() !== this.fromRight();
      case Direction.left: return !this.fromRight() && this.fromTop() !== this.fromBottom();
      default: return false;
    }
  }
}

interface MapEntityLine extends Array<MapEntity>
{
  /** total count of entities in this line */
  count: number;
  /** X-Position from first entity */
  firstX: number;
  /** X-Position from last enitiy */
  lastX: number;
}

interface BluePrint
{
  blueprint:
  {
    icons: Array<{ signal: { type: string, name: string }, index: number }>,
    entities: Array<{ entity_number: number, name: string, position: { x: number, y: number }, direction?: number }>;
  };
}

class Map
{
  entityLines: MapEntityLine[] = [];

  /** line-update: firstX and lastX
   * @param x X-Position
   * @param y Y-Position
   */
  private updatFirstLast(x: number, y: number)
  {
    const line = this.entityLines[y];
    if (!line) return; // line does not exist
    if (line.firstX === undefined) line.firstX = x;
    if (line.lastX === undefined) line.lastX = x;
    if (line[x])
    {
      if (x < line.firstX) line.firstX = x;
      if (x > line.lastX) line.lastX = x;
    }
    else
    {
      while (!line[line.firstX]) line.firstX++;
      while (!line[line.lastX]) line.lastX--;
      while (line.length > 0 && !line[line.length - 1]) line.length--;
    }
    while (this.entityLines.length > 0 && !this.entityLines[this.entityLines.length - 1]) this.entityLines.length--;
  }

  /** remove an entity 
   * @param x X-Position
   * @param y Y-Position
   */
  removeEntity(x: number, y: number): boolean
  {
    const line = this.entityLines[y];
    if (!line) return false; // line does not exist
    const entity = line[x];
    if (!entity) return false; // entity not found
    if (entity.ln) { delete line[x - 1].rn; delete entity.ln; } // disconnect left
    if (entity.rn) { delete line[x + 1].ln; delete entity.rn; } // disconnect right
    if (entity.tn) { delete this.entityLines[y - 1][x].bn; delete entity.tn; } // disconnect top
    if (entity.bn) { delete this.entityLines[y + 1][x].tn; delete entity.bn; } // disconnect bottom
    delete line[x]; // remove entity
    line.count--;
    if (line.count === 0) delete this.entityLines[y]; // delete entire line if last entity removed
    this.updatFirstLast(x, y);
    return true;
  }

  /** add or overwrite an entity
   * @param x X-Position
   * @param y Y-Position
   * @param e Entity-Type
   * @param d Direction
   */
  add(x: number, y: number, e: EntityType, d: Direction)
  {
    const newEntity = new MapEntity(x, y, e, d);
    this.removeEntity(x, y); // remove old entity (if exsist)
    const lineT = this.entityLines[y - 1];
    const lineB = this.entityLines[y + 1];
    let line = this.entityLines[y];
    if (!line)
    {
      this.entityLines[y] = line = [] as MapEntityLine;
      line.count = 0;
    }
    line[x] = newEntity;
    line.count++;
    if (line[x - 1]) { newEntity.ln = line[x - 1]; line[x - 1].rn = newEntity; } // connect left
    if (line[x + 1]) { newEntity.rn = line[x + 1]; line[x + 1].ln = newEntity; } // connect right
    if (lineT && lineT[x]) { newEntity.tn = lineT[x]; lineT[x].bn = newEntity; } // connect top
    if (lineB && lineB[x]) { newEntity.bn = lineB[x]; lineB[x].tn = newEntity; } // connect bottom
    this.updatFirstLast(x, y);
  }

  /** load a factorio blueprint 
   * @param startX Start-Position X
   * @param startY Start-Position Y
   * @param base64 Blueprint-Code
   */
  loadBlueprint(startX: number, startY: number, base64: string): boolean
  {
    try
    {
      if (base64[0] !== "0") return false;
      const blueprint = JSON.parse(pako.inflate(atob(base64.substr(1)), { to: "string" }).toString()) as BluePrint;
      const entities = blueprint.blueprint.entities;
      let minX = 1000000;
      let minY = 1000000;
      entities.forEach(e =>
      {
        if (e.position.x < minX) minX = e.position.x;
        if (e.position.y < minY) minY = e.position.y;
      });
      entities.forEach(e =>
      {
        const x = (e.position.x - minX + startX) >> 0;
        const y = (e.position.y - minY + startY) >> 0;
        const d = e.direction === 2 ? Direction.right : e.direction === 6 ? Direction.left : e.direction === 4 ? Direction.bottom : Direction.top;
        switch (e.name)
        {
          case "transport-belt": this.add(x, y, EntityType.transportBelt, d); break;
        }
      });
      return true;
    }
    catch (exc)
    {
      return false;
    }
  }

  /** get entity 
   * @param x X-Position
   * @param y Y-Position
   */
  getEntity(x: number, y: number): MapEntity
  {
    const line = this.entityLines[y];
    if (!line) return undefined;
    return line[x];
  }

  callEntities(firstX: number, firstY: number, lastX: number, lastY: number, call: (x: number, y: number, e: MapEntity) => void): void
  {
    const lines = this.entityLines;
    if (lastY >= lines.length) lastY = lines.length - 1;
    for (let y = firstY; y <= lastY; y++)
    {
      const line = lines[y];
      if (!line) continue;
      const lx = lastX <= line.lastX ? lastX : line.lastX;
      for (let x = firstX >= line.firstX ? firstX : line.firstX; x <= lx; x++)
      {
        const e = line[x];
        if (e) call(x, y, e);
      }
    }
  }
}
