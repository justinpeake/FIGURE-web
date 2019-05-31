// SessionDats is used to record the progression of a performance.

var sessionData = [];


// this gets called in conductor.html when a figure is sent.
function sessionUpdateData(input){
    var now = new Date();
    var time = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
       
    sessionData.push(time, input); // adds a time stamp and then shows the current state of all performers.

    console.log("SessionData = "+ sessionData);

}



