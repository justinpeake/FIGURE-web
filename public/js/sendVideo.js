	
	function sendVideo(index){  // gets called when overlay div is clicked
		return function(){
			var video = "#vF" + index;
			$("#vF" + index).fadeTo("slow", 0.5);

			if(delMode == false){  // checking to see if delete mode is active
				socket.emit(acct + ' videoFigure', videoSrcs[index])
			} else if(delMode == true){
				socket.emit(acct + ' deleteTest', videoSrcs[index].split('/')[4]); // NOTE: need to test this for videos
			};

			// more whoWhat for video
		for(i=0; i < group.length; i++){
			 whoWhat['player' + group[i]] = 'vT' + index;
			};

		idOverlay();  // handling the performer numbers overlayed on the figures ( public/js/idOverlay.js )

		for (i=0; i < Object.keys(whoWhat).length; i++){
			if (whoWhat['player' + (i+1)] !== " "){
		 		document.getElementById(whoWhat['player' + (i+1)]).innerHTML += (i+1)+ " ";
		 		};
		 	};
			
			// adding
					group = [];
					member = 0;

					// this clears the button states when an image is sent
					for (i=0; i < perfs.length; i++){
						$('#cp' + (i+1)).css('color', 'white');
					};

					for (i=0; i < perfs.length; i++){
						$('#cp' + (i+1)).fadeTo("fast", 1.0);
					};

					// zeros out the 'ALL' button when a figure is sent
					$(all).css('color', 'white');
					$(all).fadeTo("fast", 1.0);

					sessionUpdateData(whoWhat);
		};
	};