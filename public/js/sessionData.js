// SessionData is used to record the progression of a performance.

var sessionData = [];  // emmpty array for timestamp and performer/figure combos (to be sent around app for logging)
var imageNames = [];  // empty array to hold image names derived from urls
var videoNames = [];  // empty array to hold video names from URLs

var figureArray = []; // empty array to hold ALL figures

// this is getting the actual figure names from db
function cleanImageNames(inputArray){ 
 for(i= 0; i < inputArray.length; i++){
    imageNames[i] = inputArray[i].split('/')[4]
 }
    figureArray.push(imageNames); // images will be index "0" of figureArray
}                                                      

// this is getting the actual figure names from db
function cleanVideoNames(inputArray){
 for(i= 0; i < inputArray.length; i++){
    videoNames[i] = inputArray[i].split('/')[4]
 }
    figureArray.push(videoNames); // videos will be index "1" of figureArray
}

// still need to incorporate into below


// this gets called in conductor.html when a figure is sent.
// "input" is expecting an object called whoWhom in conductor.html

function sessionUpdateData(input){
    var now = new Date();
    var time = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();  // create a new timestamp
    
    var objClone = Object.assign({},input) // need to "shallow clone" the incoming object so it's not passed by reference
        for (i=0; i < Object.keys(objClone).length; i++){  // this loop was copied from similar code in conductor.html
            objClone['player' + (i+1)] = imageNames[objClone['player' + (i+1)].slice(2)];  //slicing off the number of the image from whoWhat and using it as an index to the filename array.
        };
     sessionData.push(time,objClone); // adds a time stamp and then shows the current state of all performers
     console.log(sessionData);
}







