// Copyright Jack Hedaya (c) 2017 Copyright Holder All Rights Reserved.

/**
 * [compareColors Compares two colors by checking if their RGB values are the same.]
 * @param  {color} color1 [The first color, will be compared with color2.]
 * @param  {color} color2 [The second color, will be compared with color1.]
 * @return {Boolean}        [Will return whether or not the two colors are the same.]
 */

function compareColors(color1, color2) {
  return red(color1) === red(color2) && green(color1) === green(color2) && blue(color1) === blue(color2);
}

/**
 * [objectIsEmpty Checks if an object is empty.]
 * @param  {Object} obj [The object that will be checked.]
 * @return {boolean}     [Whether or not the object is empty.]
 */

function objectIsEmpty(obj) {
  return !(Object.keys(obj).length > 0);
}

/**
 * [isNotWhitePiece Checks if there is a white piece at the given position.]
 * @param  {int} pos [The position that will be checked.]
 * @return {boolean}     [Whether or not there is a white piece at the given location.]
 */

function isNotWhitePiece(pos) {
  return pos > 6 || pos === 0;
}

/**
 * [checkForAcceptableValue Checks if Integer, x, is out of bounds (x > 7).]
 * @param  {int} x [The position that will be checked for over 7.]
 * @return {boolean}   [Whether or not Integer, x, is less than 7.]
 */

function checkForAcceptableValue(x)
{
  return x < 8;
}

/**
 * [whatPosition Finds the position of x in arr.]
 * @param  {int} x   [The value that will be searched for.]
 * @param  {[type]} arr [The array that will be searched.]
 * @return {Position}     [The position in array, arr, of x]
 */
function whatPosition(j, arr)
{
  for (var y = 0; y < arr.length; y++)
  {
    for (var x = 0; x < arr[y].length; x++)
    {
      if (arr[y][x] === j)
      {
        return new Position(y, x);
      }
    }
  }

  return null;
}
