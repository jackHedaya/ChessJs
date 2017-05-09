class Position
{
  constructor(y, x)
  {
    this.y = y;
    this.x = x;
  }
}

class Piece
{
  constructor(type, pos)
  {
    this.type = type;
    this.pos = pos;
  }
}

class Player {
  constructor(color) {
    this.color = color;
  }
}
