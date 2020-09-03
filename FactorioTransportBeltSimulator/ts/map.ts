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
  fromTop(): boolean { return this.tn !== undefined && this.tn.toBottom(); }
  fromRight(): boolean { return this.rn !== undefined && this.rn.toLeft(); }
  fromBottom(): boolean { return this.bn !== undefined && this.bn.toTop(); }
  fromLeft(): boolean { return this.ln !== undefined && this.ln.toRight(); }
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
