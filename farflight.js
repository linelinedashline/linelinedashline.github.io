//Farflight v2
//original by Edwin Rodríguez, modified by _-__
//MIT license



FF_Game.prototype.drawGameOverMessage = function(distance, time) { 

  
  this.canvas.context.textAlign = 'center';
  this.canvas.setContextFont(40);
  this.canvas.drawText(words[5], 400, 250);
  this.canvas.setContextFont(25);
  this.canvas.drawText(words[6], 400, 280);
  this.canvas.drawText(words[7], 400, 350);
  this.canvas.setContextFont(15);
  this.canvas.drawText(this.canvas.replaceText(words[8], transformDistance(distance), transformTime(time), this.getScore() ), 400, 300);   
}

transformDistance = function(distance) {
  return distance / 100 << 0;
}

transformTime = function(time) {
  return time / 100 << 0;
}

FF_Game.prototype.getScore = function() {
 var d = this.values.currentDistance / 100;
 var s = Math.max(1, this.values.currentTime / 100);
 return Math.floor((1/100) * d * (d/s)); //distance times speed //used to be distance * log(speed)
}


function FF_Timer(interval) {
  this.now = Date.now();
  this.then = this.now;
  this.delta = 0;
  this.interval = interval;
}

FF_Timer.prototype.advance = function() {
  this.now = Date.now();
  this.delta = this.now - this.then;
  if ( this.delta > this.interval ) {
    this.then = this.now;
    return true;
  }
  return false;
}

function FF_ScreenTheme(title, backgroundColor, textColor, shapeColor) {
  this.title = title;
  this.backgroundColor = backgroundColor;
  this.shapeColor = shapeColor;
  this.textColor = textColor;
}

function FF_GameValues() {
  this.bestDistance = 0;//parseInt(window.localStorage.getItem("ff-values-best-score")) || 0;
  this.currentDistance = 0;
  this.currentTime = 0;
  this.currentSpeed = 10.0;
  this.currentLevel = 0;
  this.totalDistance = 0;//parseFloat(window.localStorage.getItem("ff-values-total-distance")) || 0;
  this.totalTime = 0;//parseFloat(window.localStorage.getItem("ff-values-total-time")) || 0;
  this.totalDeaths = 0;//parseInt(window.localStorage.getItem("ff-values-total-deaths")) || 0;
}

FF_GameValues.prototype.reset = function() {
  this.bestDistance = 0;
  this.totalDistance = 0;
  this.totalTime = 0;
  this.totalDeaths = 0;
}

function FF_Game(canvasId, width, height) {  //MARK: decl
  this.values = new FF_GameValues();

  this.bestDistanceBeated = false;

  this.gameState = 0; //0: TITLE, 1:GAME, 2:GAMEOVER
  this.shapes = [];
  this.walls = [];
  this.numShapes = 0;

  this.canvas = new FF_Canvas(canvasId, width, height);
  this.tutorialCounter = 0;

  this.actTimer = new FF_Timer(0);
  this.drawTimer = new FF_Timer(15);

  this.titleTheme = new FF_ScreenTheme("", "#000" , "#FF0", function() {
    var color =  Math.floor((Math.random() * 360));
    return "hsl("+ color +", 100%, 50%)";
  });

  this.gameOverTheme = new FF_ScreenTheme("", "#700" , "#FF0", function() {
    var color =  Math.floor((Math.random() * 360));
    return "hsl("+ color +", 100%, 50%)";
  });
  
  this.currentDistanceAchievements = FF_Achievement.getCurrentDistanceAchievements();
  this.currentTimeAchievements = FF_Achievement.getCurrentTimeAchievements();
  this.speedStartAchievements = FF_Achievement.getSpeedStartAchievements();

  this.levelCounter = 0;

  this.touchStart = 0;

  this.currentTheme = this.titleTheme;

  this.init();
}

FF_Game.prototype.accel = function(s) {
  this.values.currentSpeed += s * 10.0;
  this.canvas.showSplashMessage(words[12], 500);
}

