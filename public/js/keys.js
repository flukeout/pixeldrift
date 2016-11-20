$(document).ready(function(){

  $(".quick-restart").on("click",function(){
    race.quickRestart();
  });

  $(".change-track").on("click",function(){
    $(".track-chooser").show();
  });

  $(window).on("keydown",function(e){

    // Ignore all key presses if the name change input is opened
    if($("input.driver-name").is(":visible")) {
      return;
    }

    if(e.keyCode == 90){
      if(cameraFollow) {
        cameraFollow = false;
      } else {
        cameraFollow = true;
      }
    }

    if(e.keyCode == 84) {
      toggleSound();
    }

    if(e.keyCode == 89) {
      localStorage.removeItem("oval");
    }

    if(e.keyCode == 27){
      if($(".track-chooser:visible").length > 0) {
        if(race.track){
          $(".track-chooser").hide();
        }
      } else {
        $(".track-chooser").show();
      }
    }

    if(e.keyCode == 82){
      race.quickRestart();
    }

    if(e.keyCode == 67){
      $(".track-chooser").show();
    }
    
    // Driving controls
    if(e.keyCode == 37 || e.keyCode == 65) {
      keyboardcar.setDirection("steering","left-on");
    }
    if(e.keyCode == 39 || e.keyCode == 68) {
      keyboardcar.setDirection("steering","right-on");
    }
    if(e.keyCode == 38 || e.keyCode == 900 || e.keyCode == 87) {
      keyboardcar.setDirection("gas","on");
    }
  });

  $(window).on("keyup",function(e){

    // Driving controls
    if(e.keyCode == 37 || e.keyCode == 65) {
      keyboardcar.setDirection("steering","left-off");
    }
    if(e.keyCode == 39 || e.keyCode == 68) {
      keyboardcar.setDirection("steering","right-off");
    }
    if(e.keyCode == 38 || e.keyCode == 900 || e.keyCode == 87) {
      keyboardcar.setDirection("gas","off");
    }
  });
});
