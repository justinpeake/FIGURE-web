 

////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var tempo = function( p ) {

  p.x = 50; 
  p.y = 50;
  p.fillcol = 0;
  p.count = 0;
  p.latch = false;


  p.setup = function() {
    p.createCanvas(100, 100);
  };

  p.draw = function() {
    p.background(255);
    p.noStroke();
    p.fill(p.fillcol, 0, 0);
    //p.ellipse(x,y,75,75);
    p.text(p.count, p.x, p.y);

    p.fillcol = p.fillcol + 2;

    if (p.fillcol > 255){
    p.fillcol = 0;
    p.count = p.count + 1;

    socket.emit('testCount', p.count); // sends from client, back to server

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
  var canvasX = 800;
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


//// login stuff
var introTitle = function(p){

  var opaL1 = 0, opaL2 = 0, opaL3=0, opaL4=0, opaL5=0;
  var opaF = 0, opaI = 0, opaG = 0, opaU = 0, opaR = 0, opaE = 0, opaN=0;
  var lineLength = 0;
  var img;
  var imgHeight = 100;
  var iconOpa = 200;

p.preload = function(){
  img = p.loadImage('assets/awlogoinvert.png');
  font = p.loadFont('assets/Elevation.ttf');
}

p.setup = function() {
  p.createCanvas(700,160);
  p.textFont(font);
}

p.draw=function() {
  p.background(8,3,54);
  p.textSize(100);
  p.noStroke();
  p.fill(200, opaF);
  p.text("FIGURE",170,115)
  p.fill(200, opaN);
  // p.textSize(20);
  // p.text("Login", 200, 200)
  // p.text("Sign-Up", 400, 200)
  p.strokeWeight(1);
  p.stroke(190, opaL1);
  p.line(20, 40, lineLength, 40);
  p.stroke(170, opaL2);
  p.line(20, 60, lineLength, 60);
  p.stroke(170, opaL3);
  p.line(20, 80, lineLength, 80);
  p.stroke(170, opaL4);
  p.line(20, 100, lineLength, 100);
  p.stroke(170, opaL5);
  p.line(20, 120, lineLength, 120);
 

  opaL1 = opaL1 + 2;
  opaL2 = opaL1 - 20;
  opaL3 = opaL2 - 20;
  opaL4 = opaL3 - 20;
  opaL5 = opaL4 - 10;
 
  opaF = opaL4 - 100;
  opaN = opaL4 - 180;

  if (lineLength < 680){

  lineLength = lineLength + 5;
}
 

 p.tint(0,200,0, iconOpa);
 p.image(img, 305, 25);

 iconOpa = iconOpa - 2;
  if(iconOpa < 0){
    iconOpa == 0;
  }
  }
};