FF_Game.prototype.advance = function() {


//BEGIN POOR CODE --------------------------- 
/*
var oldlock = lock;
                    if (document.pointerLockElement === canvas ||
                document.mozPointerLockElement === canvas ||
                document.webkitPointerLockElement === canvas) lock = true; 
 else lock = false;  


 if(!oldlock && lock){ //locked pointer
alert('locked');
 //document.removeEventListener("mousemove", a, false);
 this.canvas.canvas.addEventListener("mousemove", function(event) {
			 //does not work, TODO: FIX
        var movementX = event.movementX ||
                event.mozMovementX ||
                event.webkitMovementX ||
                0;

        var movementY = event.movementY ||
                event.mozMovementY ||
                event.webkitMovementY ||
                0;

    //canvas.setCameraPosition(event.pageX, event.pageY);
  //this.canvas.CameraPosition(event.movementX, event.movementY);
    }, false);

} 

*/
//TODO:FIX AND CLEAN ----------------------------------------------- END POOR CODE





this.actTimer.advance();
  var timeRatio = (this.actTimer.delta / 10.0);
  var currentSpeed = this.values.currentSpeed * timeRatio;
  var shape;


  for ( var i = 0 ; i < this.shapes.length ; i++ ) {
    shape = this.shapes[i];
    shape.advance(currentSpeed);
    if ( shape.isBehindCamera()) { //front edge behind camera, add new shape now
      if ( this.gameState == 1 && shape.collideWithPoint(this.canvas.camera.position[0],this.canvas.camera.position[1] ) ){
        this.setGameOver();}
      if(!shape.lameDuck) {this.addShapes(1, false); shape.lameDuck = true;}
    }
    if (shape.isGone()){ //all behind camera
      this.delShape(i, false);
      //this.shapes.splice(i,1); //delete the shape
      //shape.reset(this.getShapeColor());
    }
  }


  for ( var i = 0 ; i < this.walls.length ; i++ ) {
     shape = this.walls[i];
    shape.advance(currentSpeed);
    if (shape.isGone()){ //all behind camera 
      shape.wallreset(shape.color);
    }
}
  
  if ( this.gameState == 1 ) {
    if ( this.values.currentSpeed <= 10.0 ) {
		if ( this.tutorialCounter == 2 && this.values.currentTime > 700.0 ) {
		  this.canvas.showSplashMessage(words[13], 1500);
		  this.tutorialCounter++;
		} else if ( this.tutorialCounter == 1 && this.values.currentTime > 400.0 ) {
		  this.canvas.showSplashMessage(words[14], 1500);
		  this.tutorialCounter++;
		} else if ( this.tutorialCounter == 0 && this.values.currentTime > 100.0 ) {
		  this.canvas.showSplashMessage(words[15], 1500);
		  this.tutorialCounter++;
		}
	}
	if ( this.values.currentTime <= 1000.0 )
	  this.checkAchievements(this.speedStartAchievements);
      //No involuntary speedups, it's an accomplishment to survive past 5000m at 30m/s
    if ( this.values.bestDistance > 0.0 && !this.bestDistanceBeated && this.values.currentDistance > this.values.bestDistance) {
      this.canvas.showSplashMessage(words[16], 1500);
      this.bestDistanceBeated = true;
    }
	this.checkAchievements(this.currentDistanceAchievements);
	this.checkAchievements(this.currentTimeAchievements);
    if ( (this.levelCounter + 1) * 50000 < this.values.currentDistance ) { //500 m
	  this.levelCounter++;
	  this.addShapes(4, true); //MARK: Addition //TODO:FIX
      console.log('numshapes=' + this.numShapes + 'shapes.length=' + this.shapes.length);
      //this.setLevelScreenTheme(Math.floor((Math.random()*this.levelThemes.length)));
	}
    this.values.currentDistance += currentSpeed;
	this.values.totalDistance += currentSpeed;
    this.values.currentTime += timeRatio;
	this.values.totalTime += timeRatio;
  }
}

