var brushSizes = [1,2,3,5];

$(document).ready(function(){
  brushUI.init();  

  $(window).on("keydown",function(e){
    

    if(e.key == "[") {
      brushUI.changeBrush("smaller");
    }
    if(e.key == "]") {
      brushUI.changeBrush("bigger");
    }

  });



});

var brushUI = {
  init : function(){
    for(var i = 0; i < brushSizes.length; i++) {
      var size = brushSizes[i];
      var brushSizeOption = $("<div class='brush-option'></div>");
      $(".brush-sizes").append(brushSizeOption);
      brushSizeOption.attr("size", size);
      brushSizeOption.width(size * editor.scaling);
      brushSizeOption.height(size * editor.scaling);
    }
    var that = this;
    $(".brush-sizes").on("click",".brush-option",function(){
      var size = parseInt($(this).attr("size"));
      that.selectBrush(size);
    });
    
    this.selectBrush(brushSizes[1]);
    
  },
  
  changeBrush : function(size){
    var currentSize = editor.brushSize;
    var currentIndex = brushSizes.indexOf(parseInt(currentSize));
    
    if(size == "bigger") {
      currentIndex++;
      if(currentIndex >= brushSizes.length) {
        currentIndex = 0;
      } 
    } else {
      currentIndex--;
      if(currentIndex < 0) {
        currentIndex = brushSizes.length - 1;
      } 
    }
    
    this.selectBrush(brushSizes[currentIndex]);
  },
  

  selectBrush: function(size) {
    $(".brush-sizes .selected").removeClass("selected");
    $(".brush-sizes [size="+size+"]").addClass("selected");

    editor.brushSize = size;
    editor.updateView();
  }
}