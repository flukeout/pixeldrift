$(document).ready(function(){
  
  
  $(".zoom-ui").on("click","a",function(){

    $(".track").css("transition", "transform .25s cubic-bezier(0.005, 1.000, 0.420, 1.590)");

    setTimeout(function(){
      $(".track").css("transition", "none");
    },250)

    if($(this).attr("zoom") == "in") {
      if(editor.settings.viewScale < 5) {
        editor.settings.viewScale += .5;
      }
    } else {
      if(editor.settings.viewScale > 1) {
        editor.settings.viewScale -= .5;
      }

    }
    editor.updateView();

  });
  
});