FF_Game.prototype.checkAchievements = function(array) {
  for ( var i = 0 ; i < array.length ; i++ )
	if ( array[i].isAchieved(this.values) ) {
	  array[i].achieve();
	  this.canvas.showAchievementMessage(array[i].name, 2500);
	}
}

FF_Game.prototype.draw = function() {
  if ( this.drawTimer.advance() ) {
    this.canvas.clearScreen();
    for ( var i = 0 ; i < this.shapes.length ; i++ )
      this.canvas.drawShape(this.shapes[i]);
    for ( var i = 0 ; i < this.walls.length ; i++ )
      this.canvas.drawShape(this.walls[i]);


    
    if ( this.gameState == 1 ) {
      this.canvas.drawInfo(this.values.currentDistance, this.values.currentTime, this.values.currentSpeed);
      this.canvas.drawSplashMessage(this.drawTimer.delta);
    } else if ( this.gameState == 2 ) {
      this.canvas.drawInfo(this.values.currentDistance, this.values.currentTime, this.values.currentSpeed);
      this.drawGameOverMessage(this.values.currentDistance, this.values.currentTime, this.values.currentSpeed);
	} else {
      this.canvas.drawTitleInfo(this.values.bestDistance);
    }
    this.canvas.drawAchievementMessage(this.drawTimer.delta);	
  }
}

FF_Game.prototype.getShapeColor = function() {
  return this.currentTheme.shapeColor(this.values.currentDistance);
}

FF_Game.prototype.init = function() {
  this.initShapes();
  this.initWalls();

  var canvas = this.canvas;
  var game = this; 

  var touchAvailable = ('ontouchstart' in window) ? true : false;

  if ( !touchAvailable) {







 // if(lock){
    

//}
//else{ //no lock, no touch

    canvas.canvas.addEventListener("mousemove", function(event) {

    canvas.setCameraPosition(event.pageX, event.pageY);
    }, false);
//}

    canvas.canvas.addEventListener("mousedown", function(event) { game.pressButton(event.button); }, false);
  } 


else { //touch
    canvas.canvas.addEventListener('touchstart', function(e) {
      this.touchStart = Date.now();
      canvas.setCameraPosition(touchObj.pageX, touchObj.pageY);
      e.preventDefault()
    }, false);

    canvas.canvas.addEventListener('touchmove', function(e){
      if ( Date.now() - this.touchStart > 100) {
        var touchObj = e.changedTouches[0];
        canvas.setCameraPosition(touchObj.pageX, touchObj.pageY);
      }
      e.preventDefault()
    }, false);

    canvas.canvas.addEventListener('touchend', function(e){
      if ( Date.now() - this.touchStart <= 100)
        game.pressButton();
      e.preventDefault()
    }, false);
  }

  setInterval( function() { game.advance(); }, 10);


  var requestAnimationFrame = window.requestAnimationFrame || 
                              window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame ||
                              function (f) { window.setTimeout(function () { f(Date.now()); }, 1000/60); };


  function draw() {
    requestAnimationFrame(draw);
    game.draw();
  }

  requestAnimationFrame(draw);
}

FF_Game.prototype.initShapes = function() {
 this.shapes = [];
 this.numShapes = 0;
 /*shape1 = new FF_Shape();             //render test shapes
 shape1.init(3000, this.getShapeColor());
 shape1.dimension[1][1] = shape1.dimension[1][0] + 20;

 shape2 = new FF_Shape();
 shape2.init(3000, this.getShapeColor());
 shape2.dimension[1][1] = shape1.dimension[1][0] + 6000;
 
 this.shapes[0] = shape1;
 this.shapes[1]= shape2;*/
 


 this.addShapes(12, true);// 12  ); //MARK: initshapes
}

