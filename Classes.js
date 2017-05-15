// Copyright Jack Hedaya (c) 2017 Copyright Holder All Rights Reserved.

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

class Button {
  constructor(x, y, w, h, handler) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.handler = handler;
    this.buttonColor = color('white');
  }

  isInBounds(bX, bY)
  {
    return bX > this.x && bY > this.y && bX < this.x + this.w && bY < this.y + this.h;
  }

  draw()
  {
    fill(this.buttonColor);
    rect(this.x, this.y, this.w, this.h);
  }
}

class TextButton extends Button
{
  constructor(text, x, y, w, h, handler)
  {
    super(x, y, w, h, handler);
    this.text = text;
    this.textColor = color('black');
    this.fontSize = 25;
    this.font = fonts.vegur;
    this.stroke = true;
  }

  draw()
  {
    super.draw();

    fill(this.textColor);
    textFont(this.font);
    textSize(this.fontSize);

    text(this.text, this.x + this.w * (1 / 13), this.y + this.h * (3 / 4));
  }
}

class LabelButton
{
  constructor(text, x, y, handler)
  {
    this.text = text;
    this.x = x;
    this.y = y;
    this.handler = handler;
    this.font = fonts.vera;
    this.fontSize = 12;
    this.textColor = color('black');
  }

  isInBounds(bX, bY)
  {
    var b = this.font.textBounds(this.text, 0, 0, this.fontSize);
    return bX > this.x && bY > this.y - b.h && bX < this.x + b.w && bY < this.y;
  }

  draw()
  {
    fill(this.textColor);
    textFont(this.font);
    textSize(this.fontSize);

    text(this.text, this.x, this.y);
  }
}

class TextField extends Button
{
  constructor(x, y, w, h) {
    super(x, y, w, h, null);

    this.handler = function()
    {
      firstHandler = this;
    };

    this.buttonColor = color('white');
    this.textColor = color('black');
    this.passwordText = false;
    this.text = "";
    this.fontSize = 20;
    this.font = fonts.vera;
  }

  draw()
  {
    if (Object.is(firstHandler, this))
    {
      this.buttonColor = color('#888888');
    } else {
      this.buttonColor = color('white');
    }

    super.draw();

    fill(this.textColor);
    textFont(this.font);
    textSize(this.fontSize);

    if (this.passwordText)
    {
      var stars = "";

      for (var i = 0; i < this.text.length; i++)
      {
          stars += "*";
      }

      text(stars, this.x + (this.w / 40), this.y + this.h * (3 / 4));
    } else {
      text(this.text, this.x + (this.w / 40), this.y + this.h * (3 / 4));
    }
  }
}

class CheckBox extends Button
{
  constructor(x, y)
  {
    super(x, y, tileSize / 7, tileSize / 7, null);

    this.checked = false;

    this.handler = function()
    {
      this.checked = !this.checked
    };

  }

  draw()
  {
    super.draw();

    if(this.checked)
      image(images.check, this.x, this.y, this.w, this.h);
  }
}

class ImageButton
{
  constructor(image, x, y, w, h, handler)
  {
    this.image = image;
    this.handler = handler;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  isInBounds(bX, bY)
  {
    return bX > this.x && bY > this.y && bX < this.x + this.w && bY < this.y + this.h;
  }

  draw()
  {
    image(this.image, this.x, this.y, this.w, this.h);
  }
}
