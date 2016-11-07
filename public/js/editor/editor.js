$(document).ready(function(){
  
  $(window).on("keydown",function(e){
    if(e.keyCode == 16) {
      editor.shift = "down";
    }
  });

  $(window).on("keyup",function(e){
    if(e.keyCode == 16) {
      editor.shift = "up";
    }
  });


  $(window).on("mousedown", function(e){
    editor.mouse = "down";
    editor.mouseDown(e);
  })

  $(window).on("mouseup", function(){
    editor.mouse = "up";
    editor.mouseUp();
  });
  
  palette.init(colors);
  toolMenu.init(tools);
  editor.init();
  
  editor.editorEl.on("mouseover",function(){
    editor.showCursor();
  });

  editor.editorEl.on("mousemove",function(e){
    editor.moveCursor(e);
    lastMouse = e;
  });

  editor.editorEl.on("mouseout",function(){
    editor.hideCursor();
  });
  
  setTimeout(function(){
    loop();
  },200)
  
});

var lastMouse; 

function loop(){
  
  editor.moveCursor(lastMouse);
  
  window.requestAnimationFrame(loop);
}

var editor = {
  scaling : 15, // How big each pixel is
  cursorX : 0,
  cursorY: 0,
  mouse : "up",
  shift : "up",
  selectedColor: "rgba(255,255,255,1)",

  // This is the stuff we'll save
  trackName : "unnamed track",
  trackWidth : 20,
  trackHeight : 20,
  pixels : {},

  selectedTool : "pencil", 
  brushSize : 1,
  brushPixels : [],

  cursorVisible : false,

  history : [],
  mouseDownSnapshot : {},
  mouseUpSnapshot : {},

  settings : {
    viewTranslateX : 0, // Keeps track of viewport offset
    viewTranslateY : 0, // Keeps track of viewport offset
    viewScale : 1,
  },

  pageXStart : 0, // tracks beginning of mouse gesture
  pageYStart : 0, // tracks origin of mouse gesture


  lastPixel : false,

  save : function(){
    
    var savedTrack = {
      width : this.trackWidth,
      height : this.trackHeight,
      trackName : "tempTrack",
      pixels : {}
    }
    
    var tempPixels = JSON.parse(JSON.stringify(this.pixels));
    
    for(var key in tempPixels) {
      var pixel = tempPixels[key];
      delete pixel.el;
    }
    
    savedTrack.pixels = tempPixels;
    
    localStorage.setItem("savedTrack", JSON.stringify(savedTrack));
    
    // no argument defaults to image/png; image/jpeg, etc also work on some
    // implementations -- image/png is the only one that must be supported per spec.

  },

  restart : function(){
    
    this.history = [];

    for(var key in this.pixels) {
      var p = this.pixels[key];

      p.el.css("background","transparent");
      p.color = false;

      this.ctx.clearRect(p.x, p.y, 1, 1);
    }
  },

  init: function(){
    
    this.editorEl = $(".track");
    
    this.canvasEl = $(".editor-canvas");
    this.canvasEl.attr("height",this.trackHeight);
    this.canvasEl.attr("width",this.trackWidth);
    this.ctx = this.canvasEl[0].getContext("2d");
    
    this.cursorEl = $("<div class='cursor'/>");
    this.cursorEl.height(this.scaling);
    this.cursorEl.width(this.scaling);    
    this.editorEl.append(this.cursorEl);
    this.hideCursor();
    
    var savedTrack = JSON.parse(localStorage.getItem("savedTrack")) || false;

    var localSettings = JSON.parse(localStorage.getItem("editorSettings"));
    if(localSettings) {
      this.settings = localSettings;
      this.updateView();
    }
    
    this.loadTrack(savedTrack);
  },
  
  
  
  loadTrack : function(savedTrack){
    
    console.log(savedTrack);
    
    this.trackHeight = savedTrack.height || 20;  // Default track size
    this.trackWidth = savedTrack.width || 20;    // 
    
    this.editorEl.width(this.trackWidth * this.scaling);
    this.editorEl.height(this.trackHeight * this.scaling);
    
    this.editorEl.find(".pixel").remove();
    
    this.pixels = {};
    
    for(var y = 0; y < this.trackHeight; y++) {
      for(var x = 0; x < this.trackWidth; x++) {
        var pixelEl = $("<div class='pixel'/>");
        pixelEl.height(this.scaling);
        pixelEl.width(this.scaling);
        pixelEl.css("left", x * this.scaling);
        pixelEl.css("top", y * this.scaling);

        this.pixels[x+","+y] = {};
        this.pixels[x+","+y].el = pixelEl;
        

        if(savedTrack.pixels[x+","+y]) {
          var color = savedTrack.pixels[x+","+y].color || false;          
        } else {
          var color = false;          
        }


      
        this.pixels[x+","+y].color = color;
        
        pixelEl.css("background",color);

        // Fill this pixel color..
        if(color) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x, y, 1, 1);
        }
        // Why is this going wrong.....
        
        this.pixels[x+","+y].x = x;
        this.pixels[x+","+y].y = y;
                
        this.editorEl.append(pixelEl);
      }
    }
    
    
  },


  updateView : function(){
    
    $(".track").css("transform", "rotateX(20deg) scale("+this.settings.viewScale+") translateX("+this.settings.viewTranslateX+"px) translateY("+this.settings.viewTranslateY+"px)");

    localStorage.setItem("editorSettings",JSON.stringify(this.settings));

    if(this.cursorEl) {
      this.cursorEl.css("height", this.scaling * this.brushSize);
      this.cursorEl.css("width", this.scaling * this.brushSize);
    }

    
  },

  drawLine : function(from,to){
    
    var from = {
      x: this.lastPixel.x,
      y: this.lastPixel.y
    }

    var fromPixels = [];

    for(var i = 0; i < this.brushSize; i++) {
      for(var j = 0; j < this.brushSize; j++) {
        var x = from.x + i;
        var y = from.y + j;
        fromPixels.push({ x : x, y : y});
      }
    }

    // Paints a line from each 'from' pixel to each 'to' pixel
    // to account for 'thicker' lines
    for(var i = 0; i < this.brushPixels.length; i++) {
      var from = fromPixels[i];
      var to = this.brushPixels[i];
      drawLine(from,to);
    }
  },
  
  // Applies the effects 
  
  useBrush: function(){
    for(var i = 0; i < this.brushPixels.length; i++) {
      var p = this.brushPixels[i];
      this.updatePixel(p.x,p.y);
    }
  },


  // Makes a snapshot when you start doing 'something'
  mouseDown: function(e){

    for(var y = 0; y < this.trackHeight; y++) {
      for(var x = 0; x < this.trackWidth; x++) {
        var pixel = this.pixels[x+","+y];
        this.mouseDownSnapshot[x+","+y] = {};
        this.mouseDownSnapshot[x+","+y].color = pixel.color;
      }
    }

    if(this.cursorVisible){

      if(this.selectedTool == "fill") {
        this.bucketFill(this.cursorX, this.cursorY);
      }

      if(this.shift == "down" && this.lastPixel && (this.selectedTool == "pencil" || this.selectedTool == "eraser")) {
        this.drawLine();
      } else {
        this.useBrush();
      }
    }
    
    this.pageXStart = e.pageX;
    this.pageYStart = e.pageY;
  },


  bucketFill : function(x,y) {
    
    var startColor = this.pixels[x+","+y].color;

    
    for(var key in this.pixels) {
      var pixel = this.pixels[key];
      pixel.changed = false;
    }

    this.bucketPixel(x, y, startColor);    
    
    console.log("oh shit...");
  },
  
  
  bucketPixel(x,y,startColor){
    
    var pixel = this.pixels[x+","+y];

    if(!pixel) { return; }
    
    if(pixel.color == startColor && !pixel.changed){
      this.changePixel(x,y,this.selectedColor);
      pixel.changed = true;
      
      setTimeout(function(x,y,that) { 
        return function() { 
          that.bucketPixel(x-1,y,startColor);
          that.bucketPixel(x+1,y,startColor);
          that.bucketPixel(x,y-1,startColor);
          that.bucketPixel(x,y+1,startColor);
        }; 
      }(x,y,this),40);
    }
  },


  // When you're done, it checks if there were any changes
  // If so, it pushes the previuosly recorded state to history
  mouseUp : function(){
    
    for(var y = 0; y < this.trackHeight; y++) {
      for(var x = 0; x < this.trackWidth; x++) {
        var pixel = this.pixels[x+","+y];
        this.mouseUpSnapshot[x+","+y] = {};
        this.mouseUpSnapshot[x+","+y].color = pixel.color;
      }
    }    

    if(JSON.stringify(this.mouseUpSnapshot) != JSON.stringify(this.mouseDownSnapshot)) {
      this.history.push(JSON.parse(JSON.stringify(this.mouseDownSnapshot)));
    }
  },
  
  undo : function(){

    if(this.history.length > 0) {
      var lastHistory = this.history[this.history.length - 1];

      for(var key in lastHistory) {
        var p = lastHistory[key];
        this.pixels[key].color = p.color;
      }
      this.history.pop();
      this.drawCanvas();
    }
    
  },
  
  drawCanvas : function(){
        
    // draws canvas and divs based on pixels
    for(var y = 0; y < this.trackHeight; y++) {
      for(var x = 0; x < this.trackWidth; x++) {
        var p = this.pixels[x+","+y];

        if(!p.color) {
          p.color = "rgba(0,0,0,1)"; //
        }

        p.el.css("background",p.color);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(x, y, 1, 1);
      
      }
    }
    
  },

  moveCursor : function(e){
    this.cursorX = Math.floor(e.offsetX / this.scaling);
    this.cursorY = Math.floor(e.offsetY / this.scaling);
    this.cursorEl.css("left",this.cursorX * this.scaling);
    this.cursorEl.css("top", this.cursorY * this.scaling);
    
    // Holds reference to all of the pixels contained in the brush right now.
    this.brushPixels = [];

    for(var i = 0; i < this.brushSize; i++) {
      for(var j = 0; j < this.brushSize; j++) {
        var x = 0 + i;
        var y = 0 + j;
        this.brushPixels.push({ x : this.cursorX + x, y : this.cursorY + y});        
      }
    }

    if(this.mouse == "down") {

      if(this.selectedTool == "pencil" || this.selectedTool ==  "eraser") {
        var totalDelta = Math.abs(this.lastPixel.x - this.cursorX) + Math.abs(this.lastPixel.y - this.cursorY);
     
        if(totalDelta > 1) {
          var from = {
            x : this.lastPixel.x,
            y : this.lastPixel.y
          }
        
          var to = {
            x : this.cursorX,
            y : this.cursorY
          }
        
          drawLine(from,to);
        }

        this.useBrush();
      } // pencil & eraser

      if(this.selectedTool == "move") {

        var deltaX = e.pageX - this.pageXStart;
        var deltaY = e.pageY - this.pageYStart;

        this.settings.viewTranslateX += deltaX / this.settings.viewScale;
        this.settings.viewTranslateY += deltaY / this.settings.viewScale;

        this.updateView();
      } // move
      
      this.pageXStart = e.pageX;
      this.pageYStart = e.pageY;


    } 
  },

  // Do a thing, I guess.
  changePixel : function(x, y, color){

    this.ctx.fillStyle = this.selectedColor;
    this.ctx.fillRect(x, y, 1, 1);

    var pixel = this.pixels[x+","+y];
    var color = pixel.color;
    
    pixel.el.css("background",this.selectedColor);
    pixel.color = this.selectedColor;
    pixel.el.removeClass("pop");
    pixel.el.width(pixel.el.width);
    pixel.el.addClass("pop");
    
    this.lastPixel = this;
  },

  setLastPixel : function(x,y) {
    
  },
  
  // Do a thing, I guess.
  updatePixel : function(x,y){

    var pixel = this.pixels[x+","+y];
    if(!pixel) {
      return;
    }

    // Drawing
    if(this.selectedTool == "pencil") {
      
      this.ctx.fillStyle = this.selectedColor;
      this.ctx.fillRect(x, y, 1, 1);
    
      var color = pixel.color;
      
      if(color != this.selectedColor) {
        pixel.el.css("background",this.selectedColor);
        pixel.color = this.selectedColor;
      }
    }
    
    // Erasing
    if(this.selectedTool == "eraser") {
      pixel.el.css("background","transparent");
      pixel.color = false;
      this.ctx.clearRect(x, y, 1, 1);
    }
    
    this.lastPixel = {
      x : this.cursorX,
      y : this.cursorY
    }
  },
  
  
  showCursor : function(){
    this.cursorEl.show();
    this.cursorVisible = true;
  },


  hideCursor : function(){
    this.cursorEl.hide();
    this.cursorVisible = false;
  },


}

function getRandom(min,max){
  return min + Math.random() * (max - min);
}
