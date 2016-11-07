$(document).ready(function(){
  actionMenu.init(actions);
});

var actions = [
  {
    label : "(z) Undo",
    name : "undo",
    hotkey : "z"
  },
  {
    label : "(x) Restart",
    name : "restart",
    hotkey : "x"
  },
  {
    label : "(S)ave",
    name : "save",
    hotkey : "s"
  },
  {
    label : "f(i)rebase",
    name : "firebase",
    hotkey : "i"
  }
];


var actionMenu = {

  init : function(options){
    for(var k in options) {
      var option = options[k];
      var optionEl = $("<div class='action-option'></div>");
      optionEl.text(option.label)
      optionEl.attr("action",option.name);
      $(".actions").append(optionEl);
    }
    
    var that = this;

    $(window).on("keydown",function(e){
      var keyPress = e.key;
      
      for(var key in options) {
        var option = options[key];
        if(option.hotkey == keyPress){
          that.doAction(option.name);
        }
      }
    });
    
    var that = this;

    $(".actions").on("click",".action-option",function(){
      that.doAction($(this).attr("action"));
    });

    
  },
  doAction : function(action){
    console.log("doaction", action)

    if(action == "undo") {
      editor.undo();
    }

    if(action == "restart") {
      editor.restart();
    }

    if(action == "save") {
      editor.save();
    }

    if(action == "firebase") {
      firebaseManager.save();
    }


    $(".actions [action="+action+"]").addClass("pop");
    setTimeout(function(){
      $(".actions [action="+action+"]").removeClass("pop");
    },200)

  }
}
