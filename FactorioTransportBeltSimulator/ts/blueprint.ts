/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

interface BluePrintIcon
{
  signal: { type: string, name: string },
  index: number;
}

interface BluePrintEntity
{
  entity_number: number,
  name: string,
  position: { x: number, y: number },
  /** values: undefined = top, 2 = right, 4 = bottom, 6 = left */
  direction?: 2 | 4 | 6;
}

interface BluePrint
{
  blueprint:
  {
    icons: BluePrintIcon[],
    entities: BluePrintEntity[],
    item: "blueprint",
    label: string,
    version: 281474976710656;
  };
}

class Blueprint
{
  static decodeBlueprint(base64: string): MapEntity[]
  {
    const result: MapEntity[] = [];

    try
    {
      if (base64[0] !== "0") return result;
      const blueprint = JSON.parse(pako.inflate(atob(base64.substr(1)), { to: "string" }).toString()) as BluePrint;
      console.log(blueprint);
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
        const x = (e.position.x - minX) >> 0;
        const y = (e.position.y - minY) >> 0;
        const d = e.direction === 2 ? Direction.right : e.direction === 6 ? Direction.left : e.direction === 4 ? Direction.bottom : Direction.top;
        switch (e.name)
        {
          case "transport-belt": result.push(new MapEntity(x, y, EntityType.transportBelt, d)); break;
        }
      });
    }
    catch (exc) { }

    return result;
  }

  static encodeBlueprint(label: string, entities: MapEntity[]): string
  {
    const result: BluePrint =
    {
      blueprint:
      {
        icons: [],
        entities: [],
        label: label,
        item: "blueprint",
        version: 281474976710656
      }
    };

    let count = 0;
    entities.forEach(e =>
    {
      let next: BluePrintEntity;

      const dir = e.d === Direction.right ? 2 : e.d === Direction.bottom ? 4 : e.d === Direction.left ? 6 : 0;

      switch (e.t)
      {
        case EntityType.transportBelt: {
          next = {
            entity_number: ++count,
            name: "transport-belt",
            position: { x: e.x, y: e.y },
          };
          if (dir === 2 || dir === 4 || dir === 6) next.direction = dir;
        } break;
      }

      if (next) result.blueprint.entities.push(next);
    });

    return "0" + btoa(pako.deflate(JSON.stringify(result), { to: "string" }).toString());
  }
}
