// Creates the "old" style ghosts
// * Series of keyframes that includes position & rotation
// * These keyframes are interpolated between when the ghost drives

function createGhost(ghostData){

  var ghostEl = $('<div class="ghost"><div class="body"></div></div>');
  var ghostShadow = ghostEl.find(".shadow");
  var ghostBody = ghostEl.find(".body");

  var chosenColor = trackData.carcolors[0];

  ghostBody.css("background",chosenColor);

  var frames = ghostData.frames;
  var lastFrame = frames[frames.length - 1];
  var totalTime = lastFrame.time;
  var frameDelta = lastFrame.time / frames.length;

  var frameCopy = JSON.stringify(ghostData.frames[0]);
  frameCopy = JSON.parse(frameCopy);
  frameCopy.time = totalTime + frameDelta;

  var newGhost = {
    frameIndex : 0,
    status : "active",
    el : ghostEl,
    bodyEl : ghostBody,
    shadowEl : ghostShadow,
    frames : ghostData.frames,
    name : "BOB",
    timeElapsed : 0,
    timeAlive : 0,
    lapTime : ghostData.lapTime,
    laps  : 1,
    x : 0,
    y : 0,
    z : 0,
    r : 0,
    v : 0,
    xD : 0,
    yD : 0,
    reset : function(){
      this.frameIndex = 0;
      this.timeAlive = 0;
      this.status = "idle";
    },
    lapEnd : function(){

      // if(this.state == "idle") {
      //   this.state = "active";
      //   this.el.show();
      // }

      // if(this.status == "active" && this.lapTime > race.laptime){
      //   this.status = "stopped";

        // var xD = this.frames[this.frameIndex].x - this.frames[this.frameIndex-1].x ;
        // var yD = this.frames[this.frameIndex].y - this.frames[this.frameIndex-1].y ;
        // makeParticle(this.x/15, this.y/15, 5, 20, "ghost",xD,yD); // could just include a count here... in

        // this.el.hide();
      // }

      // if(this.status == "active" && this.lapTime < race.laptime){
        this.frameIndex = 0;
        this.timeAlive = 0;
        this.el.show();
      // }

      // if(this.status == "idle"){
        this.status = "active";
      // }

    },
    drive : function(){

      // if(this.timeAlive == 0) {
        // this.el.hide();
      // }

      if(this.status == "idle"){
        this.el.hide();
        return;
      }

      if(this.status == "stopped") {
        this.el.css("transform", "translateX("+this.x+"px) translateY("+this.y+"px)");
        this.bodyEl.css("transform","rotateZ("+this.r+"deg)");
        return;
      }

      this.timeAlive = this.timeAlive + this.timeElapsed;

      if(this.timeAlive > this.lapTime) {
        this.el.hide();
      }

      for(var i = this.frameIndex-1; i < this.frames.length; i++){
        var frame = this.frames[i];
        if(frame){
          if(frame.time >= this.timeAlive){

            //So it looks like there's a delta.... we're jumping in at more than the start of the frame.
            var offset = frame.time - this.timeAlive; //

            var nextFrame = frame;
            var thisFrame = this.frames[i-1];  // this is really a pastFrame...
            this.frameIndex = i;
            break;
          }
        }
      }

      if(thisFrame && nextFrame){
        this.el.show();

        var frameDelta = nextFrame.time - thisFrame.time; // time between the two frames...
        var raceDelta = nextFrame.time - this.timeAlive;
        var percent = 1 - raceDelta/frameDelta; // -.2 or something here... it's jarring though...

        var newFrame = {};
        newFrame.x = thisFrame.x + (nextFrame.x - thisFrame.x) * percent;
        newFrame.y = thisFrame.y + (nextFrame.y - thisFrame.y) * percent;
        var angleDelta = nextFrame.angle - thisFrame.angle;
        newFrame.z = thisFrame.z - (nextFrame.z - thisFrame.z) * percent;

        this.xD = newFrame.x - this.x;
        this.yD = newFrame.y - this.y;

        this.x = newFrame.x;
        this.y = newFrame.y;
        this.r = newFrame.angle;

        // TODO - why is this commented out?
        // if(this.z > 0) {
        //         this.shadowEl.show();
        //       } else {
        //         this.shadowEl.hide();
        //       }

        if(angleDelta > 0 && angleDelta > 180) {
          angleDelta = 360 - angleDelta;
        }
        if(angleDelta < 0 && Math.abs(angleDelta) > 180) {
         angleDelta = angleDelta + 360;
        }

        newFrame.angle = thisFrame.angle + (angleDelta) * percent;

        this.el.css("transform", "translateX("+newFrame.x+"px) translateY("+newFrame.y+"px)" );
        this.bodyEl.css("transform","rotateZ("+newFrame.angle+"deg)");
     }
   }

  }

  return newGhost;
}