function writeBoard(board) {
  firebase.database().ref('instances' + '/' + id).set({
    board,
    id: id
  });
}

function generateInstanceID()
{
  var id = "";
  var instances = [];

  var r = firebase.database().ref('instances');
  r.on('value', function(snapshot) {

    for (snap in snapshot.val())
    {
      instances.push (snap);
    }
    print(instances);
  });

  for (var i = 0; i < 8; i++)
  {
    var h = Math.floor((Math.random() * 9) + 1);
    id = id + h;
  }

  for (var i = 0; i < instances.length; i++)
  {
    if (id === i)
    {
      return generateInstanceID();
    }
  }

  return id;
}
