// Draws a line between two points
// 


var drawTimeout = 0;

function drawLine(from,to) {
  var yDelta = from.y - to.y;
  var xDelta = from.x - to.x;
  
  if(Math.abs(xDelta) >= Math.abs(yDelta)) {

    var goingRight = true;
    if(from.x > to.x) {
      goingRight = false;
    }

    var j = 0;

    for(var i = from.x; goingRight ? i <= to.x : i >= to.x; goingRight ? i++ : i--) {
      var percent = j / Math.abs(xDelta);
      var newY = from.y - (yDelta * percent);
      newY = Math.round(newY);
      setTimeout(function(i,newY) { return function() { 
        editor.updatePixel(i, newY);
      }; }(i,newY), j * drawTimeout);
      j++;
    }

  } else {

    var goingUp = true;
    if(from.y > to.y) {
      goingUp = false;
    }

    var j = 0;
    for(var i = from.y; goingUp ? i <= to.y : i >= to.y; goingUp ? i++ : i--) {
      var percent = j / Math.abs(yDelta);
      var newX = from.x - (xDelta * percent);
      newX = Math.round(newX);
      setTimeout(function(i,newX) { return function() { 
        editor.updatePixel(newX, i);
      }; }(i,newX), j * drawTimeout);
      j++;
    }
  }

}