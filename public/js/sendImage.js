

function sendImage(index){  // gets called when the overlay div is clicked
	return function(){
		var image = "#iF" + index;
		$(image).fadeTo("slow", 0.5);

		if(delMode == false){  // checking to see if delete mode is active
				socket.emit(acct + ' imageFigure', imageSrcs[index]);
			} else if(delMode == true){
				socket.emit(acct + ' deleteTest', imageSrcs[index].split('/')[4]);
			};

		// WHOWHAT \\ Display who is playing which figure on top of image

		for(i=0; i < group.length; i++){
			 whoWhat['player' + group[i]] = 'iT' + index;
			};

		idOverlay();  // handling the performer numbers overlayed on the figures ( public/js/idOverlay.js )

		for (i=0; i < Object.keys(whoWhat).length; i++){
			if (whoWhat['player' + (i+1)] !== " "){
		 		document.getElementById(whoWhat['player' + (i+1)]).innerHTML += (i+1)+ " ";
		 		};
		 	};

		group = [];  // this clears the group when an image is sent
		member = 0;

		// NOTE: these two could potentially be combined?
		for (i=0; i < perfs.length; i++){  // this clears the button states when an image is sent
			$('#cp' + (i+1)).css('color', 'white');
		};

		for (i=0; i < perfs.length; i++){
			$('#cp' + (i+1)).fadeTo("fast", 1.0);
		};

		$(all).css('color', 'white');  // zeros out the 'ALL' button when a figure is sent
		$(all).fadeTo("fast", 1.0);

			// NOTE: this will be where the recBtn logic will be
		// if (recBtn == true){	
		 sessionUpdateData(whoWhat);  // creating an array of objects which logs who has received which figure over time (in sessionData.js)
		// }
	};
};