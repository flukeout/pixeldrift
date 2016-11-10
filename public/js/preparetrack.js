
function prepareTrack(level){

  trackData = trackList[level];
  
  if(!trackData) {
    return;
  }

  canvasTrack = $("canvas.track-source");
  context = canvasTrack[0].getContext("2d");


  var image = new Image();
  $("body").append(image);
  $(image).hide();

  var url = window.location;

  var href = url.href.replace("#","");

  image.src = href + 'public/tracks/' + level;

  $(".track").css("background-image", "url(./public/tracks/"+level+")");

  $(image).on("load",function(){

    $(".bigtree, .lamp, .tree, .windmill, .water").remove(); // maybe add a sprite clas to these?

    context.clearRect(0, 0, 500, 500);
    context.drawImage(image, 0, 0);

    trackHeight = $(this).height();
    trackWidth = $(this).width();
    $(".track").height(trackHeight * scaling).width(trackWidth * scaling);

    $(".track-shadow").height(trackHeight * scaling).width(trackWidth * scaling);

    var h = trackHeight * scaling / 2;
    var w = trackWidth * scaling / 2;
    $(".track").css("top","calc(45% - "+h+"px)");
    $(".track").css("left","calc(50% - "+w+"px)");

    h = h - 50;
    $(".track-shadow").css("top","calc(45% - "+h+"px)");
    $(".track-shadow").css("left","calc(50% - "+w+"px)");


    $(".track").css("min-height",trackHeight * scaling).css("min-width",trackWidth * scaling);

    canvasTrack.height(trackHeight);
    canvasTrack.width(trackWidth);

    // Set up the skid canvas
    var skidCanvas = $(".skids");
    ctx = skidCanvas[0].getContext("2d");
    skidCanvas.attr("width", trackWidth * scaling).attr("height",trackHeight * scaling);

    trackData.startPositions = [];
    trackData.checkpointPositions = [];

    for(var i = 0; i < parseInt(trackWidth); i++){
      for(var j = 0; j < parseInt(trackHeight); j++){
        var result = checkPosition(i,j);

        if(result == "finish"){
          trackData.startPositions.push({"x": i, "y" : j});
        }

        if(result == "checkpoint"){
          trackData.checkpointPositions.push({"x": i, "y" : j});
        }

        if(result == "lamp"){
          var lamp = $("<div class='lamp'></div>");
          $(".track").append(lamp)
          lamp.css("left", scaling * (i));
          lamp.css("top", scaling * (j - 3));
        }

        if(result == "windmill"){
          var el = $("<div class='windmill'><div class='prop'></div>");
          $(".track").append(el)
          el.css("left", scaling * (i));
          el.css("top", scaling * (j - 3));
        }

        if(result == "tree"){
          var tree = $("<div class='tree'><div class='tree-inner'></div></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 3));
        }

        if(result == "bigtree"){
          var tree = $("<div class='bigtree'><div class='tree-inner'></div></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 8));
        }

        if(result == "water"){
          var chance = getRandom(0,4);
          if(chance < 1) {
            var delay = getRandom(0,8);
            var el = $("<div class='water'></div>");
            el.css("animation-delay",delay+"s");
            $(".track").append(el)
            el.css("left", scaling * i);
            el.css("top", scaling * j);
          }
        }
      }
    }

    makeCheckpoints();
    addFinishLine();

  });
}



function addFinishLine(){

  $(".track .finish-line").remove();

  //TODO - This is such garbage... come on.
  var startX = 999999999;
  var endX = -1;
  var startY = 999999999;
  var endY = -1;

  var sP = trackData.startPositions;

  for(i = 0; i < sP.length; i++){
    if(sP[i].x < startX) {
      startX = sP[i].x
    }
    if(sP[i].x > endX) {
      endX = sP[i].x
    }

    if(sP[i].y < startY) {
      startY = sP[i].y
    }
    if(sP[i].y > endY) {
      endY = sP[i].y
    }
  }

  var finishColor = "orange";
  var roadColor = "pink";

  for(var k in trackData.hexes){
    if(trackData.hexes[k] == "road"){
      roadColor = k;
    }
    if(trackData.hexes[k] == "finish"){
      finishColor = k;
    }
  }

  var finishLine = $("<div class='finish-line'><div class='line'></div></div>");
  finishLine.css("top",startY * scaling).css("left",startX * scaling).height((endY - startY + 1) * scaling).width(scaling);
  finishLine.find(".line").css("background",finishColor);
  finishLine.css("background",roadColor);
  finishLine.css("border-color",roadColor);
  $(".track").append(finishLine);
}





function makeCheckpoints(){

  id = 1;

  for(var i = 0; i < trackData.checkpointPositions.length; i++){
    var p = trackData.checkpointPositions[i];

    if(p.id == undefined) {
      p.id = id;
      id++;
    }

    for(var j = 0; j < trackData.checkpointPositions.length; j++){
      var q = trackData.checkpointPositions[j];
      if(i != j) {
        if((p.x == q.x && p.y + 1 == q.y) || (p.y == q.y && p.x + 1 == q.x)) {
          q.id = p.id;
        }
      }
    }
  }


  trackData.checkPoints = id - 1;
  
  var elementGroups = {};
  
  for(var i = 0; i < trackData.checkpointPositions.length; i++) {
    var p = trackData.checkpointPositions[i];
    if(!elementGroups[p.id]) {
      elementGroups[p.id] = [];
    }
    elementGroups[p.id].push(p);
  }

  $(".track .element").remove();
  for(var k in elementGroups) {
    var group = elementGroups[k];
    addElement(group);
  }

}

// Adds an element to the track
// accepts an array of [x,y] coordinates

function addElement(positions){

  // Get the checkpoint-indicator color from the color hex values
  var color = "#277eba";
  for(var k in trackData.hexes){
    if(trackData.hexes[k] == "checkpoint-indicator"){
      color = k;
    }
  }

  var startX = 999999999;
  var endX = -1;
  var startY = 999999999;
  var endY = -1;
  var id = positions[0].id;

  var sP = positions;

  for(i = 0; i < sP.length; i++){
    if(sP[i].x < startX) {
      startX = sP[i].x
    }
    if(sP[i].x > endX) {
      endX = sP[i].x
    }
    if(sP[i].y < startY) {
      startY = sP[i].y
    }
    if(sP[i].y > endY) {
      endY = sP[i].y
    }
  }
  
  var xDelta = Math.abs(startX - endX);
  var yDelta = Math.abs(startY - endY);
  var direction = "vertical";
  if(xDelta > yDelta) {
    direction = "horizontal";
  }

  var finishLine = $("<div class='element cleared'><div class='line'/><div class='wall'/></div>");
  finishLine.attr("checkpoint", id);
  finishLine.addClass(direction);
  finishLine.css("top",startY * scaling);
  finishLine.find(".line").css("background",color);
  finishLine.find(".wall").css("background",color);

  finishLine.css("left",startX * scaling);
  finishLine.height((endY - startY + 1) * scaling);
  finishLine.width((endX - startX + 1) * scaling);
  $(".track").append(finishLine);
}

