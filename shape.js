function FF_Shape() {
  this.color = "green";
  this.dimension = [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]];
  this.isWall = false;
  this.lameDuck = false;
}

FF_Shape.prototype.advance = function(distance) {
  this.dimension[1][0] -= distance * 0.3;
  this.dimension[1][1] -= distance * 0.3;
}

FF_Shape.prototype.collideWithPoint = function(x, y) {
  if ( x < this.dimension[0][0] ) return false;
  if ( x > this.dimension[0][1] ) return false;

  if ( y < this.dimension[2][0] ) return false;
  if ( y > this.dimension[2][1] ) return false;



  return true;
}


FF_Shape.prototype.init = function(posZ, color, distance) { //distance is current distance of player, to modulate
  var posX = Math.floor((Math.random() * 1000) - 500);

  //var mod = Math.max(0, (100000 - distance)) / 100000; // 1000m
 //console.log(distance);

 
  //var width = Math.floor((Math.random() * 600.0) + 10.0);
  var depth = Math.floor((Math.random() * Math.random() * Math.random() * 1600)) + 20; //1600, 20
  var bottom = Math.max( Math.floor((Math.random() * 600) - 200), 0)
  //var height = area / width;

  var area = (Math.random() * 350) * (Math.random() * 350); //350^2 //TODO: remove mod
  var height = Math.floor((Math.random() * 700) + 10);
  var width = area / height; //to prevent face-smashing
  //if(this.dimension[0][0] < -400){ this.dimension[0][1] += (-400 - this.dimension[0][0] ); this.dimension[0][0] += (-400 - this.dimension[0][0] ); } //shift over
  //if(this.dimension[0][1] >  400){ this.dimension[0][0] += (400 - this.dimension[0][1] ); this.dimension[0][1] += (400 - this.dimension[0][1] ); } //shift over
  this.dimension[0][0] = Math.max(-400, posX - width);
  this.dimension[0][1] = Math.min(400, posX + width);

  if(this.dimension[0][1] < this.dimension[0][0]) { //fix inverted shapes from clamping
  if(this.dimension[0][0] < 0) this.dimension[0][0] += 2 * (this.dimension[0][0] - this.dimension[0][1]);
  else this.dimension[0][1] -= 2 * (this.dimension[0][0] - this.dimension[0][1]);
}

  this.dimension[1][0] = posZ;
  this.dimension[1][1] = posZ + depth;
  this.dimension[2][0] = bottom;
  this.dimension[2][1] = Math.min(600, bottom + height);
  this.color = color;
}

FF_Shape.prototype.isBehindCamera = function() {
  return this.dimension[1][0] < 0.0;
}
FF_Shape.prototype.isGone = function() {
  return this.dimension[1][1] < 0.0;
}

FF_Shape.prototype.reset = function(color) {
 //this.init((Math.random() * 3000) + 3000, color);
  //this.init(3000.0 - (this.dimension[1][0] % 3000), color);
  this.init(3000.0 + (this.dimension[1][0]% 3000), color); //OLD ONE

 //TODO: Dynamically add shapes instead of just resetting to solve sudden popin after removal of deep shapes
  //flip flop between two sets?
 //The old method is the best generation
 //Or delay by one wave
}

FF_Shape.prototype.wallreset = function(color) {
   this.dimension[1][0] += 4000; //TODO: clean this shit up
   this.dimension[1][1] += 4000;
  
}


