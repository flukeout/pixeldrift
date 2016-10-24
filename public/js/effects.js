// Scatters a bit of debris on the track when the car hits a wall.

function crashDebris(x,y,angle) {

    for(var i = 0; i < 3; i++){

      var debrisOptions = {
        x : x + 3,
        y : y + 3,
        width : 9,
        height: 9,
        angle : 360 - angle + getRandom(-30,30),
        speed : getRandom(1,4),
        speedA : -.04,
        zV: getRandom(1.5,3.5),
        gravity : .15,
        xRv : getRandom(-1,1),
        yRv : getRandom(-1,1),
        zRv : getRandom(-5,5),
        o : 2,
        oV : -.04,
        lifespan: 400,
        color: "white"
      }

      makeParticle(debrisOptions);

      // Shadow particle options
      
      var shadowOptions = JSON.parse(JSON.stringify(debrisOptions));
      shadowOptions.color = "rgba(0,0,0,.15)";
      shadowOptions.zV = 0;
      makeParticle(shadowOptions);
    }
  }


// Throws a grass pixel into the air
// TODO - probably shouldn't pass the whole car object into this

function mowGrass(car) {

    var groundColor = checkRGB(car.x,car.y);

    for(var i = 0; i < 3; i++){
      groundColor[i] -= 30;
      if(groundColor[i] < 0) {
        groundColor[i] = 0;
      }
    }

    var newColor = rgbToHex(groundColor[0],groundColor[1],groundColor[2]);
    ctx.fillStyle = "#" + newColor;
    ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);

    var options = {
      x : car.showx,
      y : car.showy,
      width : 15,
      height: 15,
      zV: 3.5,
      gravity : .15,

      xRv : getRandom(-1,1),
      yRv : getRandom(-1,1),
      zRv : getRandom(-3,3),

      xV : getRandom(-1.5,1.5),
      yV : getRandom(-1.5,1.5),
      lifespan: 50,
      color: checkColor(car.x,car.y)
      // color: "#60aa1f",
    }

    makeParticle(options);

    var newOptions = {
      x : options.x,
      y : options.y,
      width : options.width,
      height: options.height,
      zRv : options.zRv,
      xV : options.xV,
      yV : options.yV,
      lifespan: options.lifespan,
      o : .15,
      color: "black",
    }

    makeParticle(newOptions);

}
