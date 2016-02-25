var s = function( p ) {

  var x = 100; 
  var y = 100;

  p.setup = function() {
    p.createCanvas(300, 300);
  };

  p.draw = function() {
    p.background(0);
    p.fill(255);
    p.rect(x,y,50,50);
  };
};





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