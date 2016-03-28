 

////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var waveForm = function(p){

var track;
var peaks=[];
var canvasX = 700;
var canvasY = 400;
var x = 0;
var y = 200;
var wavHeight = 200;
var wavLength = canvasX;
var thisNum = 0;



p.preload = function(){

  track = p.loadSound(trackName);

}

p.setup = function() {

  p.createCanvas(canvasX,canvasY);
  p.background(0);

  track.setVolume(0);
  track.loop();
  
  peaks = track.getPeaks(wavLength);
  
    // draw the unplayed waveform
    for(i=0; i < peaks.length; i++){
      p.stroke(255);
      p.strokeWeight(1);
      p.line(x, y + (wavHeight * peaks[i]),x, y - (wavHeight * peaks[i]))
      x = x + 1;
    };
    
    //reset x for playback
    x = 0;
}; // end setup


p.draw = function(){

  // map the length of song to the amount of samples in peake.length  
thisNum = p.map(track.currentTime(), 0, track.duration(), 0, peaks.length)
intNum = p.int(thisNum);


  p.stroke(255);
  p.strokeWeight(2);
  p.fill(0);

 if (track.isPlaying()){

  p.fill(0);
  p.noStroke();
  p.rect(x,0, 2, canvasY);
  
  p.fill(255,255,0);
  p.stroke(0,255,255);
  p.line(x, y + (wavHeight * peaks[intNum]),x, y - (wavHeight * peaks[intNum]));
 //x = x + 1;
  x = intNum;
 }
 
 if (x == 0){
   p.waveRedraw();
 }
 
  p.fill(0);
  p.noStroke();
  p.fill(255);
 
}

p.waveRedraw = function(){
  
   for(i=0; i < peaks.length; i++){
    
      p.stroke(255);
      p.strokeWeight(1);
      p.line(x, y + (wavHeight * peaks[i]),x, y - (wavHeight * peaks[i]))
      x = x + 1;
    };
    //reset x for playback
    x = 0;
}

p.waveRestart = function() {

    console.log('restart');
    console.log(trackName);
   // track = p.loadSound(trackName);

  }



}; // waveform





