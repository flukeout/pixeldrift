$(document).ready(function(){

  $(".quick-restart").on("click",function(){
    race.quickRestart();
  });

  $(".change-track").on("click",function(){
    $(".track-chooser").show();
  });


  $(window).on("keydown",function(e){

    if(e.keyCode == 27){
      if($(".track-chooser:visible").length > 0) {
        $(".track-chooser").hide();        
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
    
    if(e.keyCode == 37 || e.keyCode == 65) {
      keyboardcar.setDirection("steering","left-on");
    }
    if(e.keyCode == 39 || e.keyCode == 68) {
      keyboardcar.setDirection("steering","right-on");
    }
    if(e.keyCode == 38 || e.keyCode == 90 || e.keyCode == 87) {
      keyboardcar.setDirection("gas","on");
    }
  });

  $(window).on("keyup",function(e){
    if(e.keyCode == 37 || e.keyCode == 65) {
      keyboardcar.setDirection("steering","left-off");
    }
    if(e.keyCode == 39 || e.keyCode == 68) {
      keyboardcar.setDirection("steering","right-off");
    }
    if(e.keyCode == 38 || e.keyCode == 90 || e.keyCode == 87) {
      keyboardcar.setDirection("gas","off");
    }
  });

});