var tools = [
  {
    label : "(b)rush",
    name : "pencil",
    hotkey : "b"
  },
  {
    label : "(f)ill",
    name : "fill",
    hotkey : "f"
  },
  {
    label : "(e)raser",
    name : "eraser",
    hotkey : "e"
  },
  {
    label : "(m)ove",
    name : "move",
    hotkey : "m"
  },
];

var toolMenu = {
  init : function(tooltypes){
    for(var k in tooltypes) {
      var tool = tooltypes[k];
      var toolOption = $("<div class='tool-option'></div>");
      toolOption.text(tool.label)
      toolOption.attr("tool",tool.name);
      $(".toolbelt").append(toolOption);
    }
    
    var that = this;
    $(window).on("keydown",function(e){
      var keyPress = e.key;
      
      for(var key in tools) {
        var tool = tools[key];
        if(tool.hotkey == keyPress){
          
          that.selectTool(tool.name);
        }
      }
    });
    
    var that = this;

    $(".toolbelt").on("click",".tool-option",function(){
      that.selectTool($(this).attr("tool"));
    });

    var firstTool = $(".tool-option:first-child").attr("tool");
    this.selectTool(firstTool);
    
  },
  selectTool : function(tool){
    $(".toolbelt .selected").removeClass("selected");
    $(".toolbelt [tool='"+tool+"']").addClass("selected");
    editor.selectedTool = tool;
  }
}
