function FF_Camera(ratio) {
  this.far = 500.0;
  this.position = [0.0, 100.0];
  this.projectedCoords = [[0, 0, 0, 0], [0, 0, 0, 0]];
  this.iswall = false;
}

FF_Camera.prototype.projectShape = function(shape) {
  this.projectedCoords[0][0] = this.projectedCoords[0][1] = shape.dimension[0][0] - this.position[0];
  this.projectedCoords[0][2] = this.projectedCoords[0][3] = shape.dimension[0][1] - this.position[0];

  this.projectedCoords[1][0] = this.projectedCoords[1][1] = shape.dimension[2][0] -this.position[1];
  this.projectedCoords[1][2] = this.projectedCoords[1][3] = shape.dimension[2][1] - this.position[1];

  var scalar = this.far / shape.dimension[1][0];


 if(scalar < 0){
  scalar = 1000;
}

  this.projectedCoords[0][0] *=  scalar;
  this.projectedCoords[0][2] *=  scalar;
  this.projectedCoords[1][0] *= -scalar;
  this.projectedCoords[1][2] *= -scalar;


  scalar = this.far / shape.dimension[1][1];

  this.projectedCoords[0][1] *=  scalar;
  this.projectedCoords[0][3] *=  scalar;
  this.projectedCoords[1][1] *= -scalar;
  this.projectedCoords[1][3] *= -scalar;
}

FF_Camera.prototype.setRatio = function(ratio) {
  this.far = 250.0 * ratio; //was 500
}




function FF_Canvas(canvasId, width, height) {
  this.backgroundColor = "#000";
  this.camera = new FF_Camera();
  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext("2d");
  this.offsetX;
  this.offsetY;
  this.splashMessage = new FF_SplashMessage();
  this.achievementMessages = new FF_SplashMessageQueue();
  this.textColor = "#FF0";
  
  this.setSize(width, height);
}


