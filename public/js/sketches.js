
var staffPage = function ( p ){

  p.setup = function() {
    p.createCanvas(displayWidth, displayHeight);

  };

  p.draw = function() {


  }



};


/////////////////////////////

var tempo = function( p ) {

  var x = 50; 
  var y = 50;
  var fill = 0;

  p.setup = function() {
    p.createCanvas(100, 100);
  };

  p.draw = function() {
    p.background(255);
    p.noStroke();
    p.fill(fill, 0, 0);
    p.ellipse(x,y,75,75);

    fill = fill + 5;

    if (fill > 255){
    fill = 0;
    }
  };
};


/////////////////////////////

var q = function( p ) {

  var x = 100; 
  var y = 100;

  p.setup = function() {
    p.createCanvas(300, 300);
  };

  p.draw = function() {
    p.background(255);
    p.fill(0);
    p.rect(x,y,50,50);
  };
};


/////////////////////////////

var time = function( p ) {

  var x = 100; 
  var y = 100;
  var speed = .7;
  
  p.setup = function() {
    p.createCanvas(800, 200);
  };

  p.draw = function() {
    p.background(255);
    p.fill(0);
    p.rect(x,y,1,90);
    x = x + speed;
     if (x > 800){
      x = 0;
      }
  };
};


/////////////////////////////

var tacet= function( p ) {

  var x = 100; 
  var y = 100;
  
  
  p.setup = function() {
    p.createCanvas(800, 800);
  };

  p.draw = function() {
    p.background(170);
    p.fill(0);
    p.rect(x,y,1,90);
  
  };
};
