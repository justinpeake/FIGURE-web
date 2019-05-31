// SessionData is used to record the progression of a performance.

var sessionData = [];
var imageNames = [];

// this is getting the actual figure names from db
function cleanImageNames(inputArray){
    for(i= 0; i < inputArray.length; i++){
        imageNames[i] = inputArray[i].split('/')[4]
    }
     console.log(imageNames);
}

// this gets called in conductor.html when a figure is sent.
// "input" is expecting an object called whoWhom in conductor.html

function sessionUpdateData(input){

    // create a new timestamp
    var now = new Date();
    var time = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

    // need to shallow clone object so it's not by reference
    var objClone = Object.assign({},input)

    // this loop was copied from similar code in conductor.html

    for (i=0; i < Object.keys(objClone).length; i++){

          //slicing off the number of the image from whoWhat and using it as an index to the filename array.
          objClone['player' + (i+1)] = imageNames[objClone['player' + (i+1)].slice(2)];  
    };

     // adds a time stamp and then shows the current state of all performers.ç
     sessionData.push(time,objClone);

     // ^ this "sessionData" array can be sent to database or text file for recording
}