FF_Canvas.prototype.clearScreen = function() {
  this.context.fillStyle = this.backgroundColor;
  this.context.globalAlpha = 1.0;
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

FF_Canvas.prototype.drawInfo = function(distance, time, speed) {
  this.context.globalAlpha = 1.0;
  this.context.fillStyle = this.textColor;
  this.setContextFont(15);
  this.context.textAlign = 'left';
  this.drawText(this.replaceText(words[9], speed), 25, 520);
  this.drawText(this.replaceText(words[10], transformTime(time)), 25, 540);

  this.context.textAlign = 'center';
  this.drawText(words[11], 400, 25);
  this.setContextFont(25);
  this.drawText(this.replaceText(words[1], transformDistance(distance)), 400, 50);
}

FF_Canvas.prototype.drawLine = function(x1, y1, x2, y2) {
  this.context.beginPath();
  this.context.moveTo(this.camera.projectedCoords[0][x1] + this.offsetX, this.camera.projectedCoords[1][y1] + this.offsetY);
  this.context.lineTo(this.camera.projectedCoords[0][x2] + this.offsetX, this.camera.projectedCoords[1][y2] + this.offsetY);
  this.context.stroke();  
}

FF_Canvas.prototype.drawShape = function(shape) {
//if(!shape.isBehindCamera()){
 this.camera.projectShape(shape);
  var bright = (3000 - shape.dimension[1][0]) / 3000; 
  var alpha = bright;//1.0;
  if ( shape.dimension[1][0] > 3000.0 ) alpha = 0.0;
  if ( shape.dimension[1][0] < 0.0 ) alpha = 1.0;

 if(shape.isWall) alpha = alpha * 0.2;

  this.context.strokeStyle = shape.color;
  this.context.globalAlpha = alpha;
  this.context.lineWidth = bright * 1.5;//Math.max(1, alpha * 2);	


  if(!shape.isWall){ //front face !shape.isBehindCamera() || 


  this.drawLine(0, 2, 0, 0); 
  this.drawLine(0, 2, 2, 2); 
  this.drawLine(2, 0, 0, 0); 
  this.drawLine(2, 0, 2, 2);
}


  this.drawLine(0, 2, 1, 3);

  
  this.drawLine(2, 0, 3, 1);


  this.drawLine(3, 3, 1, 3); 
  this.drawLine(3, 3, 3, 1);  
  this.drawLine(3, 3, 2, 2);

  this.drawLine(1, 1, 1, 3); 
  this.drawLine(1, 1, 3, 1); 
  this.drawLine(1, 1, 0, 0); 

}

FF_Canvas.prototype.drawSplashMessage = function(time) {
  if ( this.splashMessage.time <= 0 ) return; 
  this.context.globalAlpha = this.splashMessage.getAlpha();
  this.context.fillStyle = this.textColor;
  this.context.textAlign = 'center';
  this.setContextFont(40);
  this.drawText(this.splashMessage.text, 400, 250);
  this.splashMessage.advance(time);
}

FF_Canvas.prototype.drawAchievementMessage = function(time) {
  if ( this.achievementMessages.messages.length <= 0 ) return; 
  this.context.globalAlpha = this.achievementMessages.messages[0].getAlpha();
  this.context.fillStyle = this.textColor;
  this.context.textAlign = 'center';
  this.setContextFont(30);
  this.drawText("Achievement unlocked", 400, 400);
  this.setContextFont(25);
  this.drawText(this.achievementMessages.messages[0].text, 400, 430);
  this.achievementMessages.advance(time);
}

FF_Canvas.prototype.drawText = function(text, posX, posY) {
  this.context.fillText(text, this.transform(posX), this.transform(posY));
}

FF_Canvas.prototype.drawTitleInfo = function(distance) {
  this.context.globalAlpha = 1.0;
  this.context.fillStyle = this.textColor;
  this.context.textAlign = 'center';
  this.setContextFont(15);
  this.drawText(words[0], 400, 25);
  this.setContextFont(25);
  this.drawText(this.replaceText(words[1], transformDistance(distance)), 400 , 50);

  this.setContextFont(60);
  this.drawText(words[2], 400, 200);
  this.setContextFont(20);
  //this.drawText(words[3], 400, 230); lol
  this.setContextFont(25);
  this.drawText(words[4], 400, 350);
}

FF_Canvas.prototype.replaceText = function(){

var text = arguments[0];
for(var i = 1; i < arguments.length; i++){
       text = text.replace("$" + i, arguments[i]);
	}
return text;

}

FF_Canvas.prototype.deltaCameraPosition = function(deltaX, deltaY) {
this.setCameraPosition(this.camera.position[0] + deltaX, this.camera.position[1] + deltaY);

}


FF_Canvas.prototype.setCameraPosition = function(eventX, eventY) {
  var pos = eventX - this.canvas.offsetLeft;
  if      ( pos < 0 )                 pos = 0 ;
  else if ( pos > this.canvas.width ) pos = this.canvas.width;
  this.camera.position[0] = (pos - this.offsetX) / this.ratio;
  
  pos = eventY - this.canvas.offsetTop;
  if      ( pos < 0 )                  pos = 0 ;
  else if ( pos > this.canvas.height ) pos = this.canvas.height;
  this.camera.position[1] = (this.canvas.height - pos) / this.ratio;
}

FF_Canvas.prototype.setContextFont = function(size) {
  this.context.font = this.transform(size) + 'px monospace'; 
}

FF_Canvas.prototype.setSize = function(width, height) {
  var heightWidth = height * 4.0 / 3.0;
  if ( width < heightWidth ) {
    this.canvas.width = width;
	this.canvas.height = width * 0.75;
  } else {
    this.canvas.width = heightWidth;
	this.canvas.height = height;
  }
    
  this.offsetX = this.canvas.width  / 2.0;
  this.offsetY = this.canvas.height / 2.0;
  this.ratio = this.canvas.width / 800.0;
  this.camera.setRatio(this.ratio);
}

FF_Canvas.prototype.showSplashMessage = function(message, duration) {
  this.splashMessage.setMessage(message, duration);
}

FF_Canvas.prototype.showAchievementMessage = function(message, duration) {
  this.achievementMessages.push(message, duration);
}

FF_Canvas.prototype.transform = function(coord) {
  return this.ratio * coord; 
}