FF_Game.prototype.initWalls = function() {
var depth = 1000;

for(var i = 0; i * depth < 4000; i++){
	 shape = new FF_Shape();
	 shape.dimension[0][0] = -400;
	shape.dimension[0][1] = 400;
	 shape.dimension[2][0] = 0;
	shape.dimension[2][1] = 600;
   shape.dimension[1][0] = i * depth + 0.1;
   shape.dimension[1][1] = (i+1) * depth;
   shape.isWall = true;

 shape.color = "green";
	 this.walls[i] = shape;
}




}

FF_Game.prototype.delShape = function(i, real) {
   if(real) this.numShapes -= 1;
   this.shapes.splice(i, 1);
}

FF_Game.prototype.addShapes = function(num, real) {
 //if real is false, add a shape but don't increment number of shapes, it's just a replacement
  var step = 3000.0 / 20;
  var shape;
 var len = this.shapes.length;
 for( var i = 0; i < num; i++){
    shape = new FF_Shape();
    //if(real) console.log('i=' + i + 'numShapes=' + this.numShapes +' dist=' + Math.floor(3000.0 + (step * (i + this.numShapes))) );
    //else console.log('i=' + i + 'numShapes=' + this.numShapes +' dist=' + Math.floor(3000.0 + (step * (i))) );
    //shape.init(3000, this.getShapeColor());

    //shape.init(3000.0 - step * (i) + 1500, this.getShapeColor()); //uncomment for waves instead of continuous - makes it easier

   if(real) shape.init(Math.floor(3000.0 + (step * (i + this.numShapes))), this.getShapeColor(),  this.values.currentDistance ); 
   else shape.init(Math.floor(3000.0 + (step * (i))), this.getShapeColor(),  this.values.currentDistance );
    this.shapes[i + len] = shape;
}

  if(real) this.numShapes += num;

}

FF_Game.prototype.pressButton = function(button) {
 if(button == 0){

  if      ( this.gameState == 1 ) this.accel(1);
  else if ( this.gameState == 2 ) this.setGameTitle();
  else                            this.setGameStart();

}
//else if (button == 1) this.accel(-1); //middle mouse
}

FF_Game.prototype.resetStats = function() {
  FF_Canvas.reset(this.currentDistanceAchievements);
  FF_Achievement.reset(this.currentTimeAchievements);
  FF_Achievement.reset(this.speedStartAchievements);
  this.values.reset();
}

FF_Game.prototype.setGameOver = function() {
  this.gameState = 2;
  this.bestDistanceBeated = false;
  this.values.totalDeaths++;
  if ( this.values.currentDistance > this.values.bestDistance ) {
    this.values.bestDistance = this.values.currentDistance;
  }
  this.setScreenTheme(this.gameOverTheme);
}

FF_Game.prototype.setGameStart = function() {
  this.gameState = 1;
  this.values.currentDistance = 0;
  this.values.currentTime = 0;
  this.values.currentSpeed = 10.0;
  this.tutorialCounter = 0;
  this.values.currentLevel = -1;
  //this.setLevelScreenTheme(0);
}

FF_Game.prototype.setGameTitle = function() {
  this.gameState = 0;
  this.values.currentSpeed = 10.0;  
  this.setScreenTheme(this.titleTheme);
  this.initShapes();
}

FF_Game.prototype.setSize = function(width, height) {
 console.log(width + ' ' + height);
  this.canvas.setSize(width, height);
}

FF_Game.prototype.setScreenTheme = function(theme) {
  this.canvas.backgroundColor = theme.backgroundColor;
  this.canvas.showSplashMessage(theme.title, 1500);
  this.canvas.textColor = theme.textColor;
  this.currentTheme = theme;
  for ( var i = 0 ; i < this.shapes.length ; i++ )
    this.shapes[i].color = this.getShapeColor();
}

FF_Game.prototype.setLevelScreenTheme = function(level) {
  if ( this.values.currentLevel == level ) level++;
  this.values.currentLevel = level;
  this.setScreenTheme(this.levelThemes[level % this.levelThemes.length]);
}



FF_Game.prototype.setShapeMode = function(mode){
//gratings
//pinch
//regular blocks
//field of small ones
//maze
//fractal divider (deep grating with blocked holes)


}
