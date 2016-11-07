var colors = {
  "grass" : ["#8fcf4b","#72a33f"],
  "water" : ["#009cff"],
  "road" : ["#5a5a5a"],
  "finish" : ["#ffffff"],
  "jump" : ["#d4c921"]
};


var palette = {
  colors : "",
  init : function(colorSets){
    
    for(var k in colorSets) {
      var colorSet = colorSets[k];
      
      for(var i = 0; i < colorSet.length; i++) {
        var colorOption = $("<div class='color-option'></div>");
        colorOption.attr("color",colorSet[i]);
        colorOption.css("background",colorSet[i]);
        $(".palette").append(colorOption);
      }
      
    }
    
    this.colors = colors;
    
    var that = this;

    $(".palette").on("click",".color-option",function(){
      that.selectColor($(this).attr("color"));
    });
    
    var firstColor = $(".color-option:first-child").attr("color");
    this.selectColor(firstColor);
    
  },
  selectColor : function(color) {
    $(".palette .selected").removeClass("selected");
    $(".palette [color='"+color+"']").addClass("selected");
    editor.selectedColor = color;

    if(editor.selectedTool != "pencil" && editor.selectedTool != "fill" ) {
      toolMenu.selectTool("pencil");
    }
  }
}

