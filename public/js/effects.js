function mowGrass(car) {

    // console.log(checkRGB(car.x,car.y));

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





function crash(car) {

    // playSound("crash");

    for(var i = 0; i < 3; i++) {
      var options = {
        x : car.showx,
        y : car.showy,
        width : 15,
        height: 15,
        // zV: 3.5,
        // gravity : .15,
        angle : car.actualAngle,
        speed : 2,

        // xRv : getRandom(-1,1),
        // yRv : getRandom(-1,1),
        zRv : getRandom(-3,3),

        lifespan: 50,
        color: "#FFF"

      }
      
      console.log(options.angle);

      makeParticle(options);
    }


  

}



